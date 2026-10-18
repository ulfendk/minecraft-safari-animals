import { eyes } from '../lib/parts.mjs';
import { fur, mottle, region, underside } from '../lib/texture.mjs';

// One hop: crouch, push off with both feet, tail swings to balance.
const hop = (len, height) => ({
  loop: true,
  animation_length: len,
  bones: {
    root: { position: { '0.00': [0, 0, 0], [(len * 0.5).toFixed(2)]: [0, height, 0], [len.toFixed(2)]: [0, 0, 0] } },
    leg_l: { rotation: { '0.00': [-10, 0, 0], [(len * 0.25).toFixed(2)]: [35, 0, 0], [(len * 0.75).toFixed(2)]: [-20, 0, 0], [len.toFixed(2)]: [-10, 0, 0] } },
    leg_r: { rotation: { '0.00': [-10, 0, 0], [(len * 0.25).toFixed(2)]: [35, 0, 0], [(len * 0.75).toFixed(2)]: [-20, 0, 0], [len.toFixed(2)]: [-10, 0, 0] } },
    tail: { rotation: { '0.00': [0, 0, 0], [(len * 0.5).toFixed(2)]: [-15, 0, 0], [len.toFixed(2)]: [0, 0, 0] } },
    body: { rotation: { '0.00': [0, 0, 0], [(len * 0.5).toFixed(2)]: [15, 0, 0], [len.toFixed(2)]: [0, 0, 0] } },
  },
});

export default {
  id: 'kangaroo',
  name: 'Kangaroo',
  role: 'neutral',
  family: ['marsupial', 'kangaroo'],
  size: [0.8, 1.6],
  health: 20,
  speed: 0.3,
  movement: 'hop',
  xp: 3,
  attack: { damage: 5, speed: 1.3 },
  breed: ['wheat', 'short_grass'],
  tempt: ['wheat', 'carrot'],
  heal: [['wheat', 2], ['carrot', 3]],
  grazes: true,
  sleeps: 'day',
  spawn: [
    { biomes: ['savanna'], weight: 3, group: [2, 5], blocks: ['grass_block', 'coarse_dirt'] },
    { biomes: ['mesa'], weight: 3, group: [2, 4], blocks: ['red_sand', 'coarse_dirt', 'grass_block'] },
  ],
  loot: [{ item: 'leather', min: 0, max: 2 }, { item: 'safari:raw_game_meat', min: 1, max: 2, smelts: true }],
  sounds: { ambient: 'mob.fox.sniff', hurt: 'mob.goat.hurt', death: 'mob.goat.death', pitch: [0.8, 0.9], interval: 15 },
  egg: ['#b9744a', '#f0dcc0'],
  client: { runSpeed: 4 },

  model: {
    bones: [
      { name: 'root', pivot: [0, 0, 0] },
      {
        name: 'body', parent: 'root', pivot: [0, 9, 1], rotation: [25, 0, 0],
        cubes: [{ origin: [-3, 8, -2], size: [6, 11, 6], mat: 'fur' }, { origin: [-2, 9, -3], size: [4, 4, 1], mat: 'pouch' }],
      },
      {
        name: 'head', parent: 'body', pivot: [0, 19, 1], rotation: [-25, 0, 0],
        cubes: [
          { origin: [-2, 19, -2], size: [4, 4, 4], mat: 'fur', marks: eyes(4, { back: 0, down: 1 }) },
          { origin: [-1, 19, -5], size: [2, 3, 3], mat: 'fur', marks: [{ face: 'front', x: 0, y: 0, w: 2, color: '#2a1d16' }] },
        ],
      },
      { name: 'ear_l', parent: 'head', pivot: [1.5, 23, 1.5], rotation: [0, 0, -10], cubes: [{ origin: [1, 23, 1], size: [1, 4, 1], mat: 'ear' }] },
      { name: 'ear_r', parent: 'head', pivot: [-1.5, 23, 1.5], rotation: [0, 0, 10], cubes: [{ origin: [-2, 23, 1], size: [1, 4, 1], mat: 'ear' }] },
      { name: 'arm_l', parent: 'body', pivot: [3, 16, -1], rotation: [-30, 0, 0], cubes: [{ origin: [3, 11, -2], size: [1, 5, 1], mat: 'fur' }] },
      { name: 'arm_r', parent: 'body', pivot: [-3, 16, -1], rotation: [-30, 0, 0], cubes: [{ origin: [-4, 11, -2], size: [1, 5, 1], mat: 'fur' }] },
      {
        name: 'tail', parent: 'root', pivot: [0, 8, 4], rotation: [-20, 0, 0],
        cubes: [{ origin: [-1, 6, 4], size: [2, 3, 7], mat: 'fur' }, { origin: [-1, 6, 11], size: [2, 2, 6], mat: 'fur' }],
      },
      {
        name: 'leg_l', parent: 'root', pivot: [2, 9, 1],
        cubes: [{ origin: [1, 3, -1], size: [3, 7, 5], mat: 'fur' }, { origin: [1, 0, -5], size: [2, 2, 8], mat: 'foot' }],
      },
      {
        name: 'leg_r', parent: 'root', pivot: [-2, 9, 1],
        cubes: [{ origin: [-4, 3, -1], size: [3, 7, 5], mat: 'fur' }, { origin: [-3, 0, -5], size: [2, 2, 8], mat: 'foot' }],
      },
    ],
  },

  materials: {
    fur: { base: '#b9744a', layers: [underside('#f0dcc0', { y: 0, soft: 1 }), region('#e8cfae', ({ cube, face: f }) => cube.bone === 'body' && f === 'front'), mottle(0.06), fur(0.05)] },
    pouch: '#d9b48c',
    ear: { base: '#b9744a', layers: [region('#d99a8a', ({ face: f }) => f === 'front')] },
    foot: '#7a4a2e',
  },

  anims: {
    walk: hop(0.6, 3),
    run: hop(0.4, 4),
    idle: {
      loop: true, animation_length: 4,
      bones: {
        ear_l: { rotation: { '0.00': [0, 0, -10], '0.30': [0, 0, -25], '0.60': [0, 0, -10], '4.00': [0, 0, -10] } },
        tail: { rotation: { '0.00': [-20, 0, 0], '2.00': [-20, 6, 0], '4.00': [-20, 0, 0] } },
      },
    },
    eat: { loop: true, bones: { body: { rotation: [70, 0, 0], position: [0, -3, 0] }, head: { rotation: [-20, 0, 0] }, arm_l: { rotation: [-80, 0, 0] }, arm_r: { rotation: [-80, 0, 0] } } },
    attack: {
      animation_length: 0.6,
      bones: {
        // Leans back on the tail and kicks with both feet.
        body: { rotation: { '0.00': [0, 0, 0], '0.20': [-25, 0, 0], '0.60': [0, 0, 0] } },
        leg_l: { rotation: { '0.00': [0, 0, 0], '0.25': [-80, 0, 0], '0.60': [0, 0, 0] } },
        leg_r: { rotation: { '0.00': [0, 0, 0], '0.25': [-80, 0, 0], '0.60': [0, 0, 0] } },
      },
    },
    sleep: { loop: true, bones: { body: { rotation: [80, 0, 30], position: [0, -6, 0] }, head: { rotation: [-60, 0, 0] }, leg_l: { rotation: [-60, 0, 0], position: [0, -3, 0] }, leg_r: { rotation: [-60, 0, 0], position: [0, -3, 0] } } },
  },
};
