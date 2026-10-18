// Behaviours that entity JSON alone can't express: calls and displays,
// meerkat sentries, baboon food thieves, vultures gathering at carcasses.
import { ItemStack, system, world } from '@minecraft/server';
import { chance, isBaby, nearPlayers, ready } from './util.js';

const TICK = 40; // run every 2 seconds

function play(entity, anim, sound, pitch = 1, volume = 1.5) {
  try {
    entity.playAnimation(`animation.safari.${entity.typeId.split(':')[1]}.${anim}`, { blendOutTime: 0.3 });
    if (sound) entity.dimension.playSound(sound, entity.location, { pitch, volume });
  } catch {
    // Entity unloaded between query and use.
  }
}

function calls(now) {
  for (const lion of nearPlayers('safari:lion', 64)) {
    if (!isBaby(lion) && chance(0.02) && ready(lion, 'roar', 600, now)) play(lion, 'roar', 'mob.ravager.roar', 0.55, 3);
  }
  for (const tiger of nearPlayers('safari:tiger', 48)) {
    if (!isBaby(tiger) && chance(0.01) && ready(tiger, 'roar', 800, now)) play(tiger, 'roar', 'mob.ravager.roar', 0.65, 2.5);
  }
  for (const el of nearPlayers('safari:elephant', 64)) {
    if (chance(0.015) && ready(el, 'trumpet', 600, now)) play(el, 'trumpet', 'mob.ravager.roar', 1.6, 3);
  }
}

/** Gorillas warn players who come close by beating their chest. Hippos yawn at swimmers. */
function displays(now) {
  for (const g of nearPlayers('safari:gorilla', 16)) {
    if (isBaby(g)) continue;
    const close = g.dimension.getPlayers({ location: g.location, maxDistance: 6 });
    if (close.length && ready(g, 'beat', 300, now)) play(g, 'chest_beat', 'mob.panda.idle.aggressive', 0.6, 2);
  }
  for (const h of nearPlayers('safari:hippo', 16)) {
    const swimmers = h.dimension.getPlayers({ location: h.location, maxDistance: 10 }).filter((p) => p.isInWater);
    if (swimmers.length && ready(h, 'yawn', 400, now)) play(h, 'yawn', 'mob.hoglin.angry', 0.5, 2);
  }
  for (const g of nearPlayers('safari:gazelle', 32)) {
    const v = g.getVelocity();
    if (Math.hypot(v.x, v.z) > 0.25 && chance(0.25) && ready(g, 'pronk', 60, now)) play(g, 'pronk');
  }
}

/** In every meerkat group one member stands guard and squeaks when danger comes near. */
const DANGER = ['safari:lion', 'safari:leopard', 'safari:hyena', 'safari:cheetah', 'safari:wild_dog', 'minecraft:player'];
function sentries(now) {
  const meerkats = nearPlayers('safari:meerkat', 48);
  const guarded = new Set();
  for (const m of meerkats) {
    let sentry = false;
    try { sentry = m.getProperty('safari:sentry'); } catch { continue; }
    if (!sentry) continue;
    guarded.add(m.id);
    for (const n of m.dimension.getEntities({ type: 'safari:meerkat', location: m.location, maxDistance: 10 })) guarded.add(n.id);
    const threat = m.dimension.getEntities({ location: m.location, maxDistance: 8 }).find((e) => DANGER.includes(e.typeId));
    if (threat && ready(m, 'alarm', 100, now)) {
      m.dimension.playSound('mob.fox.screech', m.location, { pitch: 2, volume: 1 });
      m.setProperty('safari:sentry', false);
    } else if (ready(m, 'shift', 400 + Math.floor(Math.random() * 400), now) && chance(0.5)) {
      m.setProperty('safari:sentry', false);
    }
  }
  for (const m of meerkats) {
    if (!guarded.has(m.id) && !isBaby(m) && chance(0.3)) {
      try { m.setProperty('safari:sentry', true); } catch { continue; }
      for (const n of m.dimension.getEntities({ type: 'safari:meerkat', location: m.location, maxDistance: 10 })) guarded.add(n.id);
    }
  }
}

/** Baboons snatch food from the player's hand and drop it again a little later. */
const FOODS = new Set([
  'minecraft:apple', 'minecraft:bread', 'minecraft:cookie', 'minecraft:melon_slice', 'minecraft:sweet_berries',
  'minecraft:glow_berries', 'minecraft:carrot', 'minecraft:baked_potato', 'minecraft:pumpkin_pie', 'minecraft:cake',
  'minecraft:golden_apple', 'minecraft:golden_carrot', 'minecraft:beetroot', 'minecraft:cooked_beef', 'minecraft:cooked_porkchop',
  'minecraft:cooked_chicken', 'minecraft:cooked_mutton', 'safari:cooked_game_meat', 'safari:fried_ostrich_egg',
]);
const stolen = new Map(); // baboon id -> { item, until }

function thieves(now) {
  for (const b of nearPlayers('safari:baboon', 24)) {
    const loot = stolen.get(b.id);
    if (loot) {
      if (now >= loot.until) dropLoot(b);
      continue;
    }
    if (isBaby(b) || !chance(0.15) || !ready(b, 'steal', 1200, now)) continue;
    const player = b.dimension.getPlayers({ location: b.location, maxDistance: 2.5 })[0];
    if (!player) continue;
    const inv = player.getComponent('minecraft:inventory')?.container;
    const slot = player.selectedSlotIndex;
    const item = inv?.getItem(slot);
    if (!item || !FOODS.has(item.typeId)) continue;
    if (item.amount > 1) {
      item.amount -= 1;
      inv.setItem(slot, item);
    } else {
      inv.setItem(slot, undefined);
    }
    stolen.set(b.id, { item: item.typeId, until: now + 200 + Math.floor(Math.random() * 200) });
    const away = { x: b.location.x - player.location.x, z: b.location.z - player.location.z };
    const len = Math.hypot(away.x, away.z) || 1;
    b.applyImpulse({ x: (away.x / len) * 0.8, y: 0.4, z: (away.z / len) * 0.8 });
    b.dimension.playSound('mob.fox.screech', b.location, { pitch: 1.4 });
    player.onScreenDisplay.setActionBar({ translate: 'safari.baboon.stole' });
  }
}

function dropLoot(baboon) {
  const loot = stolen.get(baboon.id);
  if (!loot) return;
  stolen.delete(baboon.id);
  try {
    baboon.dimension.spawnItem(new ItemStack(loot.item, 1), baboon.location);
  } catch {
    // Unloaded; the snack is lost to the savanna.
  }
}

/** Vultures arrive when a big animal dies out in the open. */
const CARCASS = new Set([
  'safari:zebra', 'safari:gazelle', 'safari:wildebeest', 'safari:warthog', 'safari:giraffe', 'safari:elephant',
  'safari:rhino', 'safari:hippo', 'safari:kangaroo', 'minecraft:cow', 'minecraft:horse', 'minecraft:sheep',
]);

function onDeath({ deadEntity }) {
  let typeId, location, dimension;
  try {
    ({ typeId, location, dimension } = deadEntity);
  } catch {
    return;
  }
  if (typeId === 'safari:baboon') dropLoot(deadEntity);
  if (!CARCASS.has(typeId) || dimension.id !== 'minecraft:overworld' || !chance(0.35)) return;
  const top = dimension.getTopmostBlock({ x: location.x, z: location.z });
  if (!top || top.location.y > location.y + 1) return; // under cover
  const nearby = dimension.getEntities({ type: 'safari:vulture', location, maxDistance: 48 }).length;
  const count = Math.max(0, Math.min(2, 3 - nearby));
  for (let i = 0; i < count; i++) {
    system.runTimeout(() => {
      try {
        dimension.spawnEntity('safari:vulture<safari:spawn_adult>', { x: location.x + (Math.random() - 0.5) * 6, y: location.y + 14, z: location.z + (Math.random() - 0.5) * 6 });
      } catch {
        // Chunk unloaded.
      }
    }, 100 + i * 60);
  }
}

export function setupBehaviours() {
  system.runInterval(() => {
    const now = system.currentTick;
    for (const step of [calls, displays, sentries, thieves]) {
      try {
        step(now);
      } catch (e) {
        console.warn(`[Safari Animals] ${step.name}: ${e}`);
      }
    }
  }, TICK);
  world.afterEvents.entityDie.subscribe(onDeath);
}
