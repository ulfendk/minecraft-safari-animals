import { reptile } from '../lib/anim.mjs';
import { all, bone, face, legs4 } from '../lib/parts.mjs';
import { fur, mottle, region, stripes, underside } from '../lib/texture.mjs';
import { teeth } from './crocodile.mjs';

export default {
  id: 'caiman',
  name: 'Spectacled Caiman',
  role: 'predator',
  family: ['reptile', 'crocodilian', 'caiman'],
  size: [0.9, 0.45],
  health: 20,
  speed: 0.18,
  swimSpeed: 0.2,
  movement: 'amphibious',
  xp: 3,
  knockbackResistance: 0.3,
  attack: { damage: 4, speed: 1.6 },
  // Smaller and shyer than a crocodile: it eats fish, frogs and birds and only bites people who bother it.
  hunts: ['piranha', 'poison_dart_frog', 'chicken', 'flamingo'],
  huntInterval: 40,
  huntRange: 8,
  sleeps: 'never',
  breed: ['cod', 'salmon'],
  tempt: ['cod', 'salmon', 'tropical_fish'],
  heal: [['cod', 3], ['salmon', 4], ['tropical_fish', 2]],
  spawn: [
    { biomes: ['jungle'], weight: 2, group: [1, 3], blocks: ['grass_block', 'mud', 'dirt', 'podzol'] },
    { biomes: ['swamp', 'mangrove'], weight: 1, group: [1, 2], blocks: ['grass_block', 'mud', 'dirt', 'clay'] },
  ],
  loot: [{ item: 'leather', min: 0, max: 1 }],
  sounds: { ambient: 'mob.turtle.ambient', hurt: 'mob.turtle.hurt', death: 'mob.turtle.death', pitch: [0.6, 0.7], interval: 25 },
  egg: ['#6b6a45', '#2a2a1c'],
  client: { runSpeed: 4 },

  model: {
    bones: [
      { name: 'root', pivot: [0, 0, 0] },
      { name: 'body', parent: 'root', pivot: [0, 3, 0], cubes: [{ origin: [-3, 2, -7], size: [6, 4, 14], mat: 'scales' }] },
      {
        name: 'head', parent: 'body', pivot: [0, 4, -7],
        cubes: [
          { origin: [-3, 2, -12], size: [6, 3, 5], mat: 'scales' },
          // A shorter, broader snout than a crocodile's, with the bony "spectacles" ridge in front of the eyes.
          { origin: [-2, 2, -18], size: [4, 2, 6], mat: 'snout', marks: teeth(6) },
          { origin: [-2, 5, -12], size: [4, 1, 1], mat: 'ridge' },
          {
            origin: [1, 5, -11], size: [2, 1, 2], mat: 'scales',
            marks: [{ face: 'left', x: 0, y: 0, w: 2, color: '#c9b53a' }, { face: 'left', x: 0, y: 0, color: '#111111' }, { face: 'front', x: 1, y: 0, color: '#c9b53a' }],
          },
          {
            origin: [-3, 5, -11], size: [2, 1, 2], mat: 'scales',
            marks: [{ face: 'right', x: 0, y: 0, w: 2, color: '#c9b53a' }, { face: 'right', x: 1, y: 0, color: '#111111' }, { face: 'front', x: 0, y: 0, color: '#c9b53a' }],
          },
        ],
      },
      { name: 'jaw', parent: 'head', pivot: [0, 3, -12], cubes: [{ origin: [-2, 1, -18], size: [4, 1, 6], mat: 'jaw' }] },
      { name: 'tail', parent: 'body', pivot: [0, 4, 7], cubes: [{ origin: [-2, 2, 7], size: [4, 3, 6], mat: 'scales' }] },
      { name: 'tail2', parent: 'tail', pivot: [0, 3, 13], cubes: [{ origin: [-1, 2, 13], size: [2, 2, 6], mat: 'scales' }] },
      { name: 'tail3', parent: 'tail2', pivot: [0, 3, 19], cubes: [{ origin: [-1, 2, 19], size: [2, 1, 5], mat: 'scales' }] },
      ...legs4({ x: 5, front: -6, back: 3, w: 2, d: 2, h: 3, foot: 0, mat: 'limb' }),
    ],
  },

  materials: {
    scales: {
      base: '#6b6a45',
      layers: [
        // Olive with dark cross-bands on the back and tail.
        stripes('#3a3a26', { axis: 2, period: 4, width: 0.35, warp: 0.6, where: all(bone('body', 'tail', 'tail2', 'tail3'), face('top', 'left', 'right')) }),
        region('#4c4b30', all(bone('body', 'tail'), face('top'), ({ p }) => Math.abs(p[0]) < 1 && Math.floor(p[2]) % 2 === 0)),
        underside('#d6cf9e', { y: 2.5, soft: 0.5 }),
        mottle(0.12, { scale: 3 }),
        fur(0.06),
      ],
    },
    snout: { base: '#64633f', layers: [region('#d6cf9e', face('bottom')), mottle(0.1), fur(0.05)] },
    ridge: '#4c4b30',
    limb: { base: '#5e5d3c', layers: [mottle(0.12, { scale: 2 })] },
    jaw: { base: '#d6cf9e', layers: [region('#d98a8a', face('top')), region('#64633f', face('left', 'right', 'front'))] },
  },

  anims: reptile({ tail: ['tail', 'tail2', 'tail3'], jaw: 'jaw' }),
};
