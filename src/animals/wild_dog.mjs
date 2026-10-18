import { quadruped } from '../lib/anim.mjs';
import { felid } from '../lib/bodies.mjs';
import { all, bone, LEGS, notFace } from '../lib/parts.mjs';
import { fur, patches, region, spots } from '../lib/texture.mjs';

export default {
  id: 'wild_dog',
  name: 'African Wild Dog',
  role: 'predator',
  family: ['wild_dog', 'canine'],
  size: [0.7, 0.9],
  health: 16,
  speed: 0.32,
  xp: 3,
  attack: { damage: 4, speed: 1.5, leap: true },
  alertsPack: true,
  hunts: ['antelope', 'warthog', 'zebra', 'sheep', 'rabbit'],
  huntInterval: 25,
  huntRange: 20,
  // Packs hunt by day and attack players who cross their path.
  hostile: { range: 12, filters: [{ test: 'is_daytime', subject: 'self', value: true }, { test: 'is_baby', subject: 'self', value: false }] },
  fleesFrom: ['lion'],
  sleeps: 'night',
  breed: ['safari:raw_game_meat', 'mutton'],
  tempt: ['safari:raw_game_meat', 'mutton'],
  heal: [['safari:raw_game_meat', 4], ['mutton', 3]],
  spawn: [{ biomes: ['savanna'], weight: 2, group: [4, 8], blocks: ['grass_block', 'coarse_dirt'] }],
  loot: [{ item: 'bone', min: 0, max: 2 }],
  sounds: { ambient: 'mob.wolf.bark', hurt: 'mob.wolf.hurt', death: 'mob.wolf.death', pitch: [1.3, 1.5], interval: 12 },
  egg: ['#6b4a2a', '#e8dcc0'],
  client: { runSpeed: 5 },

  model: felid({ bodyW: 6, bodyH: 6, bodyL: 14, legH: 11, legW: 2, headW: 6, headH: 5, headD: 4, muzzleW: 2, muzzleH: 2, muzzleD: 3, tailL: 8, tuft: true, earH: 4, earW: 2, eyeColor: '#5a3a1a' }),

  materials: {
    // Painted coat: blotches of black, tan and cream are different on every dog's body.
    fur: {
      base: '#b07a3a',
      layers: [
        patches('#2a2118', { size: 2.6, line: 0.3, vary: 0.3, where: all(bone('body', 'tail', ...LEGS), notFace('bottom')) }),
        spots('#e8dcc0', { size: 2.2, radius: 0.28, seed: 77, where: bone('body', ...LEGS) }),
        region('#2a2118', all(bone('head'), ({ face: f }) => f === 'front')),
        fur(0.08),
      ],
    },
    muzzle: '#1b1611',
    ear: { base: '#2a2118', layers: [region('#4a3a2a', ({ face: f }) => f === 'front')] },
    tail: { base: '#b07a3a', layers: [spots('#2a2118', { size: 2, radius: 0.35 })] },
    tuft: '#f2ece0',
    paw: '#3a2c1e',
  },

  anims: quadruped({ tail: ['tail', 'tail2'], ears: ['ear_l', 'ear_r'], swing: 34, sleepDrop: 8, legFold: 85, walkLength: 0.8, runLength: 0.35 }),
};
