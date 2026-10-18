import { shelled } from '../lib/anim.mjs';
import { all, bone, face, eyes, legs4 } from '../lib/parts.mjs';
import { fur, mottle, patches, region } from '../lib/texture.mjs';

export default {
  id: 'tortoise',
  name: 'Tortoise',
  role: 'prey',
  family: ['reptile', 'tortoise', 'shelled'],
  size: [0.9, 0.7],
  health: 30,
  speed: 0.08,
  xp: 2,
  knockbackResistance: 0.8,
  hidesInShell: true,
  sleeps: 'night',
  strollRange: 5,
  breed: ['dandelion', 'cactus'],
  tempt: ['dandelion', 'cactus', 'melon_slice'],
  heal: [['dandelion', 2], ['melon_slice', 3], ['cactus', 2]],
  spawn: [
    { biomes: ['savanna'], weight: 1, group: [1, 2], blocks: ['grass_block', 'coarse_dirt'] },
    { biomes: ['desert'], weight: 1, group: [1, 1], blocks: ['sand'] },
  ],
  loot: [{ item: 'turtle_scute', min: 0, max: 1 }],
  sounds: { ambient: 'mob.turtle.ambient', hurt: 'mob.turtle.hurt', death: 'mob.turtle.death', pitch: [0.6, 0.7], interval: 30 },
  egg: ['#8a6a3a', '#3a2a18'],

  model: {
    bones: [
      { name: 'root', pivot: [0, 0, 0] },
      {
        name: 'body', parent: 'root', pivot: [0, 5, 0],
        cubes: [
          // High-domed shell in three tiers, with a flared rim.
          { origin: [-5, 3, -6], size: [10, 4, 12], mat: 'shell' },
          { origin: [-4, 7, -5], size: [8, 2, 10], mat: 'shell' },
          { origin: [-3, 9, -3], size: [6, 1, 6], mat: 'shell' },
          { origin: [-5, 2, -6], size: [10, 1, 12], mat: 'plastron' },
        ],
      },
      {
        name: 'head', parent: 'body', pivot: [0, 4, -6],
        cubes: [
          { origin: [-1, 3, -8], size: [2, 2, 3], mat: 'skin' },
          { origin: [-2, 3, -11], size: [4, 3, 3], mat: 'skin', marks: eyes(3, { back: 1, down: 0, color: '#120e0a' }) },
        ],
      },
      { name: 'tail', parent: 'body', pivot: [0, 3, 6], rotation: [20, 0, 0], cubes: [{ origin: [-1, 2, 6], size: [1, 1, 2], mat: 'skin' }] },
      // Thick, elephant-like legs with big scales and blunt claws.
      ...legs4({ x: 5, front: -5, back: 2, w: 3, d: 3, h: 3, foot: 1, mat: 'leg', footMat: 'claw' }),
    ],
  },

  materials: {
    // Scutes: light horn-coloured plates with dark seams; each plate varies a little.
    shell: {
      base: '#3a2a18',
      layers: [
        patches('#b48a4a', { size: 2.8, line: 0.22, vary: 0.3, where: (c) => c.face !== 'bottom' }),
        region('#9a7038', all(bone('body'), face('left', 'right', 'front', 'back'), ({ p }) => p[1] < 3.6)),
        mottle(0.06),
      ],
    },
    plastron: { base: '#c9a86a', layers: [mottle(0.08)] },
    skin: { base: '#8a8170', layers: [mottle(0.15, { scale: 1.5 }), fur(0.08)] },
    leg: { base: '#857c6a', layers: [region('#a39a86', ({ i, j }) => (i + j) % 2 === 0), fur(0.06)] },
    claw: '#4a4238',
  },

  anims: shelled({ tail: 'tail', headTuck: 4, legTuckX: -1, walkLength: 2.4 }),
};
