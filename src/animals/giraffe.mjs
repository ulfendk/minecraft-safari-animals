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
      {
        name: 'body', parent: 'root', pivot: [0, 29, 0],
        cubes: [
          // High shoulders sloping down to the hips.
          { origin: [-4, 25, -9], size: [8, 10, 9], mat: 'coat' },
          { origin: [-4, 24, 0], size: [8, 8, 8], mat: 'coat' },
        ],
      },
      {
        name: 'tail', parent: 'body', pivot: [0, 31, 8], rotation: [10, 0, 0],
        cubes: [{ origin: [-1, 21, 8], size: [1, 10, 1], mat: 'coat' }, { origin: [-1, 17, 8], size: [1, 4, 1], mat: 'tuft' }],
      },
      {
        name: 'neck', parent: 'body', pivot: [0, 33, -7], rotation: [16, 0, 0],
        cubes: [
          { origin: [-2, 32, -10], size: [4, 11, 5], mat: 'coat' },
          { origin: [-1, 34, -5], size: [2, 9, 1], mat: 'mane' },
        ],
      },
      {
        name: 'neck2', parent: 'neck', pivot: [0, 43, -7.5],
        cubes: [
          { origin: [-2, 43, -9], size: [4, 11, 3], mat: 'coat' },
          { origin: [-1, 43, -6], size: [2, 10, 1], mat: 'mane' },
        ],
      },
      {
        name: 'head', parent: 'neck2', pivot: [0, 54, -7.5],
        cubes: [
          { origin: [-2, 52, -12], size: [4, 4, 5], mat: 'face', marks: eyes(5, { back: 1, down: 1, color: '#1a120c' }) },
          { origin: [-2, 51, -16], size: [4, 3, 4], mat: 'muzzle', marks: nostrils(4, { down: 0, color: '#3a2a1c' }) },
          // Ossicones with dark tufts.
          { origin: [1, 56, -9], size: [1, 3, 1], mat: 'ossicone' },
          { origin: [-2, 56, -9], size: [1, 3, 1], mat: 'ossicone' },
          { origin: [1, 59, -9], size: [1, 1, 1], mat: 'tuft', inflate: 0.15 },
          { origin: [-2, 59, -9], size: [1, 1, 1], mat: 'tuft', inflate: 0.15 },
        ],
      },
      { name: 'ear_l', parent: 'head', pivot: [2, 55, -7.5], rotation: [0, 0, -25], cubes: [{ origin: [2, 55, -8], size: [3, 1, 1], mat: 'face' }] },
      { name: 'ear_r', parent: 'head', pivot: [-2, 55, -7.5], rotation: [0, 0, 25], cubes: [{ origin: [-5, 55, -8], size: [3, 1, 1], mat: 'face' }] },
      ...legs4({ x: 4, front: -8, back: 5, w: 2, h: 25, frontH: 26, foot: 1, mat: 'leg' }),
    ],
  },

  materials: {
    coat: {
      base: '#f0dfb6',
      layers: [
        patches('#8e4f1e', { size: 4.5, line: 0.07, vary: 0.25, where: all(bone('body', 'neck', 'neck2', 'tail'), notFace('bottom')) }),
        fur(0.05),
      ],
    },
    // Legs: patches fade out towards the cream lower legs.
    leg: {
      base: '#f0dfb6',
      layers: [patches('#8e4f1e', { size: 2.6, line: 0.1, where: ({ p }) => p[1] > 14 }), fur(0.05)],
    },
    face: { base: '#e4c48c', layers: [patches('#9a5a24', { size: 2, line: 0.3, where: face('left', 'right', 'top') }), fur(0.04)] },
    muzzle: { base: '#d8b880', layers: [gradient('#6a4a2c', { axis: 2, from: -12, to: -16 }), fur(0.04)] },
    mane: { base: '#7a4520', layers: [fur(0.1)] },
    ossicone: { base: '#c99a5a', layers: [fur(0.05)] },
    tuft: '#2a1d14',
    hoof: '#3a2c20',
  },

  anims: quadruped({ neck: 'neck', tail: ['tail'], ears: ['ear_l', 'ear_r'], swing: 22, sleepDrop: 14, legFold: 85, pace: true, walkLength: 1.4, runLength: 0.7 }),
};
