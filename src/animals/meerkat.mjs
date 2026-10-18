import { extras, quadruped } from '../lib/anim.mjs';
import { bone, eyes, legs4 } from '../lib/parts.mjs';
import { fur, region, stripes, underside } from '../lib/texture.mjs';

export default {
  id: 'meerkat',
  name: 'Meerkat',
  role: 'prey',
  family: ['meerkat', 'small'],
  size: [0.4, 0.5],
  health: 6,
  speed: 0.3,
  panicSpeed: 1.7,
  fleeDistance: 14,
  xp: 1,
  breed: ['spider_eye', 'sweet_berries'],
  tempt: ['spider_eye', 'sweet_berries'],
  sleeps: 'night',
  strollRange: 6,
  properties: { 'safari:sentry': { type: 'bool', default: false, client_sync: true } },
  spawn: [
    { biomes: ['savanna'], weight: 4, group: [3, 6], blocks: ['grass_block', 'coarse_dirt'] },
    { biomes: ['desert'], weight: 2, group: [3, 5], blocks: ['sand'] },
  ],
  loot: [],
  sounds: { ambient: 'mob.fox.ambient', hurt: 'mob.fox.hurt', death: 'mob.fox.death', pitch: [1.6, 1.8], interval: 10 },
  egg: ['#c9a777', '#3a2a1e'],
  client: { extraStates: [{ name: 'standing', anim: 'stand', cond: "query.property('safari:sentry')" }], idle: ['idle'] },

  model: {
    bones: [
      { name: 'root', pivot: [0, 0, 0] },
      { name: 'body', parent: 'root', pivot: [0, 4, 2], cubes: [{ origin: [-2, 2, -4], size: [4, 4, 8], mat: 'fur' }] },
      {
        name: 'head', parent: 'body', pivot: [0, 5, -4],
        cubes: [
          { origin: [-2, 4, -7], size: [4, 3, 3], mat: 'fur', marks: eyes(3, { back: 1, down: 1, color: '#1a120c' }) },
          { origin: [-1, 4, -9], size: [2, 2, 2], mat: 'snout', marks: [{ face: 'front', x: 0, y: 0, w: 2, color: '#1a120c' }] },
        ],
      },
      { name: 'ear_l', parent: 'head', pivot: [2, 6, -5.5], cubes: [{ origin: [2, 5, -6], size: [1, 1, 1], mat: 'dark' }] },
      { name: 'ear_r', parent: 'head', pivot: [-2, 6, -5.5], cubes: [{ origin: [-3, 5, -6], size: [1, 1, 1], mat: 'dark' }] },
      { name: 'tail', parent: 'body', pivot: [0, 4, 4], rotation: [60, 0, 0], cubes: [{ origin: [0, -2, 4], size: [1, 6, 1], mat: 'tail' }] },
      ...legs4({ x: 2, front: -3, back: 2, w: 1, d: 1, h: 3, foot: 0, mat: 'fur' }),
    ],
  },

  materials: {
    fur: {
      base: '#c9a777',
      layers: [
        stripes('#8f6f4a', { axis: 2, period: 2, width: 0.4, warp: 0.4, where: (c) => c.cube.bone === 'body' && c.face === 'top' }),
        underside('#e3cfa7', { y: 3, soft: 1, where: bone('body') }),
        fur(0.06),
      ],
    },
    snout: '#bf9d6f',
    dark: '#3a2a1e',
    tail: { base: '#c9a777', layers: [region('#3a2a1e', ({ p }) => p[1] < -0.5)] },
  },

  anims: {
    ...quadruped({ tail: ['tail'], swing: 40, sleepDrop: 2, legFold: 80, walkLength: 0.5, runLength: 0.25 }),
    stand: extras.stand({ body: 'body', head: 'head' }),
  },
};
