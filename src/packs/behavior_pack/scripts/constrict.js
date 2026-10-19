// Constrictors (the anaconda) wrap themselves around what they bite: the snake
// stays wrapped around its victim, which can barely move, and squeezes it
// every second until it dies, escapes or the snake lets go.
import { system, world } from '@minecraft/server';
import { ANIMALS } from './data.js';

const CONSTRICTORS = new Set(ANIMALS.filter((a) => a.constricts).map((a) => `safari:${a.id}`));
const HOLD_TICKS = 160;
const SQUEEZE_EVERY = 20;
const STEP = 2;

/** snake id -> { snake, victim, ticks } */
const coils = new Map();

function release(id, entry) {
  coils.delete(id);
  try {
    if (entry.snake.isValid) entry.snake.triggerEvent('safari:uncoil');
  } catch {}
}

function squeeze(id, entry) {
  const { snake, victim } = entry;
  if (!snake.isValid || !victim.isValid) return release(id, entry);
  const health = victim.getComponent('minecraft:health');
  entry.ticks -= STEP;
  const away = Math.hypot(victim.location.x - snake.location.x, victim.location.z - snake.location.z);
  if (entry.ticks <= 0 || !health || health.currentValue <= 0 || victim.dimension.id !== snake.dimension.id || away > 4) {
    return release(id, entry);
  }
  snake.teleport(victim.location, { keepVelocity: false });
  victim.addEffect('slowness', 10, { amplifier: 5, showParticles: false });
  if (victim.typeId !== 'minecraft:player') victim.clearVelocity?.();
  if (entry.ticks % SQUEEZE_EVERY === 0) {
    victim.applyDamage(Math.max(1, Math.round((entry.damage ?? 4) / 2)), { cause: 'entityAttack', damagingEntity: snake });
    snake.dimension.playSound('mob.slime.big', snake.location, { pitch: 0.5, volume: 1 });
  }
}

export function setupConstrictors() {
  world.afterEvents.entityHurt.subscribe(({ hurtEntity, damageSource }) => {
    const snake = damageSource.damagingEntity;
    if (!snake || !CONSTRICTORS.has(snake.typeId) || damageSource.cause !== 'entityAttack') return;
    if (coils.has(snake.id) || !hurtEntity.isValid) return;
    if ([...coils.values()].some((c) => c.victim.id === hurtEntity.id)) return;
    coils.set(snake.id, { snake, victim: hurtEntity, ticks: HOLD_TICKS });
    snake.triggerEvent('safari:coil');
    snake.teleport(hurtEntity.location);
  });
  world.afterEvents.entityDie.subscribe(({ deadEntity }) => {
    for (const [id, entry] of coils) {
      if (entry.snake.id === deadEntity.id || entry.victim.id === deadEntity.id) release(id, entry);
    }
  });
  system.runInterval(() => {
    for (const [id, entry] of [...coils]) {
      try {
        squeeze(id, entry);
      } catch {
        release(id, entry);
      }
    }
  }, STEP);
}
