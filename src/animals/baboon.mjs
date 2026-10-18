import { primate, quadruped } from '../lib/anim.mjs';
import { all, bone, eyes, face, legs4 } from '../lib/parts.mjs';
import { fur, mottle, region } from '../lib/texture.mjs';

export default {
  id: 'baboon',
  name: 'Baboon',
  role: 'neutral',
  family: ['primate', 'monkey'],
  size: [0.7, 0.9],
  health: 14,
  speed: 0.28,
  xp: 2,
  attack: { damage: 3, speed: 1.4 },
  alertsPack: true,
  climbs: true,
  breed: ['sweet_berries', 'wheat', 'apple'],
  tempt: ['sweet_berries', 'wheat', 'apple', 'bread'],
  heal: [['apple', 4], ['sweet_berries', 2], ['bread', 4]],
  sleeps: 'night',
  spawn: [{ biomes: ['savanna'], weight: 3, group: [4, 7], blocks: ['grass_block', 'coarse_dirt'] }],
  loot: [],
  sounds: { ambient: 'mob.fox.screech', hurt: 'mob.fox.hurt', death: 'mob.fox.death', pitch: [1.0, 1.2], interval: 14 },
  egg: ['#7a6f4a', '#c98a8a'],

  model: {
    bones: [
      { name: 'root', pivot: [0, 0, 0] },
      {
        name: 'body', parent: 'root', pivot: [0, 10, 0],
        cubes: [
          { origin: [-3, 8, -6], size: [6, 7, 6], mat: 'fur' },
          { origin: [-3, 7, 0], size: [6, 6, 6], mat: 'fur' },
          { origin: [-4, 12, -6], size: [8, 4, 4], mat: 'mane' },
        ],
      },
      {
        name: 'tail', parent: 'body', pivot: [0, 12, 6], rotation: [40, 0, 0],
        cubes: [{ origin: [0, 12, 6], size: [1, 1, 4], mat: 'fur' }],
      },
      { name: 'tail2', parent: 'tail', pivot: [0.5, 12.5, 10], rotation: [-110, 0, 0], cubes: [{ origin: [0, 12, 10], size: [1, 1, 6], mat: 'fur' }] },
      {
        name: 'head', parent: 'body', pivot: [0, 13, -6],
        cubes: [
          { origin: [-2, 11, -10], size: [4, 4, 4], mat: 'fur', marks: eyes(4, { back: 0, down: 1, color: '#3a2618' }) },
          { origin: [-1, 10, -14], size: [2, 3, 4], mat: 'face', marks: [{ face: 'front', x: 0, y: 0, w: 2, color: '#2a1d18' }] },
        ],
      },
      ...legs4({ x: 3, front: -5, back: 3, w: 2, h: 8, frontH: 9, foot: 0, mat: 'fur' }),
    ],
  },

  materials: {
    fur: { base: '#7a6f4a', layers: [region('#c98a8a', all(bone('body'), face('back'), ({ p }) => p[1] < 10)), mottle(0.1, { scale: 3 }), fur(0.08)] },
    mane: { base: '#8a805a', layers: [fur(0.12)] },
    face: { base: '#4a3a34', layers: [fur(0.04)] },
  },

  anims: {
    ...quadruped({ tail: ['tail', 'tail2'], swing: 30, sleepDrop: 5, legFold: 75, walkLength: 0.8, runLength: 0.4 }),
    ...primate({ armL: 'leg_fl', armR: 'leg_fr' }),
  },
};
