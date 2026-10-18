import { extras, quadruped } from '../lib/anim.mjs';
import { pillarBody } from '../lib/bodies.mjs';
import { bone, eyes, face, all } from '../lib/parts.mjs';
import { fur, mottle, region } from '../lib/texture.mjs';

const body = pillarBody({ bodyW: 14, bodyH: 13, bodyL: 24, legH: 13, legW: 5 });
const top = body.top; // 25

export default {
  id: 'rhino',
  name: 'Rhino',
  role: 'megafauna',
  family: ['rhino'],
  size: [1.6, 1.7],
  health: 45,
  speed: 0.22,
  xp: 6,
  knockbackResistance: 0.8,
  attack: { damage: 9, speed: 1.8, cooldown: 1.5 },
  // Charges anyone who walks right up to it.
  hostile: { range: 4, filters: [{ test: 'is_baby', subject: 'self', value: false }] },
  breed: ['wheat', 'hay_block'],
  tempt: ['hay_block'],
  heal: [['wheat', 2], ['hay_block', 15]],
  grazes: true,
  sleeps: 'night',
  spawn: [{ biomes: ['savanna'], weight: 2, group: [1, 2], blocks: ['grass_block'] }],
  loot: [{ item: 'leather', min: 1, max: 3 }],
  sounds: { ambient: 'mob.hoglin.ambient', hurt: 'mob.hoglin.hurt', death: 'mob.hoglin.death', pitch: [0.55, 0.65], interval: 20 },
  egg: ['#7d7670', '#4a4540'],
  client: { runSpeed: 4 },

  model: {
    bones: [
      ...body.bones.map((b) => (b.name === 'body'
        ? { ...b, cubes: [...b.cubes, { origin: [-6, top, -11], size: [12, 2, 8], mat: 'hide' }] }
        : b)),
      { name: 'tail', parent: 'body', pivot: [0, top - 2, 12], rotation: [10, 0, 0], cubes: [{ origin: [-1, top - 9, 12], size: [1, 7, 1], mat: 'hide' }] },
      {
        name: 'head', parent: 'body', pivot: [0, top - 4, -12], rotation: [25, 0, 0],
        cubes: [
          { origin: [-4, 13, -22], size: [8, 8, 11], mat: 'hide', marks: eyes(11, { back: 5, down: 3 }) },
          { origin: [-3, 12, -24], size: [6, 5, 3], mat: 'lip' },
          { origin: [-1, 21, -22], size: [2, 6, 2], mat: 'horn', rotation: [-20, 0, 0], pivot: [0, 21, -21] },
          { origin: [-1, 21, -17], size: [2, 3, 2], mat: 'horn', rotation: [-10, 0, 0], pivot: [0, 21, -16] },
        ],
      },
      { name: 'ear_l', parent: 'head', pivot: [3, 21, -12.5], cubes: [{ origin: [2, 21, -13], size: [2, 3, 1], mat: 'hide' }] },
      { name: 'ear_r', parent: 'head', pivot: [-3, 21, -12.5], cubes: [{ origin: [-4, 21, -13], size: [2, 3, 1], mat: 'hide' }] },
    ],
  },

  materials: {
    hide: {
      base: '#7d7670',
      layers: [
        // Skin folds behind the shoulders and in front of the hips.
        region('#625c57', all(bone('body'), face('left', 'right', 'top'), ({ p }) => Math.abs(p[2] + 4) < 0.6 || Math.abs(p[2] - 6) < 0.6)),
        region('#625c57', all(bone('leg_fl', 'leg_fr', 'leg_bl', 'leg_br'), ({ p }) => Math.abs(p[1] - 8) < 0.6)),
        mottle(0.1, { scale: 4 }),
        fur(0.07),
      ],
    },
    lip: { base: '#6d6661', layers: [fur(0.05)] },
    horn: { base: '#9a8f7d', layers: [region('#bfb5a2', ({ p }) => p[1] > 24)] },
    toe: { base: '#7d7670', layers: [region('#cfc6b6', ({ face: f, i }) => f === 'front' && i % 2 === 0)] },
  },

  anims: {
    ...quadruped({ tail: ['tail'], ears: ['ear_l', 'ear_r'], swing: 22, sleepDrop: 9, legFold: 75, walkLength: 1.2, runLength: 0.55 }),
    charge: extras.pronk(),
  },
};
