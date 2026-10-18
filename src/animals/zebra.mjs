import { quadruped } from '../lib/anim.mjs';
import { fur, mottle, stripes, underside } from '../lib/texture.mjs';

const isBone = (...names) => ({ cube }) => names.includes(cube.bone);
const notBottom = ({ face }) => face !== 'bottom';

export default {
  id: 'zebra',
  name: 'Zebra',
  role: 'prey',
  family: ['equine', 'grazer'],
  size: [1.3, 1.5],
  health: 22,
  speed: 0.25,
  xp: 3,
  breed: ['golden_carrot', 'golden_apple'],
  tempt: ['wheat', 'apple', 'golden_carrot', 'golden_apple'],
  heal: [['wheat', 2], ['apple', 3], ['hay_block', 20]],
  grazes: true,
  sleeps: 'night',
  ride: {
    seat: [0, 1.15, -0.1],
    tameItems: ['wheat', 'apple', 'sugar', 'carrot', 'hay_block'],
    temper: 100,
    jumpStrength: 0.6,
  },
  spawn: [{ biomes: ['savanna'], weight: 8, group: [3, 6], blocks: ['grass_block'] }],
  loot: [
    { item: 'safari:zebra_hide', min: 0, max: 2 },
    { item: 'safari:raw_game_meat', min: 1, max: 2, smelts: true },
  ],
  sounds: {
    ambient: 'mob.horse.donkey.idle',
    hurt: 'mob.horse.donkey.hit',
    death: 'mob.horse.donkey.death',
    eat: 'mob.horse.eat',
    pitch: [1.2, 1.4],
  },
  egg: ['#f2efe6', '#1b1b1b'],

  model: {
    bones: [
      { name: 'root', pivot: [0, 0, 0] },
      {
        name: 'body', parent: 'root', pivot: [0, 17, 0],
        cubes: [{ origin: [-5, 11, -10], size: [10, 10, 21], mat: 'hide' }],
      },
      {
        name: 'saddle', parent: 'body', pivot: [0, 21, 0],
        cubes: [
          { origin: [-5, 21, -4], size: [10, 1, 8], mat: 'saddle', inflate: 0.2 },
          { origin: [-1, 21, -5], size: [2, 2, 1], mat: 'saddle' },
        ],
      },
      {
        name: 'tail', parent: 'body', pivot: [0, 20, 11], rotation: [20, 0, 0],
        cubes: [
          { origin: [-1, 12, 11], size: [2, 8, 2], mat: 'hide' },
          { origin: [-1, 8, 11], size: [2, 4, 2], mat: 'tuft' },
        ],
      },
      {
        name: 'neck', parent: 'body', pivot: [0, 19, -8], rotation: [30, 0, 0],
        cubes: [
          { origin: [-2, 17, -12], size: [4, 13, 7], mat: 'hide' },
          { origin: [-1, 20, -5], size: [2, 12, 2], mat: 'mane' },
        ],
      },
      {
        name: 'head', parent: 'neck', pivot: [0, 30, -9],
        cubes: [
          {
            origin: [-3, 27, -14], size: [6, 6, 7], mat: 'hide',
            marks: [
              { face: 'right', x: 4, y: 1, color: '#101010' },
              { face: 'left', x: 2, y: 1, color: '#101010' },
            ],
          },
          {
            origin: [-2, 26, -19], size: [4, 5, 5], mat: 'muzzle',
            marks: [
              { face: 'front', x: 0, y: 1, color: '#0d0d0d' },
              { face: 'front', x: 3, y: 1, color: '#0d0d0d' },
            ],
          },
        ],
      },
      { name: 'ear_r', parent: 'head', pivot: [-2, 33, -8.5], cubes: [{ origin: [-3, 33, -9], size: [2, 3, 1], mat: 'ear' }] },
      { name: 'ear_l', parent: 'head', pivot: [2, 33, -8.5], cubes: [{ origin: [1, 33, -9], size: [2, 3, 1], mat: 'ear' }] },
      ...[
        ['leg_fl', 2, -9],
        ['leg_fr', -5, -9],
        ['leg_bl', 2, 6],
        ['leg_br', -5, 6],
      ].map(([name, x, z]) => ({
        name, parent: 'root', pivot: [x + 1.5, 12, z + 1.5],
        cubes: [
          { origin: [x, 2, z], size: [3, 10, 3], mat: 'hide' },
          { origin: [x, 0, z], size: [3, 2, 3], mat: 'hoof' },
        ],
      })),
    ],
  },

  materials: {
    hide: {
      base: '#f3f0e7',
      layers: [
        stripes('#1c1c1c', { axis: 2, period: 4, width: 0.45, warp: 1.6, warpScale: 9, where: (c) => isBone('body')(c) && ['left', 'right', 'top'].includes(c.face) }),
        stripes('#1c1c1c', { axis: 1, period: 3, width: 0.45, warp: 1.2, where: (c) => isBone('body')(c) && ['front', 'back'].includes(c.face) }),
        stripes('#1c1c1c', { axis: 1, period: 3, width: 0.45, warp: 1.2, where: (c) => isBone('neck', 'tail', 'leg_fl', 'leg_fr', 'leg_bl', 'leg_br')(c) && notBottom(c) }),
        stripes('#1c1c1c', { axis: 1, period: 2, width: 0.5, warp: 0.6, where: isBone('head') }),
        underside('#f3f0e7', { y: 12.5, soft: 2, where: isBone('body') }),
        mottle(0.05),
        fur(0.05),
      ],
    },
    mane: { base: '#f3f0e7', layers: [stripes('#1c1c1c', { axis: 1, period: 2, width: 0.5, warp: 0 }), fur(0.06)] },
    ear: { base: '#f3f0e7', layers: [stripes('#1c1c1c', { axis: 1, period: 2, width: 0.5, warp: 0 })] },
    muzzle: { base: '#2e2b29', layers: [fur(0.06)] },
    tuft: { base: '#161616', layers: [fur(0.1)] },
    hoof: '#2b2622',
    saddle: { base: '#6b3e1f', layers: [fur(0.05)] },
  },

  anims: quadruped({ neck: 'neck', tail: ['tail'], ears: ['ear_l', 'ear_r'], swing: 30, sleepDrop: 7, legFold: 80, runLength: 0.45 }),
};
