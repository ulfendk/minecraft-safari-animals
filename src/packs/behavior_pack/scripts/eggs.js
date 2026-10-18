// Ostrich eggs placed on the ground hatch into an ostrich chick.
import { GameMode, system, world } from '@minecraft/server';

const HATCH_TICKS = 20 * 20;

export function setupOstrichEggs() {
  world.afterEvents.playerInteractWithBlock.subscribe((event) => {
    const { player, block, blockFace, isFirstEvent } = event;
    const item = event.beforeItemStack;
    if (!isFirstEvent || item?.typeId !== 'safari:ostrich_egg' || blockFace !== 'Up') return;
    const above = block.above();
    if (!above?.isAir) return;

    if (player.getGameMode() !== GameMode.Creative) {
      const inv = player.getComponent('minecraft:inventory')?.container;
      const held = inv?.getItem(player.selectedSlotIndex);
      if (!held || held.typeId !== 'safari:ostrich_egg') return;
      if (held.amount > 1) {
        held.amount -= 1;
        inv.setItem(player.selectedSlotIndex, held);
      } else {
        inv.setItem(player.selectedSlotIndex, undefined);
      }
    }

    const dimension = block.dimension;
    const at = { x: above.location.x + 0.5, y: above.location.y, z: above.location.z + 0.5 };
    dimension.playSound('block.turtle_egg.crack', at);
    player.onScreenDisplay.setActionBar({ translate: 'safari.egg.placed' });
    for (const t of [HATCH_TICKS / 3, (2 * HATCH_TICKS) / 3]) {
      system.runTimeout(() => {
        try { dimension.playSound('block.turtle_egg.crack', at); } catch { /* unloaded */ }
      }, t);
    }
    system.runTimeout(() => {
      try {
        dimension.playSound('block.turtle_egg.break', at);
        dimension.spawnEntity('safari:ostrich<safari:entity_born>', at);
      } catch {
        // Chunk unloaded before hatching.
      }
    }, HATCH_TICKS);
  });
}
