import { extras, quadruped } from '../lib/anim.mjs';
import { all, bone, eyes, face, legs4, LEGS, nostrils } from '../lib/parts.mjs';
import { fur, gradient, mottle, region, underside } from '../lib/texture.mjs';

export default {
  id: 'gazelle',
  name: 'Gazelle',
  role: 'prey',
  family: ['antelope', 'grazer'],
  size: [0.8, 1.2],
  health: 10,
  speed: 0.3,
  panicSpeed: 1.8,
  fleeSpeed: 1.9,
  fleeDistance: 16,
  xp: 2,
  breed: ['wheat'],
  tempt: ['wheat'],
  grazes: true,
  sleeps: 'night',
  spawn: [{ biomes: ['savanna'], weight: 8, group: [3, 7], blocks: ['grass_block'] }],
  loot: [
    { item: 'safari:raw_game_meat', min: 1, max: 2, smelts: true },
    { item: 'leather', min: 0, max: 1 },
  ],
  sounds: { ambient: 'mob.goat.ambient', hurt: 'mob.goat.hurt', death: 'mob.goat.death', pitch: [1.4, 1.6] },
  egg: ['#c78a4a', '#f4efe6'],
  client: { runSpeed: 5 },

  model: {
    bones: [
      { name: 'root', pivot: [0, 0, 0] },
      { name: 'body', parent: 'root', pivot: [0, 13, 0], cubes: [{ origin: [-3, 10, -7], size: [6, 6, 14], mat: 'hide' }] },
      { name: 'tail', parent: 'body', pivot: [0, 15, 7], rotation: [15, 0, 0], cubes: [{ origin: [-1, 11, 7], size: [2, 4, 1], mat: 'tail' }] },
      { name: 'neck', parent: 'body', pivot: [0, 15, -6], rotation: [20, 0, 0], cubes: [{ origin: [-1, 14, -9], size: [2, 8, 3], mat: 'hide' }] },
      {
        name: 'head', parent: 'neck', pivot: [0, 22, -7.5],
        cubes: [
          { origin: [-2, 20, -12], size: [4, 4, 5], mat: 'face', marks: eyes(5, { back: 1, down: 1 }) },
          { origin: [-1, 19, -15], size: [2, 3, 3], mat: 'muzzle', marks: nostrils(2, { gap: 0 }) },
          { origin: [1, 24, -10], size: [1, 6, 1], mat: 'horn', rotation: [-25, 0, 8], pivot: [1.5, 24, -9.5] },
          { origin: [-2, 24, -10], size: [1, 6, 1], mat: 'horn', rotation: [-25, 0, -8], pivot: [-1.5, 24, -9.5] },
        ],
      },
      { name: 'ear_l', parent: 'head', pivot: [2, 23, -8.5], cubes: [{ origin: [2, 23, -9], size: [2, 1, 1], mat: 'hide' }] },
      { name: 'ear_r', parent: 'head', pivot: [-2, 23, -8.5], cubes: [{ origin: [-4, 23, -9], size: [2, 1, 1], mat: 'hide' }] },
      ...legs4({ x: 3, front: -6, back: 4, w: 2, h: 11, foot: 1 }),
    ],
  },

  materials: {
    hide: {
      base: '#c98b4b',
      layers: [
        region('#2b1d14', all(bone('body'), face('left', 'right'), ({ p }) => p[1] > 11 && p[1] < 12.4)),
        underside('#f4efe6', { y: 11, soft: 1, where: bone('body') }),
        region('#f4efe6', all(bone('body'), face('back'), ({ p }) => p[1] < 14)),
        gradient('#efe2cc', { axis: 1, from: 6, to: 2, where: bone(...LEGS) }),
        mottle(0.05),
        fur(0.05),
      ],
    },
    face: {
      base: '#c98b4b',
      layers: [
        region('#f4efe6', ({ face: f, p }) => (f === 'left' || f === 'right') && p[1] > 21.5 && p[1] < 22.8),
        region('#3a2a1e', ({ face: f, p }) => (f === 'left' || f === 'right') && p[1] < 21.5 && p[1] > 20.5),
        fur(0.05),
      ],
    },
    muzzle: { base: '#b07a44', layers: [fur(0.05)] },
    tail: { base: '#1e1712', layers: [fur(0.05)] },
    horn: { base: '#3a3128', layers: [region('#5a4d40', ({ p }) => Math.floor(p[1]) % 2 === 0)] },
    hoof: '#2a2420',
  },

  anims: {
    ...quadruped({ neck: 'neck', tail: ['tail'], ears: ['ear_l', 'ear_r'], swing: 35, sleepDrop: 6, legFold: 85, walkLength: 0.8, runLength: 0.35 }),
    pronk: extras.pronk(),
  },
};
