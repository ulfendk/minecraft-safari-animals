// Flint spear: hold use to charge, let go to throw. A thrown spear drops back as an item
// where it lands, with its wear, so it can be picked up again. Now and then the flint head
// breaks and only the flint is left.
import { GameMode, ItemStack, system, world } from '@minecraft/server';

const SPEAR = 'safari:flint_spear';
const THROWN = 'safari:thrown_spear';
const BREAK_CHANCE = 0.12;
const MIN_DRAW = 6; // ticks
const FULL_DRAW = 20;
const SPEED = 2.2;
const WEAR = 'safari:wear';
const CREATIVE = 'safari:creative';

/** Player id -> tick the charge started. */
const charging = new Map();

function isCreative(player) {
  try {
    return player.getGameMode() === GameMode.Creative;
  } catch {
    return false;
  }
}

function throwSpear(player, ticks) {
  const container = player.getComponent('minecraft:inventory')?.container;
  const held = container?.getItem(player.selectedSlotIndex);
  // Switching items stops using too: only throw if the spear is still in hand.
  if (held?.typeId !== SPEAR || ticks < MIN_DRAW) return;
  const creative = isCreative(player);
  const durability = held.getComponent('minecraft:durability');
  const wear = (durability?.damage ?? 0) + (creative ? 0 : 1);
  if (durability && wear >= durability.maxDurability) return;

  const draw = Math.min(1, ticks / FULL_DRAW);
  const dir = player.getViewDirection();
  const eye = player.getHeadLocation();
  const from = { x: eye.x + dir.x * 0.6, y: eye.y + dir.y * 0.6 - 0.1, z: eye.z + dir.z * 0.6 };
  const spear = player.dimension.spawnEntity(THROWN, from);
  const projectile = spear.getComponent('minecraft:projectile');
  projectile.owner = player;
  projectile.shoot({ x: dir.x * SPEED * draw, y: dir.y * SPEED * draw, z: dir.z * SPEED * draw });
  if (creative) spear.setDynamicProperty(CREATIVE, true);
  else {
    spear.setDynamicProperty(WEAR, wear);
    container.setItem(player.selectedSlotIndex, undefined);
  }
  player.dimension.playSound('item.trident.throw', eye);
}

function land({ projectile, location, dimension }) {
  let wear, creative;
  try {
    if (projectile.typeId !== THROWN) return;
    wear = projectile.getDynamicProperty(WEAR) ?? 0;
    creative = projectile.getDynamicProperty(CREATIVE) === true;
  } catch {
    return;
  }
  // In creative the spear stays in hand, so nothing drops.
  const broke = !creative && Math.random() < BREAK_CHANCE;
  try {
    if (!creative) {
      const item = new ItemStack(broke ? 'minecraft:flint' : SPEAR, 1);
      const durability = item.getComponent('minecraft:durability');
      if (durability) durability.damage = Math.min(wear, durability.maxDurability - 1);
      dimension.spawnItem(item, { x: location.x, y: location.y + 0.3, z: location.z });
    }
    if (broke) dimension.playSound('random.break', location);
    if (projectile.isValid) projectile.remove();
  } catch {
    // Chunk unloaded.
  }
}

export function setupSpears() {
  world.afterEvents.itemStartUse.subscribe(({ itemStack, source }) => {
    if (itemStack?.typeId === SPEAR && source.typeId === 'minecraft:player') charging.set(source.id, system.currentTick);
  });
  world.afterEvents.itemStopUse.subscribe(({ source }) => {
    const since = charging.get(source.id);
    if (since === undefined) return;
    charging.delete(source.id);
    const ticks = system.currentTick - since;
    system.run(() => {
      try {
        throwSpear(source, ticks);
      } catch {
        // Player left or chunk unloaded.
      }
    });
  });
  world.afterEvents.playerLeave.subscribe(({ playerId }) => charging.delete(playerId));
  world.afterEvents.projectileHitBlock.subscribe(land);
  world.afterEvents.projectileHitEntity.subscribe(land);
}
