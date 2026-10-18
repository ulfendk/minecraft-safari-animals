import { ItemStack, world } from '@minecraft/server';
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
  console.log(missing.length ? `[Safari Animals] selftest FAIL missing: ${missing.join(' ')}` : '[Safari Animals] selftest PASS');
}
