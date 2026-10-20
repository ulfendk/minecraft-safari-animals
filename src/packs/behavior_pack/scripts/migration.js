// Wildebeest migration: by day, herds follow an invisible waypoint that keeps
// moving ahead of them in the direction of this day's migration.
import { system, world } from '@minecraft/server';
import { isCarcass, nearPlayers } from './util.js';

const LEG = 40; // blocks per waypoint
const markers = new Map(); // marker id -> { legs }

function heading() {
  const day = Math.floor(world.getAbsoluteTime() / 24000);
  const angle = ((day * 2654435761) % 360) * (Math.PI / 180);
  return { x: Math.cos(angle), z: Math.sin(angle) };
}

function placeAhead(dimension, from) {
  const h = heading();
  const x = from.x + h.x * LEG, z = from.z + h.z * LEG;
  const top = dimension.getTopmostBlock({ x, z });
  if (!top || top.typeId.includes('water')) return undefined;
  return { x, y: top.location.y + 1, z };
}

function step() {
  const time = world.getTimeOfDay();
  const daytime = time > 1000 && time < 11500;
  const herd = nearPlayers('safari:wildebeest', 96);

  for (const m of [...markers.keys()]) {
    const marker = world.getEntity(m);
    const state = markers.get(m);
    if (!marker?.isValid) { markers.delete(m); continue; }
    const followers = marker.dimension.getEntities({ type: 'safari:wildebeest', location: marker.location, maxDistance: 96 }).filter((w) => !isCarcass(w));
    if (!daytime || !followers.length || state.legs >= 4) {
      for (const w of followers) w.triggerEvent('safari:stop_migration');
      marker.remove();
      markers.delete(m);
      continue;
    }
    // Move the waypoint on once the herd arrives.
    if (marker.dimension.getEntities({ type: 'safari:wildebeest', location: marker.location, maxDistance: 5 }).length) {
      const next = placeAhead(marker.dimension, marker.location);
      if (next) {
        marker.teleport(next);
        state.legs += 1;
      } else {
        state.legs = 99;
      }
    }
  }

  if (!daytime || Math.random() > 0.2) return;
  for (const w of herd) {
    const busy = w.dimension.getEntities({ type: 'safari:migration_marker', location: w.location, maxDistance: 96 }).length;
    if (busy) continue;
    const at = placeAhead(w.dimension, w.location);
    if (!at) continue;
    const marker = w.dimension.spawnEntity('safari:migration_marker', at);
    markers.set(marker.id, { legs: 0 });
    for (const member of w.dimension.getEntities({ type: 'safari:wildebeest', location: w.location, maxDistance: 24 })) {
      if (!isCarcass(member)) member.triggerEvent('safari:start_migration');
    }
    break; // one new migration per check
  }
}

export function setupMigration() {
  system.runInterval(step, 100);
  // Markers left over from a previous session are cleaned up when found.
  world.afterEvents.entityLoad.subscribe(({ entity }) => {
    if (entity.typeId === 'safari:migration_marker' && !markers.has(entity.id)) entity.remove();
  });
}
