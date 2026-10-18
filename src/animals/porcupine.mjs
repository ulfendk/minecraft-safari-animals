import { quadruped } from '../lib/anim.mjs';
import { eyes, legs4 } from '../lib/parts.mjs';
import { fur, region } from '../lib/texture.mjs';

/** Quills lie back along the body: dark with pale streaks running front to back. */
const streaks = (c, { p, face: f }) => {
  const lane = f === 'top' || f === 'bottom' ? p[0] : p[1];
  const k = Math.floor(lane * 1.5 + 7) * 7 + Math.floor(p[2] / 3);
  return (k * 2654435761 >>> 0) % 5 < 2 ? [226, 220, 205, 255] : c;
};

// Long banded spines raised over the back, fanning out to the sides and rear.
const spines = [];
const SPINES = [
  [-3, -2, -20, 25], [2, -2, -20, -25], [-1, -1, -35, 10], [0, 0, -30, -10], [-4, 1, -40, 35], [3, 1, -40, -35],
  [-2, 2, -50, 15], [1, 2, -50, -15], [-1, 4, -60, 5], [0, 4, -60, -5], [-3, 5, -55, 30], [2, 5, -55, -30],
];
for (const [x, z, rx, rz] of SPINES) {
  spines.push({ origin: [x, 8, z], size: [1, 8, 1], mat: 'spine', rotation: [rx, 0, rz], pivot: [x + 0.5, 8, z + 0.5] });
}

export default {
  id: 'porcupine',
  name: 'Porcupine',
  role: 'prey',
  family: ['rodent', 'porcupine'],
  size: [0.7, 0.7],
  health: 14,
  speed: 0.18,
  xp: 2,
  quills: true,
  sleeps: 'day',
  breed: ['carrot', 'potato', 'beetroot'],
  tempt: ['carrot', 'potato', 'beetroot', 'apple'],
  heal: [['carrot', 3], ['apple', 3]],
  spawn: [
    { biomes: ['savanna'], weight: 2, group: [1, 2], blocks: ['grass_block', 'coarse_dirt'] },
    { biomes: ['desert', 'mesa'], weight: 1, group: [1, 1] },
  ],
  loot: [{ item: 'arrow', min: 0, max: 2 }],
  sounds: { ambient: 'mob.armadillo.ambient', hurt: 'mob.armadillo.hurt', death: 'mob.armadillo.death', pitch: [0.9, 1.1], interval: 16 },
  egg: ['#2a211b', '#ece8de'],

  model: {
    bones: [
      { name: 'root', pivot: [0, 0, 0] },
      {
        name: 'body', parent: 'root', pivot: [0, 5, 0],
        cubes: [
          { origin: [-3, 2, -5], size: [6, 5, 9], mat: 'fur' },
          // The quill mantle sits over the back and rump.
          { origin: [-4, 4, -2], size: [8, 4, 9], mat: 'quills' },
          { origin: [-3, 8, -1], size: [6, 2, 7], mat: 'quills' },
          ...spines,
        ],
      },
      { name: 'tail', parent: 'body', pivot: [0, 5, 7], rotation: [-20, 0, 0], cubes: [{ origin: [-2, 3, 7], size: [4, 3, 2], mat: 'quills' }] },
      {
        name: 'head', parent: 'body', pivot: [0, 5, -5],
        cubes: [
          { origin: [-2, 2, -9], size: [4, 4, 4], mat: 'face', marks: eyes(4, { back: 1, down: 1, color: '#0a0806' }) },
          { origin: [-1, 2, -11], size: [2, 2, 2], mat: 'face', marks: [{ face: 'front', x: 0, y: 0, w: 2, color: '#0a0806' }] },
          // A short crest of quills on the head.
          { origin: [-1, 6, -7], size: [2, 2, 3], mat: 'quills' },
        ],
      },
      { name: 'ear_l', parent: 'head', pivot: [2, 5, -6.5], cubes: [{ origin: [2, 5, -7], size: [1, 1, 1], mat: 'face' }] },
      { name: 'ear_r', parent: 'head', pivot: [-2, 5, -6.5], cubes: [{ origin: [-3, 5, -7], size: [1, 1, 1], mat: 'face' }] },
      ...legs4({ x: 3, front: -4, back: 2, w: 2, d: 2, h: 3, foot: 0, mat: 'fur' }),
    ],
  },

  materials: {
    fur: { base: '#2a211b', layers: [fur(0.1)] },
    face: { base: '#3a2e25', layers: [fur(0.06)] },
    quills: { base: '#1e1915', layers: [streaks, fur(0.15)] },
    spine: { base: '#1e1915', layers: [region('#ece8de', ({ j }) => j % 3 !== 2)] },
  },

  anims: quadruped({ tail: ['tail'], swing: 30, sleepDrop: 2, legFold: 70, walkLength: 0.9, runLength: 0.5 }),
};
