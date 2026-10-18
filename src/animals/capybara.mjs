import { quadruped } from '../lib/anim.mjs';
import { all, bone, face, legs4 } from '../lib/parts.mjs';
import { fur, gradient, mottle, region } from '../lib/texture.mjs';

export default {
  id: 'capybara',
  name: 'Capybara',
  role: 'prey',
  family: ['rodent', 'capybara'],
  size: [0.9, 0.9],
  health: 16,
  speed: 0.22,
  swimSpeed: 0.12,
  movement: 'amphibious',
  xp: 2,
  breed: ['melon_slice', 'sugar_cane', 'wheat'],
  tempt: ['melon_slice', 'sugar_cane', 'wheat', 'apple'],
  heal: [['melon_slice', 3], ['apple', 3], ['sugar_cane', 2]],
  grazes: true,
  sleeps: 'night',
  spawn: [
    { biomes: ['jungle'], weight: 4, group: [3, 6], blocks: ['grass_block', 'podzol', 'mud'] },
    { biomes: ['swamp', 'river'], weight: 2, group: [2, 4], blocks: ['grass_block', 'mud', 'sand'] },
  ],
  loot: [{ item: 'leather', min: 0, max: 1 }, { item: 'safari:raw_game_meat', min: 1, max: 2, smelts: true }],
  sounds: { ambient: 'mob.sniffer.idle', hurt: 'mob.sniffer.hurt', death: 'mob.sniffer.death', pitch: [1.5, 1.7], interval: 20 },
  egg: ['#8a5f3a', '#5a3d25'],

  model: {
    bones: [
      { name: 'root', pivot: [0, 0, 0] },
      { name: 'body', parent: 'root', pivot: [0, 8, 0], cubes: [{ origin: [-4, 4, -7], size: [8, 7, 13], mat: 'coat' }] },
      {
        name: 'head', parent: 'body', pivot: [0, 9, -7],
        cubes: [
          // Big blunt head with the eyes, ears and nostrils all set high (so they stay above water).
          {
            origin: [-3, 6, -12], size: [6, 6, 6], mat: 'coat',
            marks: [{ face: 'right', x: 3, y: 1, color: '#14100c' }, { face: 'left', x: 2, y: 1, color: '#14100c' }],
          },
          { origin: [-3, 6, -14], size: [6, 5, 2], mat: 'muzzle', marks: [{ face: 'front', x: 1, y: 0, color: '#1a120c' }, { face: 'front', x: 4, y: 0, color: '#1a120c' }] },
        ],
      },
      { name: 'ear_l', parent: 'head', pivot: [2, 12, -7.5], cubes: [{ origin: [2, 12, -8], size: [1, 1, 1], mat: 'ear' }] },
      { name: 'ear_r', parent: 'head', pivot: [-2, 12, -7.5], cubes: [{ origin: [-3, 12, -8], size: [1, 1, 1], mat: 'ear' }] },
      ...legs4({ x: 4, front: -6, back: 3, w: 2, d: 2, h: 5, foot: 1, mat: 'coat', footMat: 'foot' }),
    ],
  },

  materials: {
    coat: {
      base: '#8a5f3a',
      layers: [
        gradient('#a9784c', { axis: 1, from: 7, to: 12, where: bone('body') }),
        region('#6e4a2c', all(bone('body'), face('bottom'))),
        mottle(0.12, { scale: 2 }),
        fur(0.12),
      ],
    },
    muzzle: { base: '#4e3522', layers: [fur(0.06)] },
    ear: '#3e2a1a',
    foot: '#3a2a1e',
  },

  anims: quadruped({ swing: 26, sleepDrop: 4, legFold: 80, walkLength: 1.0, runLength: 0.5 }),
};
