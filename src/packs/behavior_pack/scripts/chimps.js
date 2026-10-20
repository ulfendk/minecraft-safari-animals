// Chimps throw fruit at whoever hurts one of their group.
import { system, world } from '@minecraft/server';
import { isBaby, isCarcass } from './util.js';

const angry = new Map(); // chimp id -> { target, until }

function onHurt({ hurtEntity, damageSource }) {
  const attacker = damageSource?.damagingEntity;
  if (hurtEntity?.typeId !== 'safari:chimpanzee' || attacker?.typeId !== 'minecraft:player') return;
  const until = system.currentTick + 300;
  for (const c of hurtEntity.dimension.getEntities({ type: 'safari:chimpanzee', location: hurtEntity.location, maxDistance: 12 })) {
    if (!isCarcass(c)) angry.set(c.id, { target: attacker, until });
  }
}

function throwFruit() {
  const now = system.currentTick;
  for (const [id, { target, until }] of angry) {
    const chimp = world.getEntity(id);
    if (!chimp || now > until || !target?.isValid || isCarcass(chimp)) {
      angry.delete(id);
      continue;
    }
    if (isBaby(chimp) || Math.random() > 0.5) continue;
    const from = { x: chimp.location.x, y: chimp.location.y + 1.2, z: chimp.location.z };
    const to = target.location;
    const d = { x: to.x - from.x, y: to.y + 1.4 - from.y, z: to.z - from.z };
    const dist = Math.hypot(d.x, d.y, d.z);
    if (dist > 14 || dist < 2) continue;
    try {
      chimp.playAnimation('animation.safari.chimpanzee.throw');
      const fruit = chimp.dimension.spawnEntity('safari:thrown_fruit', from);
      const projectile = fruit.getComponent('minecraft:projectile');
      projectile.owner = chimp;
      const speed = 0.9;
      projectile.shoot({ x: (d.x / dist) * speed, y: (d.y / dist) * speed + dist * 0.02, z: (d.z / dist) * speed });
      chimp.dimension.playSound('mob.panda.idle', chimp.location, { pitch: 1.6 });
    } catch {
      // Unloaded or blocked.
    }
  }
}

export function setupChimps() {
  world.afterEvents.entityHurt.subscribe(onHurt);
  system.runInterval(throwFruit, 25);
}
