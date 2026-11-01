import { ItemStack, system, world } from '@minecraft/server';
import { ITEMS } from './data.js';

/**
 * Used by tools/bds-test.sh: reports how many of each safari animal exist and
 * which expected ones are missing. Message = space-separated expected ids.
 */
export function selfTest(message) {
  const expected = message.split(/\s+/).filter(Boolean);
  const counts = {};
  for (const e of world.getDimension('overworld').getEntities()) {
    if (e.typeId.startsWith('safari:')) counts[e.typeId] = (counts[e.typeId] ?? 0) + 1;
  }
  const missing = expected.filter((id) => !counts[`safari:${id}`]);
  // Every custom item and block must exist as an item.
  for (const id of ITEMS) {
    try {
      new ItemStack(id, 1);
    } catch {
      missing.push(id);
    }
  }
  console.log(`[Safari Animals] selftest found ${JSON.stringify(counts)}`);

  // An anaconda that bites must coil around its prey (scripts/constrict.js).
  const dim = world.getDimension('overworld');
  const snake = dim.spawnEntity('safari:anaconda', { x: 44.5, y: -60, z: 44.5 }, { spawnEvent: 'safari:spawn_adult' });
  const prey = dim.spawnEntity('safari:capybara', { x: 45.5, y: -60, z: 44.5 }, { spawnEvent: 'safari:spawn_adult' });
  if (snake && prey) {
    prey.applyDamage(1, { cause: 'entityAttack', damagingEntity: snake });
  } else {
    missing.push('coil test animals');
  }
  // Animals that charge actually land their hits: each one is hurt by a villager and goes for it.
  ['wild_dog', 'lion', 'rhino', 'gaur'].forEach((id, i) => {
    const z = 10.5 + i * 8;
    const animal = dim.spawnEntity(`safari:${id}`, { x: 44.5, y: -60, z }, { spawnEvent: 'safari:spawn_adult' });
    const victim = dim.spawnEntity('minecraft:villager_v2', { x: 48.5, y: -60, z });
    const before = victim.getComponent('minecraft:health').currentValue;
    animal.applyDamage(1, { cause: 'entityAttack', damagingEntity: victim });
    system.runTimeout(() => {
      const after = victim.isValid ? victim.getComponent('minecraft:health').currentValue : 0;
      console.log(`[Safari Animals] selftest charge ${id}: villager health ${before} -> ${after}`);
      if (after >= before) missing.push(`${id} attack damage`);
    }, 200);
  });

  system.runTimeout(() => {
    let coiled = false;
    try { coiled = snake.getProperty('safari:coiling') === true; } catch {}
    if (snake && prey && !coiled) missing.push('anaconda coil');
  }, 10);
  system.runTimeout(() => {
    console.log(missing.length ? `[Safari Animals] selftest FAIL missing: ${missing.join(' ')}` : '[Safari Animals] selftest PASS');
  }, 210);
}
