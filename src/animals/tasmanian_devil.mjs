import { quadruped } from '../lib/anim.mjs';
import { all, bone, face, legs4 } from '../lib/parts.mjs';
import { fur, mottle, region } from '../lib/texture.mjs';

export default {
  id: 'tasmanian_devil',
  name: 'Tasmanian Devil',
  role: 'predator',
  family: ['marsupial', 'devil', 'scavenger'],
  size: [0.6, 0.6],
  health: 16,
  speed: 0.28,
  xp: 3,
  attack: { damage: 5, speed: 1.5 },
  hunts: ['rabbit', 'chicken', 'koala'],
  huntInterval: 30,
  hostile: { range: 4, filters: [{ test: 'is_daytime', subject: 'self', value: false }] },
  sleeps: 'day',
  breed: ['safari:raw_game_meat', 'rotten_flesh'],
  tempt: ['safari:raw_game_meat', 'rotten_flesh', 'beef'],
  heal: [['safari:raw_game_meat', 4], ['rotten_flesh', 2]],
  extraComponents: {
    'minecraft:shareables': {
      singular_pickup: true,
      items: ['safari:raw_game_meat', 'beef', 'porkchop', 'mutton', 'chicken', 'rabbit', 'rotten_flesh', 'bone'].map((item) => ({
        item: item.includes(':') ? item : `minecraft:${item}`, priority: 0, max_amount: 1,
      })),
    },
    'minecraft:equip_item': { can_wear_armor: false },
    'minecraft:behavior.pickup_items': { priority: 4, max_dist: 12, goal_radius: 1.5, speed_multiplier: 1.3 },
    'minecraft:behavior.eat_carried_item': { priority: 12, delay_before_eating: 60 },
  },
  spawn: [{ biomes: ['forest'], weight: 2, group: [1, 2], blocks: ['grass_block', 'podzol'] }],
  loot: [{ item: 'bone', min: 0, max: 1 }],
  sounds: { ambient: 'mob.fox.screech', hurt: 'mob.fox.hurt', death: 'mob.fox.death', pitch: [0.55, 0.7], interval: 12 },
  egg: ['#151313', '#f2efe8'],

  model: {
    bones: [
      { name: 'root', pivot: [0, 0, 0] },
      { name: 'body', parent: 'root', pivot: [0, 6, 0], cubes: [{ origin: [-3, 3, -5], size: [6, 6, 10], mat: 'coat' }] },
      { name: 'tail', parent: 'body', pivot: [0, 7, 5], rotation: [35, 0, 0], cubes: [{ origin: [-1, 3, 5], size: [2, 4, 2], mat: 'coat' }] },
      {
        name: 'head', parent: 'body', pivot: [0, 7, -5],
        cubes: [
          // Oversized head for its powerful jaws.
          {
            origin: [-3, 4, -10], size: [6, 5, 5], mat: 'coat',
            marks: [{ face: 'front', x: 1, y: 1, color: '#0a0909' }, { face: 'front', x: 4, y: 1, color: '#0a0909' }],
          },
          { origin: [-2, 4, -12], size: [4, 3, 2], mat: 'muzzle', marks: [{ face: 'front', x: 1, y: 0, w: 2, color: '#e08a94' }] },
          { origin: [-2, 3, -12], size: [4, 1, 3], mat: 'jaw' },
        ],
      },
      { name: 'ear_l', parent: 'head', pivot: [2, 9, -7.5], rotation: [0, 0, -15], cubes: [{ origin: [1, 9, -8], size: [2, 2, 1], mat: 'ear' }] },
      { name: 'ear_r', parent: 'head', pivot: [-2, 9, -7.5], rotation: [0, 0, 15], cubes: [{ origin: [-3, 9, -8], size: [2, 2, 1], mat: 'ear' }] },
      ...legs4({ x: 3, front: -4, back: 2, w: 2, d: 2, h: 4, foot: 1, mat: 'coat', footMat: 'paw' }),
    ],
  },

  materials: {
    coat: {
      base: '#151313',
      layers: [
        // White blaze across the chest, and often a small patch on the rump.
        region('#f2efe8', all(bone('body'), ({ face: f, p }) => (f === 'front' && p[1] < 7 && p[1] > 4.5) || ((f === 'left' || f === 'right') && p[2] < -3.5 && p[1] < 6.5 && p[1] > 5))),
        region('#f2efe8', all(bone('body'), face('top'), ({ p }) => p[2] > 3 && Math.abs(p[0]) < 1.5)),
        mottle(0.08, { scale: 2 }),
        fur(0.09),
      ],
    },
    muzzle: { base: '#2a2424', layers: [fur(0.04)] },
    jaw: { base: '#2a2424', layers: [region('#c44a52', face('top'))] },
    ear: { base: '#151313', layers: [region('#d97a84', ({ face: f }) => f === 'front')] },
    paw: '#2e2a28',
  },

  anims: quadruped({ tail: ['tail'], ears: ['ear_l', 'ear_r'], swing: 36, sleepDrop: 3, legFold: 80, walkLength: 0.6, runLength: 0.3 }),
};
