import { extras, quadruped } from '../lib/anim.mjs';
import { pillarBody } from '../lib/bodies.mjs';
import { eyes } from '../lib/parts.mjs';
import { fur, mottle, region } from '../lib/texture.mjs';

const body = pillarBody({ bodyW: 18, bodyH: 17, bodyL: 28, legH: 19, legW: 6 });
const top = body.top; // 35

export default {
  id: 'elephant',
  name: 'Elephant',
  role: 'megafauna',
  family: ['elephant'],
  size: [2.2, 2.8],
  health: 60,
  speed: 0.2,
  xp: 7,
  knockbackResistance: 0.9,
  attack: { damage: 10, speed: 1.2 },
  alertsPack: true,
  breed: ['hay_block', 'melon_slice'],
  tempt: ['melon_slice', 'apple', 'sugar_cane', 'hay_block'],
  heal: [['melon_slice', 3], ['apple', 4], ['hay_block', 20], ['sugar_cane', 2]],
  sleeps: 'night',
  strollRange: 16,
  ride: {
    seats: [[0, 2.45, -0.3], [0, 2.45, 0.7]],
    tameItems: ['melon_slice', 'apple', 'sugar_cane', 'hay_block'],
    temper: 120,
    chest: true,
    jump: false,
  },
  spawn: [{ biomes: ['savanna'], weight: 3, group: [2, 4], blocks: ['grass_block'] }],
  loot: [{ item: 'leather', min: 1, max: 3 }],
  sounds: { ambient: 'mob.ravager.ambient', hurt: 'mob.ravager.hurt', death: 'mob.ravager.death', pitch: [1.1, 1.3], interval: 20 },
  egg: ['#8a8580', '#c9c2b8'],
  client: { runSpeed: 4, idle: ['idle', 'trunk_idle'] },

  model: {
    bones: [
      ...body.bones,
      {
        name: 'saddle', parent: 'body', pivot: [0, top, 0],
        cubes: [
          { origin: [-8, top, -8], size: [16, 1, 16], mat: 'blanket' },
          { origin: [-10, top - 8, -8], size: [2, 9, 16], mat: 'blanket' },
          { origin: [8, top - 8, -8], size: [2, 9, 16], mat: 'blanket' },
        ],
      },
      {
        name: 'chest', parent: 'body', pivot: [0, top - 6, 6],
        cubes: [
          { origin: [-12, top - 13, 4], size: [3, 7, 8], mat: 'chest' },
          { origin: [9, top - 13, 4], size: [3, 7, 8], mat: 'chest' },
        ],
      },
      {
        name: 'tail', parent: 'body', pivot: [0, top - 3, 14], rotation: [10, 0, 0],
        cubes: [
          { origin: [-1, top - 15, 14], size: [2, 12, 1], mat: 'hide' },
          { origin: [-1, top - 18, 14], size: [2, 3, 1], mat: 'tuft' },
        ],
      },
      {
        name: 'head', parent: 'body', pivot: [0, top - 3, -14],
        cubes: [
          { origin: [-6, 23, -22], size: [12, 13, 9], mat: 'hide', marks: eyes(9, { back: 3, down: 5 }) },
          { origin: [3, 21, -27], size: [1, 1, 6], mat: 'tusk' },
          { origin: [-4, 21, -27], size: [1, 1, 6], mat: 'tusk' },
          { origin: [3, 22, -27], size: [1, 2, 1], mat: 'tusk' },
          { origin: [-4, 22, -27], size: [1, 2, 1], mat: 'tusk' },
        ],
      },
      { name: 'ear_l', parent: 'head', pivot: [6, 35, -16], rotation: [0, -15, 0], cubes: [{ origin: [6, 22, -17], size: [9, 14, 1], mat: 'ear' }] },
      { name: 'ear_r', parent: 'head', pivot: [-6, 35, -16], rotation: [0, 15, 0], cubes: [{ origin: [-15, 22, -17], size: [9, 14, 1], mat: 'ear' }] },
      { name: 'trunk', parent: 'head', pivot: [0, 27, -22], cubes: [{ origin: [-2, 17, -25], size: [4, 10, 3], mat: 'trunk' }] },
      { name: 'trunk2', parent: 'trunk', pivot: [0, 17, -23.5], rotation: [-10, 0, 0], cubes: [{ origin: [-1, 7, -25], size: [2, 10, 2], mat: 'trunk' }] },
    ],
  },

  materials: {
    hide: { base: '#8a8580', layers: [mottle(0.1, { scale: 5 }), fur(0.07)] },
    ear: { base: '#8a8580', layers: [region('#a88a86', ({ face: f }) => f === 'front'), mottle(0.1), fur(0.06)] },
    trunk: { base: '#857f7a', layers: [region('#6c6763', ({ p, face: f }) => f !== 'top' && f !== 'bottom' && Math.floor(p[1]) % 2 === 0), fur(0.05)] },
    tusk: '#f1ead8',
    tuft: '#2f2b28',
    toe: { base: '#8a8580', layers: [region('#d9d2c4', ({ face: f, i }) => f === 'front' && i % 2 === 1)] },
    blanket: { base: '#a8262b', layers: [region('#e0b23a', ({ p }) => Math.floor(p[1]) % 6 === 0 || Math.floor(p[2]) % 6 === 0), fur(0.04)] },
    chest: { base: '#8f6a35', layers: [region('#4e3a1c', ({ i, j, fw, fh }) => i === 0 || j === 0 || i === fw - 1 || j === fh - 1), region('#b9b9b9', chestLatch)] },
  },

  anims: {
    ...quadruped({ tail: ['tail'], ears: ['ear_l', 'ear_r'], swing: 18, sleepDrop: 12, legFold: 75, walkLength: 1.5, runLength: 0.8 }),
    ...extras.trunk(['trunk', 'trunk2']),
  },
};

function chestLatch({ face: f, i, j, fw }) {
  return f !== 'top' && f !== 'bottom' && j === 2 && i === Math.floor(fw / 2);
}
