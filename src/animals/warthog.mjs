import { quadruped } from '../lib/anim.mjs';
import { eyes, legs4, nostrils } from '../lib/parts.mjs';
import { fur, mottle, region } from '../lib/texture.mjs';

export default {
  id: 'warthog',
  name: 'Warthog',
  role: 'prey',
  family: ['pig', 'grazer'],
  size: [0.9, 0.8],
  health: 12,
  speed: 0.27,
  xp: 2,
  breed: ['carrot', 'potato', 'beetroot'],
  tempt: ['carrot', 'potato', 'beetroot'],
  grazes: true,
  sleeps: 'night',
  spawn: [{ biomes: ['savanna'], weight: 5, group: [2, 4], blocks: ['grass_block', 'coarse_dirt'] }],
  loot: [{ item: 'safari:raw_game_meat', min: 1, max: 2, smelts: true }],
  sounds: { ambient: 'mob.pig.say', hurt: 'mob.hoglin.hurt', death: 'mob.pig.death', pitch: [0.9, 1.1] },
  egg: ['#6b5d55', '#efe6cf'],

  model: {
    bones: [
      { name: 'root', pivot: [0, 0, 0] },
      {
        name: 'body', parent: 'root', pivot: [0, 10, 0],
        cubes: [
          { origin: [-4, 6, -7], size: [8, 7, 14], mat: 'hide' },
        ],
      },
      {
        name: 'tail', parent: 'body', pivot: [0, 12, 7], rotation: [-15, 0, 0],
        cubes: [
          { origin: [0, 12, 7], size: [1, 6, 1], mat: 'hide' },
          { origin: [0, 18, 7], size: [1, 2, 1], mat: 'mane' },
        ],
      },
      {
        name: 'head', parent: 'body', pivot: [0, 11, -7],
        cubes: [
          { origin: [-3, 6, -13], size: [6, 6, 6], mat: 'hide', marks: eyes(6, { back: 2, down: 1 }) },
          { origin: [-2, 6, -16], size: [4, 3, 3], mat: 'snout', marks: nostrils(4, { down: 1 }) },
          { origin: [2, 8, -16], size: [1, 2, 1], mat: 'tusk' },
          { origin: [3, 10, -16], size: [1, 2, 1], mat: 'tusk' },
          { origin: [-3, 8, -16], size: [1, 2, 1], mat: 'tusk' },
          { origin: [-4, 10, -16], size: [1, 2, 1], mat: 'tusk' },
          { origin: [3, 9, -12], size: [1, 2, 1], mat: 'hide' },
          { origin: [-4, 9, -12], size: [1, 2, 1], mat: 'hide' },
          { origin: [-1, 12, -11], size: [2, 1, 4], mat: 'mane' },
        ],
      },
      { name: 'ear_l', parent: 'head', pivot: [2, 12, -8.5], cubes: [{ origin: [2, 12, -9], size: [2, 2, 1], mat: 'hide' }] },
      { name: 'ear_r', parent: 'head', pivot: [-2, 12, -8.5], cubes: [{ origin: [-4, 12, -9], size: [2, 2, 1], mat: 'hide' }] },
      ...legs4({ x: 4, front: -6, back: 4, w: 2, d: 2, h: 7, foot: 1 }),
    ],
  },

  materials: {
    hide: { base: '#6e6058', layers: [region('#3a2c22', ({ cube, face: f, p }) => cube.bone === 'body' && f === 'top' && Math.abs(p[0]) < 1.2), mottle(0.12), fur(0.1)] },
    mane: { base: '#3a2c22', layers: [fur(0.12)] },
    snout: { base: '#8c7468', layers: [fur(0.05)] },
    tusk: '#efe6cf',
    hoof: '#2c2420',
  },

  anims: quadruped({ tail: ['tail'], ears: ['ear_l', 'ear_r'], swing: 35, sleepDrop: 4, legFold: 80, walkLength: 0.7, runLength: 0.35 }),
};
