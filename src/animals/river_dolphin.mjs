import { cetacean } from '../lib/anim.mjs';
import { all, bone, face } from '../lib/parts.mjs';
import { gradient, mottle, region } from '../lib/texture.mjs';

export default {
  id: 'river_dolphin',
  name: 'Amazon River Dolphin',
  role: 'prey',
  family: ['dolphin', 'mammal'],
  size: [0.9, 0.5],
  health: 16,
  speed: 0.14,
  swimSpeed: 0.17,
  movement: 'dolphin',
  xp: 3,
  sleeps: 'never',
  spawn: [{ biomes: ['river', 'jungle'], weight: 2, group: [1, 3], water: true }],
  loot: [{ item: 'cod', min: 0, max: 1, smelts: true }],
  sounds: { ambient: 'mob.dolphin.idle', hurt: 'mob.dolphin.hurt', death: 'mob.dolphin.death', pitch: [1.1, 1.3], interval: 12 },
  egg: ['#e8a0a8', '#9a8a90'],

  model: {
    bones: [
      { name: 'root', pivot: [0, 0, 0] },
      {
        name: 'body', parent: 'root', pivot: [0, 2.5, 0],
        cubes: [
          { origin: [-3, 0, -5], size: [6, 5, 11], mat: 'skin' },
          // A low ridge instead of a tall dorsal fin.
          { origin: [-1, 5, -1], size: [2, 1, 5], mat: 'skin' },
          // Broad, paddle-shaped flippers.
          { origin: [3, 0, -4], size: [4, 1, 3], mat: 'skin', rotation: [0, -20, -25], pivot: [3, 0.5, -2.5] },
          { origin: [-7, 0, -4], size: [4, 1, 3], mat: 'skin', rotation: [0, 20, 25], pivot: [-3, 0.5, -2.5] },
        ],
      },
      {
        name: 'head', parent: 'body', pivot: [0, 2.5, -5],
        cubes: [
          // The bulging "melon" forehead and a long, slender beak.
          {
            origin: [-2, 1, -9], size: [4, 4, 4], mat: 'skin',
            marks: [{ face: 'right', x: 1, y: 2, color: '#2a1a1e' }, { face: 'left', x: 2, y: 2, color: '#2a1a1e' }],
          },
          { origin: [-1, 1, -15], size: [2, 2, 6], mat: 'beak' },
        ],
      },
      { name: 'tail', parent: 'body', pivot: [0, 2.5, 6], cubes: [{ origin: [-2, 1, 6], size: [4, 3, 5], mat: 'skin' }] },
      { name: 'fluke', parent: 'tail', pivot: [0, 2.5, 11], cubes: [{ origin: [-4, 2, 11], size: [8, 1, 3], mat: 'skin' }] },
    ],
  },

  materials: {
    // Pink, deepening with age; grey along the back.
    skin: {
      base: '#e8a0a8',
      layers: [
        gradient('#9a8a90', { axis: 1, from: 3.5, to: 6, where: bone('body', 'tail') }),
        region('#f2c0c4', all(face('bottom'))),
        mottle(0.08, { scale: 2 }),
      ],
    },
    beak: { base: '#d89098', layers: [mottle(0.06)] },
  },

  anims: cetacean({}),
};
