import { world } from '@minecraft/server';

/** All entities of a safari type that are near at least one player (cheap enough to poll). */
export function nearPlayers(typeId, radius = 48) {
  const out = new Map();
  for (const player of world.getPlayers()) {
    let found;
    try {
      found = player.dimension.getEntities({ type: typeId, location: player.location, maxDistance: radius });
    } catch {
      continue;
    }
    for (const e of found) out.set(e.id, e);
  }
  return [...out.values()];
}

export const chance = (p) => Math.random() < p;

export function isBaby(entity) {
  try {
    return !!entity.getComponent('minecraft:is_baby');
  } catch {
    return false;
  }
}

/** Per-entity cooldowns kept in memory (they reset when the world reloads, which is fine). */
const cooldowns = new Map();
export function ready(entity, key, ticks, now) {
  const k = `${entity.id}:${key}`;
  const until = cooldowns.get(k) ?? 0;
  if (now < until) return false;
  cooldowns.set(k, now + ticks);
  return true;
}
