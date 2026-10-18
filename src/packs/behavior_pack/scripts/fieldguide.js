// The Field Guide: a book that records every safari animal you've seen.
import { ItemStack, system, world } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import { ANIMALS } from './data.js';

const SEEN = 'safari:seen';
const GIVEN = 'safari:guide_given';

function seenSet(player) {
  try {
    return new Set(JSON.parse(player.getDynamicProperty(SEEN) ?? '[]'));
  } catch {
    return new Set();
  }
}

/** Spotting: every 2 seconds, record animals within 12 blocks of each player. */
function spot() {
  for (const player of world.getPlayers()) {
    const seen = seenSet(player);
    let changed = false;
    let nearby;
    try {
      nearby = player.dimension.getEntities({ families: ['safari'], location: player.location, maxDistance: 12 });
    } catch {
      continue;
    }
    for (const e of nearby) {
      const id = e.typeId.split(':')[1];
      if (seen.has(id)) continue;
      const animal = ANIMALS.find((a) => a.id === id);
      if (!animal) continue;
      seen.add(id);
      changed = true;
      player.onScreenDisplay.setActionBar({ rawtext: [{ translate: 'safari.guide.spotted', with: [animal.name] }] });
      player.playSound('random.orb', { pitch: 1.4 });
      if (seen.size === ANIMALS.length) player.playSound('random.levelup');
    }
    if (changed) player.setDynamicProperty(SEEN, JSON.stringify([...seen]));
  }
}

function openIndex(player) {
  const seen = seenSet(player);
  const form = new ActionFormData()
    .title({ rawtext: [{ translate: 'safari.guide.title' }, { text: ` (${seen.size}/${ANIMALS.length})` }] })
    .body({ translate: 'safari.guide.intro' });
  const order = [...ANIMALS].sort((a, b) => a.name.localeCompare(b.name));
  for (const a of order) {
    if (seen.has(a.id)) form.button(a.name, `textures/ui/safari/${a.id}`);
    else form.button('§8???');
  }
  form.show(player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    const a = order[res.selection];
    if (seen.has(a.id)) openEntry(player, a);
    else openIndex(player);
  });
}

function openEntry(player, a) {
  const lines = [
    a.text,
    '',
    `§2Lives in:§r ${a.habitats.join(', ') || '—'}`,
    `§2Traits:§r ${a.tags.join(', ')}`,
    a.food.length ? `§2Breed with:§r ${a.food.join(', ')}` : '',
    a.tame.length ? `§2Tame with:§r ${a.tame.join(', ')}` : '',
  ].filter((l, i) => l !== '' || i === 1);
  new ActionFormData()
    .title(a.name)
    .body(lines.join('\n'))
    .button({ translate: 'safari.guide.back' }, `textures/ui/safari/${a.id}`)
    .show(player)
    .then((res) => {
      if (!res.canceled) openIndex(player);
    });
}

export function setupFieldGuide() {
  system.runInterval(spot, 40);
  world.afterEvents.itemUse.subscribe(({ itemStack, source }) => {
    if (itemStack?.typeId !== 'safari:field_guide') return;
    source.playSound('item.book.page_turn');
    system.run(() => openIndex(source));
  });
  // Everyone gets a Field Guide the first time they join a world with the add-on.
  world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
    if (!initialSpawn || player.getDynamicProperty(GIVEN)) return;
    player.setDynamicProperty(GIVEN, true);
    system.runTimeout(() => {
      try {
        player.getComponent('minecraft:inventory')?.container?.addItem(new ItemStack('safari:field_guide', 1));
        player.sendMessage({ translate: 'safari.guide.welcome' });
      } catch {
        // Player left before the timeout.
      }
    }, 60);
  });
}
