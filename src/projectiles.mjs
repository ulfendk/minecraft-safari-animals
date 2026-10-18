// Non-animal entities: projectiles thrown by animals.
import { NS } from './lib/constants.mjs';
import { weaponProjectiles } from './weapons.mjs';

export const projectiles = [
  {
    id: 'thrown_fruit',
    name: 'Thrown Fruit',
    damage: 1,
    // A small apple.
    model: {
      bones: [{
        name: 'fruit', pivot: [0, 2, 0],
        cubes: [
          { origin: [-2, 0, -2], size: [4, 4, 4], mat: 'apple', marks: [{ face: 'front', x: 1, y: 1, color: '#f08070' }] },
          { origin: [0, 4, 0], size: [1, 1, 1], mat: 'stem' },
        ],
      }],
    },
    materials: { apple: '#c8302a', stem: '#5a3a1e' },
  },
  ...weaponProjectiles,
];

export function buildProjectile(p) {
  return {
    format_version: '1.21.90',
    'minecraft:entity': {
      description: { identifier: `${NS}:${p.id}`, is_spawnable: false, is_summonable: true },
      components: {
        'minecraft:collision_box': { width: 0.25, height: 0.25 },
        'minecraft:projectile': {
          on_hit: {
            impact_damage: { damage: p.damage, knockback: true },
            ...(p.effect ? { mob_effect: { effect: p.effect.effect, durationeasy: p.effect.ticks, durationnormal: p.effect.ticks, durationhard: p.effect.ticks, amplifier: p.effect.amplifier } } : {}),
            remove_on_hit: {},
          },
          power: p.power ?? 1.0,
          gravity: p.gravity ?? 0.04,
          ...(p.hitSound ? { hit_sound: p.hitSound } : {}),
          uncertainty_base: 4,
          uncertainty_multiplier: 0,
          anchor: 1,
          offset: [0, -0.1, 0],
        },
        'minecraft:physics': {},
        'minecraft:pushable': { is_pushable: false, is_pushable_by_piston: true },
        'minecraft:despawn': { despawn_from_distance: { min_distance: 32, max_distance: 64 } },
      },
    },
  };
}

export function buildProjectileClient(p) {
  return {
    format_version: '1.10.0',
    'minecraft:client_entity': {
      description: {
        identifier: `${NS}:${p.id}`,
        materials: { default: 'entity_alphatest' },
        textures: { default: `textures/entity/${NS}/${p.id}` },
        geometry: { default: `geometry.safari.${p.id}` },
        // Point along the direction of flight, like an arrow.
        ...(p.rotate ? { animations: { move: 'animation.safari.projectile.move' }, scripts: { animate: ['move'] } } : {}),
        render_controllers: [`controller.render.safari.${p.id}`],
      },
    },
  };
}

/**
 * Invisible helper entities. The migration marker is a waypoint that migrating
 * wildebeest walk towards; the script moves it ahead of the herd.
 */
export const helpers = [{ id: 'migration_marker', name: 'Migration Marker' }];

export function buildHelper(h) {
  return {
    format_version: '1.21.90',
    'minecraft:entity': {
      description: { identifier: `${NS}:${h.id}`, is_spawnable: false, is_summonable: true },
      components: {
        'minecraft:type_family': { family: ['safari_marker', 'inanimate'] },
        'minecraft:collision_box': { width: 0.1, height: 0.1 },
        'minecraft:physics': { has_gravity: false, has_collision: false },
        'minecraft:pushable': { is_pushable: false, is_pushable_by_piston: false },
        'minecraft:damage_sensor': { triggers: [{ cause: 'all', deals_damage: 'no' }] },
        'minecraft:knockback_resistance': { value: 1 },
        'minecraft:health': { value: 1, max: 1 },
        'minecraft:breathable': { breathes_water: true, breathes_air: true },
      },
    },
  };
}

export function buildHelperClient(h) {
  return {
    format_version: '1.10.0',
    'minecraft:client_entity': {
      description: {
        identifier: `${NS}:${h.id}`,
        materials: { default: 'entity_alphatest' },
        textures: { default: `textures/entity/${NS}/${h.id}` },
        geometry: { default: `geometry.safari.${h.id}` },
        render_controllers: [`controller.render.safari.${h.id}`],
      },
    },
  };
}
