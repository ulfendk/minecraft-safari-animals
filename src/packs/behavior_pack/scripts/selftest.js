import { world } from '@minecraft/server';

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
  console.log(`[Safari Animals] selftest found ${JSON.stringify(counts)}`);
  console.log(missing.length ? `[Safari Animals] selftest FAIL missing: ${missing.join(' ')}` : '[Safari Animals] selftest PASS');
}
