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
    if (isBaby(lion)) continue;
    // A warning roar when a player comes close; lions attack at 7 blocks.
    const close = lion.dimension.getPlayers({ location: lion.location, maxDistance: 12 }).length > 0;
    if (close && ready(lion, 'warn', 300, now)) play(lion, 'roar', 'mob.ravager.roar', 0.5, 3);
    else if (chance(0.02) && ready(lion, 'roar', 600, now)) play(lion, 'roar', 'mob.ravager.roar', 0.55, 3);
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
  // Snakes rear up when a player comes close: the cobra spreads its hood, the mamba gapes.
  for (const [type, range, pitch] of [['safari:king_cobra', 5, 0.4], ['safari:black_mamba', 4, 0.8]]) {
    for (const s of nearPlayers(type, 16)) {
      if (isBaby(s)) continue;
      const close = s.dimension.getPlayers({ location: s.location, maxDistance: range });
      if (close.length && ready(s, 'threat', 120, now)) play(s, 'threat', 'mob.cat.hiss', pitch, 1.5);
    }
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
      hideInMound(m);
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

/** Meerkats near a termite mound dive into it: they vanish for a while next to the mound. */
function hideInMound(sentry) {
  const { x, y, z } = sentry.location;
  let mound;
  for (let dx = -8; dx <= 8 && !mound; dx++)
    for (let dz = -8; dz <= 8 && !mound; dz++)
      for (let dy = -2; dy <= 2 && !mound; dy++) {
        const b = sentry.dimension.getBlock({ x: Math.floor(x) + dx, y: Math.floor(y) + dy, z: Math.floor(z) + dz });
        if (b?.typeId === 'safari:termite_mound') mound = b.location;
      }
  if (!mound) return;
  for (const m of sentry.dimension.getEntities({ type: 'safari:meerkat', location: sentry.location, maxDistance: 10 })) {
    m.teleport({ x: mound.x + 0.5 + (Math.random() - 0.5), y: mound.y, z: mound.z + 1.2 });
    m.addEffect('invisibility', 200, { showParticles: false });
    m.addEffect('slowness', 200, { amplifier: 5, showParticles: false });
  }
}

/** By day, leopards climb a nearby tree and rest in the canopy. */
function treeRest(now) {
  const time = world.getTimeOfDay();
  if (time < 1000 || time > 11000) return;
  for (const leopard of nearPlayers('safari:leopard', 48)) {
    if (isBaby(leopard) || !chance(0.15) || !ready(leopard, 'climb', 600, now)) continue;
    const below = leopard.dimension.getBlock({ x: Math.floor(leopard.location.x), y: Math.floor(leopard.location.y) - 1, z: Math.floor(leopard.location.z) });
    if (below?.typeId.includes('leaves')) continue; // already up a tree
    for (let tries = 0; tries < 12; tries++) {
      const px = Math.floor(leopard.location.x + (Math.random() - 0.5) * 12);
      const pz = Math.floor(leopard.location.z + (Math.random() - 0.5) * 12);
      const top = leopard.dimension.getTopmostBlock({ x: px, z: pz });
      if (!top?.typeId.includes('leaves')) continue;
      const rise = top.location.y - leopard.location.y;
      if (rise < 2 || rise > 10) continue;
      play(leopard, 'pounce', 'mob.cat.hiss', 0.6, 1);
      leopard.teleport({ x: px + 0.5, y: top.location.y + 1, z: pz + 0.5 });
      break;
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

const HUNTERS = new Set(['safari:lion', 'safari:leopard', 'safari:cheetah', 'safari:wild_dog', 'safari:tiger', 'safari:crocodile', 'minecraft:player']);

function onDeath({ deadEntity, damageSource }) {
  let typeId, location, dimension;
  try {
    ({ typeId, location, dimension } = deadEntity);
  } catch {
    return;
  }
  if (typeId === 'safari:baboon') dropLoot(deadEntity);
  const killer = damageSource?.damagingEntity?.typeId;
  if (killer && HUNTERS.has(killer) && killer !== 'safari:hyena') {
    for (const h of dimension.getEntities({ type: 'safari:hyena', location, maxDistance: 24 })) {
      dimension.playSound('mob.fox.screech', h.location, { pitch: 0.9, volume: 1.5 });
    }
  }
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
    for (const step of [calls, displays, sentries, thieves, treeRest]) {
      try {
        step(now);
      } catch (e) {
        console.warn(`[Safari Animals] ${step.name}: ${e}`);
      }
    }
  }, TICK);
  world.afterEvents.entityDie.subscribe(onDeath);
}

// ---------------------------------------------------------------- touch defences and colour

/** Poison dart frogs poison whoever touches them; porcupine quills hurt melee attackers. */
function onHurt({ hurtEntity, damageSource }) {
  const attacker = damageSource?.damagingEntity;
  let type;
  try { type = hurtEntity.typeId; } catch { return; }
  const melee = damageSource?.cause === 'entityAttack' && attacker && attacker !== hurtEntity;
  try {
    if (type === 'safari:poison_dart_frog' && melee) {
      attacker.addEffect('poison', 120, { amplifier: 1 });
    } else if (type === 'safari:porcupine' && melee) {
      attacker.applyDamage(2, { cause: 'thorns', damagingEntity: hurtEntity });
      hurtEntity.dimension.playSound('mob.armadillo.hurt', hurtEntity.location, { pitch: 1.4 });
    }
    // Electric eels give off a visible, crackling shock when they bite.
    if (attacker?.typeId === 'safari:electric_eel') {
      const at = hurtEntity.location;
      hurtEntity.dimension.playSound('random.fizz', at, { pitch: 1.6, volume: 1 });
      for (let i = 0; i < 6; i++) {
        hurtEntity.dimension.spawnParticle('minecraft:electric_spark_particle', { x: at.x + Math.random() - 0.5, y: at.y + Math.random(), z: at.z + Math.random() - 0.5 });
      }
    }
  } catch {
    // Entity gone or particle unavailable.
  }
}

/** Chameleons take on the colour of what they are standing on. */
const CHAMELEON_COLOURS = [
  { variant: 2, test: (id) => /sand|sandstone|terracotta/.test(id) },
  { variant: 1, test: (id) => /log|wood|dirt|podzol|mud|planks|stripped|mangrove_roots|coarse/.test(id) },
  { variant: 0, test: (id) => /leaves|grass|vine|moss|azalea|bamboo|fern/.test(id) },
];
function camouflage() {
  for (const c of nearPlayers('safari:chameleon', 32)) {
    let below;
    try {
      const l = c.location;
      below = c.dimension.getBlock({ x: Math.floor(l.x), y: Math.floor(l.y - 0.2), z: Math.floor(l.z) })?.typeId ?? '';
    } catch { continue; }
    const match = CHAMELEON_COLOURS.find((m) => m.test(below));
    if (!match) continue;
    const current = c.getComponent('minecraft:variant')?.value ?? 0;
    if (current !== match.variant) c.triggerEvent(`safari:make_variant_${match.variant}`);
  }
}

export function setupDefences() {
  world.afterEvents.entityHurt.subscribe(onHurt);
  system.runInterval(camouflage, 20);
}
