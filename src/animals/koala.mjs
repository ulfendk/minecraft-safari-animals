import { frontEyes, legs4 } from '../lib/parts.mjs';
import { fur, mottle, region } from '../lib/texture.mjs';

export default {
  id: 'koala',
  name: 'Koala',
  role: 'neutral',
  family: ['marsupial', 'koala'],
  size: [0.6, 0.7],
  health: 10,
  speed: 0.12,
  xp: 2,
  climbs: true,
  fallImmune: true,
  breed: ['oak_leaves', 'birch_leaves'],
  tempt: ['oak_leaves', 'birch_leaves', 'jungle_leaves', 'acacia_leaves'],
  heal: [['oak_leaves', 2]],
  // Koalas sleep most of the day.
  sleeps: 'day',
  strollRange: 4,
  spawn: [
    { biomes: ['forest'], weight: 2, group: [1, 2], blocks: ['grass_block'] },
    { biomes: ['savanna'], weight: 1, group: [1, 2], blocks: ['grass_block'] },
  ],
  loot: [],
  sounds: { ambient: 'mob.panda.idle', hurt: 'mob.panda.hurt', death: 'mob.panda.death', pitch: [1.5, 1.7], interval: 30 },
  egg: ['#8f8d8a', '#2a2624'],

  model: {
    bones: [
      { name: 'root', pivot: [0, 0, 0] },
      { name: 'body', parent: 'root', pivot: [0, 6, 0], cubes: [{ origin: [-3, 3, -4], size: [6, 6, 8], mat: 'fur' }] },
      {
        name: 'head', parent: 'body', pivot: [0, 8, -4],
        cubes: [
          { origin: [-3, 6, -9], size: [6, 5, 5], mat: 'fur', marks: frontEyes(6, { gap: 2, down: 1, color: '#1a1614' }) },
          { origin: [-1, 6, -10], size: [2, 3, 1], mat: 'nose' },
        ],
      },
      { name: 'ear_l', parent: 'head', pivot: [3, 10, -6.5], cubes: [{ origin: [2, 9, -7], size: [3, 3, 1], mat: 'ear' }] },
      { name: 'ear_r', parent: 'head', pivot: [-3, 10, -6.5], cubes: [{ origin: [-5, 9, -7], size: [3, 3, 1], mat: 'ear' }] },
      ...legs4({ x: 3, front: -3, back: 1, w: 2, d: 2, h: 4, foot: 1, mat: 'fur', footMat: 'claw' }),
    ],
  },

  materials: {
    fur: { base: '#8f8d8a', layers: [region('#d9d4cc', ({ cube, face: f }) => cube.bone === 'body' && (f === 'bottom' || f === 'front')), mottle(0.08, { scale: 2 }), fur(0.08)] },
    ear: { base: '#8f8d8a', layers: [region('#efeae2', ({ face: f, i, j, fw, fh }) => f === 'front' || i === 0 || j === 0 || i === fw - 1 || j === fh - 1)] },
    nose: '#2a2624',
    claw: '#3a3532',
  },

  anims: {
    walk: { loop: true, animation_length: 1.4, bones: {
      leg_fl: { rotation: { '0.00': [20, 0, 0], '0.70': [-20, 0, 0], '1.40': [20, 0, 0] } },
      leg_br: { rotation: { '0.00': [20, 0, 0], '0.70': [-20, 0, 0], '1.40': [20, 0, 0] } },
      leg_fr: { rotation: { '0.00': [-20, 0, 0], '0.70': [20, 0, 0], '1.40': [-20, 0, 0] } },
      leg_bl: { rotation: { '0.00': [-20, 0, 0], '0.70': [20, 0, 0], '1.40': [-20, 0, 0] } },
    } },
    idle: { loop: true, animation_length: 6, bones: { head: { rotation: { '0.00': [0, 0, 0], '3.00': [5, 10, 0], '6.00': [0, 0, 0] } } } },
    sleep: { loop: true, bones: {
      body: { position: [0, -2, 0] },
      head: { rotation: [35, 0, 0] },
      leg_fl: { rotation: [-80, 0, 0], position: [0, -2, 0] }, leg_fr: { rotation: [-80, 0, 0], position: [0, -2, 0] },
      leg_bl: { rotation: [80, 0, 0], position: [0, -2, 0] }, leg_br: { rotation: [80, 0, 0], position: [0, -2, 0] },
    } },
  },
};
