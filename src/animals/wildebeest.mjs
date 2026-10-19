import { quadruped } from '../lib/anim.mjs';
import { all, bone, eyes, face, legs4, nostrils } from '../lib/parts.mjs';
import { fur, mottle, region, stripes } from '../lib/texture.mjs';

export default {
  id: 'wildebeest',
  name: 'Wildebeest',
  role: 'prey',
  family: ['antelope', 'grazer'],
  size: [1.2, 1.5],
  scale: 1.15,
  health: 20,
  speed: 0.26,
  xp: 3,
  breed: ['wheat'],
  tempt: ['wheat', 'hay_block'],
  grazes: true,
  sleeps: 'night',
  strollRange: 16,
  // Migration: the script adds this group by day and moves a waypoint ahead of the herd.
  extraGroups: {
    'safari:migrating': {
      'minecraft:behavior.nearest_attackable_target': {
        priority: 6, must_see: false, reselect_targets: true, within_radius: 96,
        entity_types: [{ filters: { test: 'is_family', subject: 'other', value: 'safari_marker' }, max_dist: 96 }],
      },
      'minecraft:behavior.move_towards_target': { priority: 6, speed_multiplier: 0.9, within_radius: 96 },
    },
  },
  extraEvents: {
    'safari:start_migration': { add: { component_groups: ['safari:migrating'] } },
    'safari:stop_migration': { remove: { component_groups: ['safari:migrating'] } },
  },
  spawn: [{ biomes: ['savanna'], weight: 6, group: [4, 8], blocks: ['grass_block'] }],
  loot: [
    { item: 'safari:raw_game_meat', min: 1, max: 3, smelts: true },
    { item: 'leather', min: 0, max: 2 },
  ],
  sounds: { ambient: 'mob.cow.say', hurt: 'mob.cow.hurt', death: 'mob.cow.hurt', pitch: [0.7, 0.85] },
  egg: ['#6f7377', '#1f1f1f'],

  model: {
    bones: [
      { name: 'root', pivot: [0, 0, 0] },
      {
        name: 'body', parent: 'root', pivot: [0, 16, 0],
        cubes: [
          { origin: [-5, 11, -9], size: [10, 11, 11], mat: 'hide' },
          { origin: [-4, 11, 2], size: [8, 9, 9], mat: 'hide' },
        ],
      },
      { name: 'tail', parent: 'body', pivot: [0, 19, 11], rotation: [10, 0, 0], cubes: [{ origin: [-1, 11, 11], size: [2, 8, 1], mat: 'mane' }] },
      {
        name: 'neck', parent: 'body', pivot: [0, 19, -8], rotation: [35, 0, 0],
        cubes: [
          { origin: [-2, 16, -13], size: [4, 8, 5], mat: 'hide' },
          // Black mane along the top of the neck and a shaggy beard underneath.
          { origin: [-1, 24, -12], size: [2, 1, 4], mat: 'mane' },
          { origin: [-1, 12, -13], size: [2, 4, 4], mat: 'beard' },
        ],
      },
      {
        name: 'head', parent: 'neck', pivot: [0, 23, -11],
        cubes: [
          // Long face that widens into a broad muzzle.
          { origin: [-2, 18, -20], size: [4, 6, 9], mat: 'face', marks: eyes(9, { back: 2, down: 1, color: '#0e0b0a' }) },
          { origin: [-3, 16, -22], size: [6, 3, 4], mat: 'muzzle', marks: nostrils(6, { down: 0, gap: 2, color: '#0e0b0a' }) },
          // Horns: out to the sides, down, then up and in at the tips.
          { origin: [2, 23, -14], size: [3, 2, 2], mat: 'horn' },
          { origin: [5, 22, -14], size: [1, 2, 2], mat: 'horn' },
          { origin: [5, 24, -14], size: [1, 2, 1], mat: 'horn' },
          { origin: [4, 26, -14], size: [1, 1, 1], mat: 'horn' },
          { origin: [-5, 23, -14], size: [3, 2, 2], mat: 'horn' },
          { origin: [-6, 22, -14], size: [1, 2, 2], mat: 'horn' },
          { origin: [-6, 24, -14], size: [1, 2, 1], mat: 'horn' },
          { origin: [-5, 26, -14], size: [1, 1, 1], mat: 'horn' },
        ],
      },
      { name: 'ear_l', parent: 'head', pivot: [2, 22, -11.5], rotation: [0, 0, -20], cubes: [{ origin: [2, 22, -12], size: [3, 1, 1], mat: 'hide' }] },
      { name: 'ear_r', parent: 'head', pivot: [-2, 22, -11.5], rotation: [0, 0, 20], cubes: [{ origin: [-5, 22, -12], size: [3, 1, 1], mat: 'hide' }] },
      ...legs4({ x: 4, front: -8, back: 7, w: 3, h: 12, foot: 2 }),
    ],
  },

  materials: {
    hide: {
      base: '#737880',
      layers: [
        stripes('#4b4f55', { axis: 2, period: 3, width: 0.35, warp: 0.8, where: all(bone('body', 'neck'), face('left', 'right', 'top'), ({ p }) => p[2] < 0) }),
        mottle(0.08),
        fur(0.06),
      ],
    },
    face: { base: '#2e2d2e', layers: [region('#55565a', ({ face: f }) => f === 'left' || f === 'right'), fur(0.06)] },
    muzzle: { base: '#262526', layers: [fur(0.05)] },
    beard: { base: '#1a1a1b', layers: [fur(0.15)] },
    mane: { base: '#1b1b1c', layers: [fur(0.1)] },
    horn: { base: '#3a3632', layers: [region('#55504a', ({ p }) => p[1] > 24), fur(0.04)] },
    hoof: '#1f1c1a',
  },

  anims: quadruped({ neck: 'neck', tail: ['tail'], ears: ['ear_l', 'ear_r'], swing: 28, sleepDrop: 7, legFold: 80 }),
};
