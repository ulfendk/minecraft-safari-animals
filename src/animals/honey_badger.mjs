import { quadruped } from '../lib/anim.mjs';
import { all, bone, eyes, legs4 } from '../lib/parts.mjs';
import { fur, mottle, region } from '../lib/texture.mjs';

// The silver cape runs from the forehead down the back to the tail, ending in a clean line along the flanks.
const CAPE_LINE = 5.8;

export default {
  id: 'honey_badger',
  name: 'Honey Badger',
  role: 'predator',
  family: ['mustelid', 'badger'],
  size: [0.7, 0.6],
  health: 18,
  speed: 0.27,
  xp: 3,
  knockbackResistance: 0.4,
  attack: { damage: 4, speed: 1.4 },
  hunts: ['meerkat', 'rabbit', 'chicken', 'poison_dart_frog', 'scolopender', 'tarantula'],
  huntInterval: 25,
  poisonImmune: true,
  fearless: true,
  sleeps: 'day',
  breed: ['honeycomb'],
  tempt: ['honeycomb', 'honey_bottle'],
  heal: [['honeycomb', 4], ['honey_bottle', 6]],
  spawn: [{ biomes: ['savanna'], weight: 2, group: [1, 2], blocks: ['grass_block', 'coarse_dirt'] }],
  loot: [{ item: 'leather', min: 0, max: 1 }],
  sounds: { ambient: 'mob.wolf.growl', hurt: 'mob.fox.hurt', death: 'mob.fox.death', pitch: [1.2, 1.4], interval: 14 },
  egg: ['#1c1a19', '#d9d6cf'],

  model: {
    bones: [
      { name: 'root', pivot: [0, 0, 0] },
      { name: 'body', parent: 'root', pivot: [0, 6, 0], cubes: [{ origin: [-3, 3, -6], size: [6, 5, 12], mat: 'coat' }] },
      { name: 'tail', parent: 'body', pivot: [0, 7, 6], rotation: [-25, 0, 0], cubes: [{ origin: [-1, 6, 6], size: [2, 2, 3], mat: 'coat' }] },
      {
        name: 'head', parent: 'body', pivot: [0, 6, -6],
        cubes: [
          { origin: [-2, 4, -10], size: [4, 4, 4], mat: 'coat', marks: eyes(4, { back: 1, down: 2, color: '#0a0909' }) },
          { origin: [-1, 4, -12], size: [2, 2, 2], mat: 'snout', marks: [{ face: 'front', x: 0, y: 0, w: 2, color: '#0a0909' }] },
        ],
      },
      { name: 'ear_l', parent: 'head', pivot: [2, 8, -7.5], cubes: [{ origin: [2, 7, -8], size: [1, 1, 1], mat: 'coat' }] },
      { name: 'ear_r', parent: 'head', pivot: [-2, 8, -7.5], cubes: [{ origin: [-3, 7, -8], size: [1, 1, 1], mat: 'coat' }] },
      // Short sturdy legs; the front ones carry long pale digging claws.
      ...legs4({ x: 3, front: -5, back: 3, w: 2, d: 2, h: 4, foot: 1, mat: 'legfur', footMat: 'paw' }).map((b) =>
        b.name.startsWith('leg_f') ? { ...b, cubes: [...b.cubes, { origin: [b.cubes[0].origin[0], 0, b.cubes[0].origin[2] - 1], size: [2, 1, 1], mat: 'claw' }] } : b),
    ],
  },

  materials: {
    coat: {
      base: '#1c1a19',
      layers: [
        // Silver-white cape over the head, back and tail.
        region('#d9d6cf', all(bone('body', 'tail'), ({ face: f, p }) => f === 'top' || p[1] > CAPE_LINE)),
        region('#d9d6cf', all(bone('head', 'ear_l', 'ear_r'), ({ face: f, p }) => f === 'top' || f === 'back' || p[1] > 6.6)),
        // A soft grey edge where the cape meets the black flanks.
        region('#8e8a84', all(bone('body'), ({ face: f, p }) => f !== 'top' && p[1] > CAPE_LINE - 0.9 && p[1] <= CAPE_LINE)),
        mottle(0.08, { scale: 2 }),
        fur(0.09),
      ],
    },
    legfur: { base: '#151413', layers: [fur(0.08)] },
    snout: '#2a2725',
    paw: '#121110',
    claw: '#8e877b',
  },

  anims: quadruped({ tail: ['tail'], swing: 38, sleepDrop: 3, legFold: 80, walkLength: 0.6, runLength: 0.3 }),
};
