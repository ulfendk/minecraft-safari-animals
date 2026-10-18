import { extras, quadruped } from '../lib/anim.mjs';
import { eyes, legs4 } from '../lib/parts.mjs';
import { corner, fur, hex, mottle, noise3, region, TRANSPARENT } from '../lib/texture.mjs';

const top = 35; // top of the back

/** Broken horizontal creases, like elephant skin. */
const wrinkles = (color, every) => (c, { p, face: f }) =>
  f !== 'top' && f !== 'bottom' && Math.floor(p[1] + noise3(p[0] / 3, 0, p[2] / 3, 5) * 1.5) % every === 0 && noise3(p[0], p[1], p[2], 9) > 0.35 ? hex(color) : c;

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
      { name: 'root', pivot: [0, 0, 0] },
      {
        name: 'body', parent: 'root', pivot: [0, 26, 0],
        cubes: [
          { origin: [-9, 18, -13], size: [18, 17, 26], mat: 'hide' },
          // Sagging belly and high shoulders.
          { origin: [-8, 16, -9], size: [16, 2, 18], mat: 'hide' },
          { origin: [-8, 35, -12], size: [16, 2, 9], mat: 'hide' },
        ],
      },
      ...legs4({ x: 8, front: -12, back: 6, w: 6, h: 19, foot: 1, mat: 'leg', footMat: 'toe' }),
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
        name: 'tail', parent: 'body', pivot: [0, top - 3, 13], rotation: [10, 0, 0],
        cubes: [
          { origin: [-1, top - 15, 13], size: [2, 12, 1], mat: 'hide' },
          { origin: [-1, top - 18, 13], size: [2, 3, 1], mat: 'tuft' },
        ],
      },
      {
        name: 'head', parent: 'body', pivot: [0, 32, -13],
        cubes: [
          { origin: [-6, 22, -21], size: [12, 14, 9], mat: 'hide', marks: eyes(9, { back: 4, down: 6, color: '#2a2018' }) },
          // Domed forehead and lower lip.
          { origin: [-5, 36, -20], size: [10, 2, 7], mat: 'hide' },
          { origin: [-3, 19, -20], size: [6, 3, 5], mat: 'lip' },
          // Tusks: forward, then curving up at the tips.
          { origin: [3, 19, -26], size: [2, 2, 5], mat: 'tusk' },
          { origin: [3, 20, -28], size: [1, 3, 2], mat: 'tusk' },
          { origin: [-5, 19, -26], size: [2, 2, 5], mat: 'tusk' },
          { origin: [-4, 20, -28], size: [1, 3, 2], mat: 'tusk' },
        ],
      },
      // Big African ears, swept back, with rounded corners.
      { name: 'ear_l', parent: 'head', pivot: [6, 35, -16], rotation: [0, -30, 0], cubes: [{ origin: [6, 19, -16], size: [12, 17, 1], mat: 'ear' }] },
      { name: 'ear_r', parent: 'head', pivot: [-6, 35, -16], rotation: [0, 30, 0], cubes: [{ origin: [-18, 19, -16], size: [12, 17, 1], mat: 'ear' }] },
      { name: 'trunk', parent: 'head', pivot: [0, 27, -23], cubes: [{ origin: [-2, 19, -25], size: [4, 8, 4], mat: 'trunk' }] },
      { name: 'trunk2', parent: 'trunk', pivot: [0, 19, -23], rotation: [-6, 0, 0], cubes: [{ origin: [-2, 12, -25], size: [4, 7, 3], mat: 'trunk' }] },
      {
        name: 'trunk3', parent: 'trunk2', pivot: [0, 12, -23.5], rotation: [-14, 0, 0],
        cubes: [{ origin: [-1, 5, -25], size: [2, 7, 2], mat: 'trunk' }, { origin: [-2, 4, -26], size: [4, 1, 3], mat: 'trunk' }],
      },
    ],
  },

  materials: {
    hide: {
      base: '#8a8580',
      layers: [
        // Deep skin folds on the sides and a rough, wrinkled surface.
        region('#6e6964', ({ face: f, p }) => (f === 'left' || f === 'right') && (Math.abs(p[2] + 3) < 0.6 || Math.abs(p[2] - 7) < 0.6) && p[1] < 32),
        wrinkles('#7c7772', 4),
        mottle(0.1, { scale: 5 }),
        fur(0.07),
      ],
    },
    leg: { base: '#857f7a', layers: [wrinkles('#75706b', 3), mottle(0.08), fur(0.06)] },
    ear: {
      base: '#8a8580',
      layers: [
        region('#b0908a', ({ face: f, i, j, fw, fh }) => f === 'front' && i > 1 && j > 1 && i < fw - 2 && j < fh - 2),
        region('#9a7f7a', ({ face: f, i, j }) => f === 'front' && (i + j) % 5 === 0 && i > 2 && j > 2),
        mottle(0.1),
        fur(0.06),
        region(TRANSPARENT, (ctx) => ((ctx.face === 'front' || ctx.face === 'back') && corner(4)(ctx)) || !['front', 'back'].includes(ctx.face)),
      ],
    },
    trunk: { base: '#857f7a', layers: [wrinkles('#736e69', 2), fur(0.05)] },
    lip: { base: '#7a6f6a', layers: [region('#b88a86', ({ face: f }) => f === 'top')] },
    tusk: { base: '#efe6d0', layers: [region('#d8cbb0', ({ p }) => p[2] > -23)] },
    tuft: '#2f2b28',
    toe: { base: '#8a8580', layers: [region('#d9d2c4', ({ face: f, i }) => f === 'front' && i % 2 === 1)] },
    blanket: { base: '#a8262b', layers: [region('#e0b23a', ({ p }) => Math.floor(p[1]) % 6 === 0 || Math.floor(p[2]) % 6 === 0), fur(0.04)] },
    chest: { base: '#8f6a35', layers: [region('#4e3a1c', ({ i, j, fw, fh }) => i === 0 || j === 0 || i === fw - 1 || j === fh - 1), region('#b9b9b9', chestLatch)] },
  },

  anims: {
    ...quadruped({ tail: ['tail'], ears: ['ear_l', 'ear_r'], swing: 18, sleepDrop: 12, legFold: 75, walkLength: 1.5, runLength: 0.8 }),
    ...extras.trunk(['trunk', 'trunk2', 'trunk3']),
  },
};

function chestLatch({ face: f, i, j, fw }) {
  return f !== 'top' && f !== 'bottom' && j === 2 && i === Math.floor(fw / 2);
}
