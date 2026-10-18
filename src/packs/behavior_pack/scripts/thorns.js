// Thorn bushes hurt and push back land animals that press against them.
// Players are only slowed down, so thorns work as a fence around a camp.
import { system, world } from '@minecraft/server';

const THORN = 'safari:thorn_bush';
const OFFSETS = [[0, 0], [0.8, 0], [-0.8, 0], [0, 0.8], [0, -0.8]];
const IGNORE_TYPES = ['minecraft:item', 'minecraft:xp_orb', 'minecraft:arrow', 'minecraft:snowball', 'minecraft:egg', 'minecraft:armor_stand'];

/** Centre of a thorn bush touching the entity, if any. */
function touchingThorn(entity) {
  const { x, y, z } = entity.location;
  for (const [dx, dz] of OFFSETS) {
    for (const dy of [0, 1]) {
      let block;
      try {
        block = entity.dimension.getBlock({ x: Math.floor(x + dx), y: Math.floor(y) + dy, z: Math.floor(z + dz) });
      } catch {
        continue;
      }
      if (block?.typeId === THORN) return { x: block.location.x + 0.5, z: block.location.z + 0.5 };
    }
  }
  return undefined;
}

function tick() {
  const checked = new Set();
  for (const player of world.getPlayers()) {
    let entities;
    try {
      entities = player.dimension.getEntities({ location: player.location, maxDistance: 32, excludeTypes: IGNORE_TYPES });
    } catch {
      continue;
    }
    for (const e of entities) {
      if (checked.has(e.id)) continue;
      checked.add(e.id);
      try {
        if (e.getComponent('minecraft:can_fly')) continue; // flyers go over the top
        const thorn = touchingThorn(e);
        if (!thorn) continue;
        if (e.typeId === 'minecraft:player') {
          e.addEffect('slowness', 30, { amplifier: 1, showParticles: false });
          continue;
        }
        e.applyDamage(1, { cause: 'contact' });
        const dx = e.location.x - thorn.x, dz = e.location.z - thorn.z;
        const len = Math.hypot(dx, dz) || 1;
        e.applyImpulse({ x: (dx / len) * 0.35, y: 0.1, z: (dz / len) * 0.35 });
      } catch {
        // Entity went away mid-check.
      }
    }
  }
}

export function setupThorns() {
  system.runInterval(tick, 10);
}
