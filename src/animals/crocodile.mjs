import { reptile } from '../lib/anim.mjs';
import { all, bone, face, legs4 } from '../lib/parts.mjs';
import { fur, mottle, region, underside } from '../lib/texture.mjs';

const teeth = (d) => [
  ...Array.from({ length: Math.floor(d / 2) }, (_, k) => ({ face: 'left', x: 2 * k, y: 1, color: '#efe8d0' })),
  ...Array.from({ length: Math.floor(d / 2) }, (_, k) => ({ face: 'right', x: d - 1 - 2 * k, y: 1, color: '#efe8d0' })),
];

export default {
  id: 'crocodile',
  name: 'Crocodile',
  role: 'predator',
  family: ['reptile', 'crocodile'],
  size: [1.2, 0.6],
  health: 30,
  speed: 0.18,
  swimSpeed: 0.2,
  movement: 'amphibious',
  xp: 5,
  knockbackResistance: 0.5,
  attack: { damage: 7, speed: 1.6 },
  hunts: ['antelope', 'zebra', 'warthog', 'flamingo'],
  huntInterval: 40,
  huntRange: 10,
  hostile: { range: 6, filters: [{ test: 'is_baby', subject: 'self', value: false }] },
  sleeps: 'never',
  breed: ['cod', 'salmon'],
  tempt: ['cod', 'salmon'],
  heal: [['cod', 3], ['salmon', 4]],
  spawn: [
    { biomes: ['river'], weight: 2, group: [1, 2], blocks: ['sand', 'grass_block', 'mud', 'dirt', 'gravel'] },
    { biomes: ['swamp', 'mangrove'], weight: 3, group: [1, 2], blocks: ['grass_block', 'mud', 'dirt', 'clay'] },
  ],
  loot: [{ item: 'leather', min: 1, max: 2 }],
  sounds: { ambient: 'mob.turtle.ambient', hurt: 'mob.turtle.hurt', death: 'mob.turtle.death', pitch: [0.4, 0.5], interval: 25 },
  egg: ['#4f5b32', '#c2b98a'],
  client: { runSpeed: 4 },

  model: {
    bones: [
      { name: 'root', pivot: [0, 0, 0] },
      { name: 'body', parent: 'root', pivot: [0, 4, 0], cubes: [{ origin: [-4, 2, -10], size: [8, 5, 20], mat: 'scales' }] },
      {
        name: 'head', parent: 'body', pivot: [0, 4, -10],
        cubes: [
          { origin: [-3, 2, -16], size: [6, 4, 6], mat: 'scales' },
          { origin: [-2, 3, -25], size: [4, 2, 9], mat: 'snout', marks: teeth(9) },
          { origin: [1, 6, -14], size: [2, 1, 2], mat: 'scales', marks: [{ face: 'front', x: 0, y: 0, w: 2, color: '#d9c13a' }] },
          { origin: [-3, 6, -14], size: [2, 1, 2], mat: 'scales', marks: [{ face: 'front', x: 0, y: 0, w: 2, color: '#d9c13a' }] },
        ],
      },
      { name: 'jaw', parent: 'head', pivot: [0, 3, -16], cubes: [{ origin: [-2, 2, -25], size: [4, 1, 9], mat: 'jaw' }] },
      { name: 'tail', parent: 'body', pivot: [0, 4, 10], cubes: [{ origin: [-3, 2, 10], size: [6, 4, 8], mat: 'scales' }] },
      { name: 'tail2', parent: 'tail', pivot: [0, 4, 18], cubes: [{ origin: [-2, 2, 18], size: [4, 3, 8], mat: 'scales' }] },
      { name: 'tail3', parent: 'tail2', pivot: [0, 3, 26], cubes: [{ origin: [-1, 2, 26], size: [2, 2, 7], mat: 'scales' }] },
      ...legs4({ x: 6, front: -8, back: 5, w: 2, d: 3, h: 4, foot: 0, mat: 'scales' }),
    ],
  },

  materials: {
    scales: {
      base: '#4f5b32',
      layers: [
        // Bumpy armour ridges along the back.
        region('#3a4424', all(face('top'), ({ p }) => (Math.floor(p[0]) % 2 === 0) !== (Math.floor(p[2]) % 2 === 0))),
        region('#2f3820', all(bone('body', 'tail', 'tail2'), face('top'), ({ p }) => Math.abs(p[0]) < 1 && Math.floor(p[2]) % 2 === 0)),
        underside('#c2b98a', { y: 2.5, soft: 0.5 }),
        mottle(0.12, { scale: 3 }),
        fur(0.06),
      ],
    },
    snout: { base: '#4a5530', layers: [region('#c2b98a', face('bottom')), mottle(0.1), fur(0.05)] },
    jaw: { base: '#c2b98a', layers: [region('#d98a8a', face('top')), region('#4a5530', face('left', 'right', 'front'))] },
  },

  anims: reptile({ tail: ['tail', 'tail2', 'tail3'], jaw: 'jaw' }),
};
