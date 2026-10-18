import { extras, quadruped } from '../lib/anim.mjs';
import { pillarBody } from '../lib/bodies.mjs';
import { bone, face, all } from '../lib/parts.mjs';
import { fur, mottle, region, underside } from '../lib/texture.mjs';

const body = pillarBody({ bodyW: 16, bodyH: 13, bodyL: 24, legH: 7, legW: 5, bottomGap: 1 });
const top = body.top; // 19

export default {
  id: 'hippo',
  name: 'Hippo',
  role: 'megafauna',
  family: ['hippo'],
  size: [1.7, 1.4],
  health: 50,
  speed: 0.2,
  swimSpeed: 0.12,
  movement: 'amphibious',
  xp: 6,
  knockbackResistance: 0.8,
  attack: { damage: 8, speed: 1.5 },
  // Territorial: attacks players who swim near it.
  hostile: { range: 8, filters: [{ test: 'in_water', subject: 'other', value: true }, { test: 'is_baby', subject: 'self', value: false }] },
  breed: ['melon_slice', 'sea_pickle'],
  tempt: ['melon_slice', 'sea_pickle'],
  heal: [['melon_slice', 3]],
  sleeps: 'day',
  spawn: [
    { biomes: ['river'], weight: 3, group: [2, 4], blocks: ['sand', 'grass_block', 'mud', 'dirt', 'gravel'] },
    { biomes: ['swamp', 'mangrove'], weight: 2, group: [1, 3], blocks: ['grass_block', 'mud', 'dirt'] },
  ],
  loot: [{ item: 'leather', min: 1, max: 3 }, { item: 'safari:raw_game_meat', min: 1, max: 3, smelts: true }],
  sounds: { ambient: 'mob.hoglin.angry', hurt: 'mob.ravager.hurt', death: 'mob.ravager.death', pitch: [0.45, 0.55], interval: 20 },
  egg: ['#7a6870', '#d39a9a'],
  client: { runSpeed: 4 },

  model: {
    bones: [
      ...body.bones,
      { name: 'tail', parent: 'body', pivot: [0, top - 3, 12], rotation: [20, 0, 0], cubes: [{ origin: [-1, top - 7, 12], size: [2, 4, 1], mat: 'hide' }] },
      {
        name: 'head', parent: 'body', pivot: [0, top - 3, -12],
        cubes: [
          { origin: [-6, 9, -20], size: [12, 9, 8], mat: 'hide' },
          { origin: [-7, 11, -27], size: [14, 6, 7], mat: 'snout', marks: [{ face: 'top', x: 3, y: 1, w: 2, color: '#3a2f33' }, { face: 'top', x: 9, y: 1, w: 2, color: '#3a2f33' }] },
          { origin: [2, 18, -17], size: [2, 2, 2], mat: 'hide', marks: [{ face: 'front', x: 0, y: 0, color: '#1a1a1a' }] },
          { origin: [-4, 18, -17], size: [2, 2, 2], mat: 'hide', marks: [{ face: 'front', x: 1, y: 0, color: '#1a1a1a' }] },
        ],
      },
      {
        name: 'jaw', parent: 'head', pivot: [0, 11, -20],
        cubes: [
          { origin: [-7, 7, -27], size: [14, 4, 7], mat: 'jaw' },
          { origin: [-6, 11, -26], size: [1, 2, 1], mat: 'tooth' },
          { origin: [5, 11, -26], size: [1, 2, 1], mat: 'tooth' },
        ],
      },
      { name: 'ear_l', parent: 'head', pivot: [4, 18, -13.5], cubes: [{ origin: [4, 18, -14], size: [1, 2, 1], mat: 'hide' }] },
      { name: 'ear_r', parent: 'head', pivot: [-4, 18, -13.5], cubes: [{ origin: [-5, 18, -14], size: [1, 2, 1], mat: 'hide' }] },
    ],
  },

  materials: {
    hide: { base: '#7a6870', layers: [underside('#c98f8f', { y: 9, soft: 2, where: bone('body') }), mottle(0.08), fur(0.05)] },
    snout: { base: '#836f78', layers: [region('#e0a0a0', face('bottom')), fur(0.05)] },
    jaw: { base: '#c98f8f', layers: [region('#d97c86', face('top')), region('#7a6870', all(face('left', 'right', 'front'), ({ j }) => j < 2)), fur(0.04)] },
    tooth: '#f2ecd8',
    toe: { base: '#7a6870', layers: [region('#d0b9b9', ({ face: f, i }) => f === 'front' && i % 2 === 0)] },
  },

  anims: {
    ...quadruped({ tail: ['tail'], ears: ['ear_l', 'ear_r'], swing: 22, sleepDrop: 4, legFold: 60, walkLength: 1.2, runLength: 0.6 }),
    swim: { loop: true, animation_length: 2, bones: { leg_fl: { rotation: { '0.00': [20, 0, 0], '1.00': [-20, 0, 0], '2.00': [20, 0, 0] } }, leg_br: { rotation: { '0.00': [20, 0, 0], '1.00': [-20, 0, 0], '2.00': [20, 0, 0] } }, leg_fr: { rotation: { '0.00': [-20, 0, 0], '1.00': [20, 0, 0], '2.00': [-20, 0, 0] } }, leg_bl: { rotation: { '0.00': [-20, 0, 0], '1.00': [20, 0, 0], '2.00': [-20, 0, 0] } } } },
    yawn: extras.yawn({ jaw: 'jaw', head: 'head' }),
    attack: extras.yawn({ jaw: 'jaw', head: 'head' }),
  },
};
