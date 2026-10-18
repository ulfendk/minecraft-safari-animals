import { quadruped } from '../lib/anim.mjs';
import { all, bone, eyes, face, legs4, LEGS, nostrils, notFace } from '../lib/parts.mjs';
import { fur, gradient, patches, region } from '../lib/texture.mjs';

export default {
  id: 'giraffe',
  name: 'Giraffe',
  role: 'prey',
  family: ['giraffe', 'browser'],
  size: [1.3, 3.6],
  health: 30,
  speed: 0.22,
  xp: 4,
  breed: ['acacia_leaves', 'apple'],
  tempt: ['acacia_leaves', 'oak_leaves', 'jungle_leaves', 'apple'],
  heal: [['apple', 4], ['acacia_leaves', 2]],
  sleeps: 'night',
  strollRange: 14,
  spawn: [{ biomes: ['savanna'], weight: 4, group: [2, 4], blocks: ['grass_block'] }],
  loot: [{ item: 'leather', min: 0, max: 2 }],
  sounds: { ambient: 'mob.llama.idle', hurt: 'mob.llama.hurt', death: 'mob.llama.death', pitch: [0.7, 0.8], interval: 25 },
  egg: ['#efd9a7', '#9a5a24'],
  client: { runSpeed: 4 },

  model: {
    bones: [
      { name: 'root', pivot: [0, 0, 0] },
      { name: 'body', parent: 'root', pivot: [0, 29, 0], cubes: [{ origin: [-4, 24, -8], size: [8, 10, 16], mat: 'coat' }] },
      {
        name: 'tail', parent: 'body', pivot: [0, 33, 8], rotation: [10, 0, 0],
        cubes: [{ origin: [-1, 23, 8], size: [1, 10, 1], mat: 'coat' }, { origin: [-1, 20, 8], size: [1, 3, 1], mat: 'tuft' }],
      },
      {
        name: 'neck', parent: 'body', pivot: [0, 32, -6], rotation: [18, 0, 0],
        cubes: [
          { origin: [-2, 31, -9], size: [4, 22, 4], mat: 'coat' },
          { origin: [-1, 34, -5], size: [2, 19, 1], mat: 'mane' },
        ],
      },
      {
        name: 'head', parent: 'neck', pivot: [0, 53, -7],
        cubes: [
          { origin: [-2, 51, -12], size: [4, 4, 6], mat: 'face', marks: eyes(6, { back: 2, down: 1 }) },
          { origin: [-2, 50, -15], size: [4, 3, 3], mat: 'muzzle', marks: nostrils(4, { down: 0 }) },
          { origin: [1, 55, -9], size: [1, 3, 1], mat: 'ossicone' },
          { origin: [-2, 55, -9], size: [1, 3, 1], mat: 'ossicone' },
        ],
      },
      { name: 'ear_l', parent: 'head', pivot: [2, 54, -7.5], cubes: [{ origin: [2, 54, -8], size: [2, 1, 1], mat: 'face' }] },
      { name: 'ear_r', parent: 'head', pivot: [-2, 54, -7.5], cubes: [{ origin: [-4, 54, -8], size: [2, 1, 1], mat: 'face' }] },
      ...legs4({ x: 4, front: -7, back: 5, w: 2, h: 25, foot: 1, mat: 'coat' }),
    ],
  },

  materials: {
    coat: {
      base: '#f0dfb6',
      layers: [
        patches('#9a5a24', { size: 4.5, line: 0.16, where: all(bone('body', 'neck', 'tail'), notFace('bottom')) }),
        patches('#9a5a24', { size: 2.6, line: 0.22, where: all(bone(...LEGS), ({ p }) => p[1] > 12) }),
        fur(0.05),
      ],
    },
    face: { base: '#e4c48c', layers: [patches('#9a5a24', { size: 2, line: 0.3, where: face('left', 'right', 'top') }), fur(0.04)] },
    muzzle: { base: '#d8b880', layers: [gradient('#5a3a20', { axis: 2, from: -12, to: -15 })] },
    mane: { base: '#7a4520', layers: [fur(0.1)] },
    ossicone: { base: '#9a5a24', layers: [region('#2a1d14', ({ p }) => p[1] > 57)] },
    tuft: '#2a1d14',
    hoof: '#3a2c20',
  },

  anims: quadruped({ neck: 'neck', tail: ['tail'], ears: ['ear_l', 'ear_r'], swing: 22, sleepDrop: 14, legFold: 85, pace: true, walkLength: 1.4, runLength: 0.7 }),
};
