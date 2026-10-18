import { bird } from '../lib/anim.mjs';
import { eyes } from '../lib/parts.mjs';
import { fur, gradient, mottle, region } from '../lib/texture.mjs';

export default {
  id: 'ostrich',
  name: 'Ostrich',
  role: 'prey',
  family: ['bird', 'ostrich'],
  size: [0.9, 2.2],
  health: 16,
  speed: 0.3,
  xp: 3,
  attack: { damage: 4, speed: 1.4 },
  breed: ['wheat_seeds', 'melon_seeds', 'pumpkin_seeds', 'beetroot_seeds'],
  tempt: ['wheat_seeds', 'melon_seeds', 'pumpkin_seeds', 'beetroot_seeds'],
  heal: [['wheat_seeds', 2]],
  sleeps: 'night',
  ride: {
    seat: [0, 1.25, 0.1],
    tameItems: ['wheat_seeds', 'melon_seeds', 'pumpkin_seeds', 'beetroot_seeds', 'wheat'],
    temper: 80,
    jumpStrength: 0.5,
  },
  extraComponents: {
    // Lays an ostrich egg every 10-20 minutes.
    'minecraft:spawn_entity': {
      entities: { min_wait_time: 600, max_wait_time: 1200, spawn_sound: 'plop', spawn_item: 'safari:ostrich_egg', filters: { test: 'is_baby', subject: 'self', operator: '!=', value: true } },
    },
  },
  spawn: [{ biomes: ['savanna'], weight: 4, group: [2, 4], blocks: ['grass_block', 'coarse_dirt'] }],
  loot: [{ item: 'feather', min: 1, max: 4 }, { item: 'safari:raw_game_meat', min: 1, max: 2, smelts: true }],
  sounds: { ambient: 'mob.chicken.say', hurt: 'mob.chicken.hurt', death: 'mob.chicken.hurt', pitch: [0.4, 0.5], interval: 18 },
  egg: ['#1e1b1a', '#f1ede4'],
  client: { runSpeed: 5 },

  model: {
    bones: [
      { name: 'root', pivot: [0, 0, 0] },
      { name: 'body', parent: 'root', pivot: [0, 20, 0], cubes: [{ origin: [-4, 16, -6], size: [8, 8, 12], mat: 'feathers' }] },
      {
        name: 'saddle', parent: 'body', pivot: [0, 24, 0],
        cubes: [{ origin: [-4, 24, -3], size: [8, 1, 6], mat: 'saddle', inflate: 0.2 }],
      },
      { name: 'tail', parent: 'body', pivot: [0, 22, 6], rotation: [-30, 0, 0], cubes: [{ origin: [-3, 19, 5], size: [6, 5, 3], mat: 'plume' }] },
      { name: 'wing_l', parent: 'body', pivot: [4, 23, -2], cubes: [{ origin: [4, 17, -4], size: [1, 6, 9], mat: 'wing' }] },
      { name: 'wing_r', parent: 'body', pivot: [-4, 23, -2], cubes: [{ origin: [-5, 17, -4], size: [1, 6, 9], mat: 'wing' }] },
      { name: 'neck', parent: 'body', pivot: [0, 22, -5], rotation: [8, 0, 0], cubes: [{ origin: [-1, 22, -7], size: [2, 15, 2], mat: 'skin' }] },
      {
        name: 'head', parent: 'neck', pivot: [0, 37, -6],
        cubes: [
          { origin: [-2, 37, -9], size: [4, 3, 4], mat: 'skin', marks: eyes(4, { back: 1, down: 0, h: 2 }) },
          { origin: [-1, 37, -12], size: [2, 1, 3], mat: 'beak' },
        ],
      },
      {
        name: 'leg_l', parent: 'root', pivot: [2, 17, 0],
        cubes: [
          { origin: [1, 11, -1], size: [3, 6, 3], mat: 'thigh' },
          { origin: [2, 0, 0], size: [1, 11, 1], mat: 'leg' },
          { origin: [1, 0, -3], size: [3, 1, 3], mat: 'leg' },
        ],
      },
      {
        name: 'leg_r', parent: 'root', pivot: [-2, 17, 0],
        cubes: [
          { origin: [-4, 11, -1], size: [3, 6, 3], mat: 'thigh' },
          { origin: [-3, 0, 0], size: [1, 11, 1], mat: 'leg' },
          { origin: [-4, 0, -3], size: [3, 1, 3], mat: 'leg' },
        ],
      },
    ],
  },

  materials: {
    feathers: { base: '#1e1b1a', layers: [mottle(0.15, { scale: 2 }), fur(0.1)] },
    wing: { base: '#1e1b1a', layers: [region('#f1ede4', ({ p }) => p[1] < 19.5 || p[2] > 3), fur(0.08)] },
    plume: { base: '#f1ede4', layers: [fur(0.06)] },
    skin: { base: '#c79a8f', layers: [gradient('#a8a29a', { axis: 1, from: 30, to: 23 }), fur(0.04)] },
    thigh: { base: '#d4a598', layers: [fur(0.04)] },
    leg: { base: '#c79a8f', layers: [region('#9c7a72', ({ p }) => Math.floor(p[1]) % 2 === 0)] },
    beak: '#d8b98a',
    saddle: { base: '#6b3e1f', layers: [fur(0.05)] },
  },

  anims: bird({ neck: 'neck', swing: 35, sleepDrop: 10, walkLength: 0.8, runLength: 0.35 }),
};
