// A thrown spear drops back as an item where it lands, so it can be picked up
// again. Now and then the flint head breaks and only the flint is left.
import { ItemStack, world } from '@minecraft/server';

const BREAK_CHANCE = 0.12;

function land({ projectile, location, dimension }) {
  let typeId;
  try {
    typeId = projectile.typeId;
  } catch {
    return;
  }
  if (typeId !== 'safari:thrown_spear') return;
  const broke = Math.random() < BREAK_CHANCE;
  try {
    dimension.spawnItem(new ItemStack(broke ? 'minecraft:flint' : 'safari:flint_spear', 1), { x: location.x, y: location.y + 0.3, z: location.z });
    if (broke) dimension.playSound('random.break', location);
    if (projectile.isValid) projectile.remove();
  } catch {
    // Chunk unloaded.
  }
}

export function setupSpears() {
  world.afterEvents.projectileHitBlock.subscribe(land);
  world.afterEvents.projectileHitEntity.subscribe(land);
}
