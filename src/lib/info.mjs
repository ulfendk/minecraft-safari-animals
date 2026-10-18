// Human-readable facts derived from animal specs (website and Field Guide).
import { guide } from '../guide.mjs';

const BIOME_NAMES = {
  savanna: 'Savanna', jungle: 'Jungle', desert: 'Desert', swamp: 'Swamp', mangrove: 'Mangrove swamp',
  river: 'Rivers', beach: 'Beaches', mesa: 'Badlands', plains: 'Plains', forest: 'Forest',
};

const itemName = (id) => id.replace(/^.*:/, '').replace(/_/g, ' ');

export function habitats(a) {
  return [...new Set((a.spawn ?? []).flatMap((s) => s.biomes.map((b) => BIOME_NAMES[b] ?? b)))];
}

export function tags(a) {
  const t = [];
  if (a.ride) t.push(a.ride.chest ? 'Rideable · carries chests' : 'Rideable');
  if (a.hunts?.length) t.push('Hunter');
  if (a.fleesFrom?.length && !a.attack) t.push('Prey');
  if (a.hostile) t.push('Dangerous');
  else if (a.attack) t.push('Fights back');
  if (a.sleeps === 'day') t.push('Active at night');
  if (a.movement === 'fly') t.push('Flies');
  if (a.movement === 'amphibious') t.push('Swims');
  if (a.climbs) t.push('Climbs');
  if (!a.attack && !a.fleesFrom?.length) t.push('Gentle');
  return t;
}

/** Compact record for the in-game Field Guide script. */
export function guideEntry(a) {
  return {
    id: a.id,
    name: a.name,
    text: guide[a.id] ?? '',
    habitats: habitats(a),
    tags: tags(a),
    food: (a.breed ?? []).map(itemName),
    tame: a.ride ? (a.ride.tameItems ?? []).map(itemName) : [],
  };
}
