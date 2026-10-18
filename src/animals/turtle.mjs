import { shelled } from '../lib/anim.mjs';
import { eyes, legs4 } from '../lib/parts.mjs';
import { mottle, patches, region } from '../lib/texture.mjs';

export default {
  id: 'turtle',
  name: 'River Turtle',
  role: 'prey',
  family: ['reptile', 'turtle', 'shelled'],
  size: [0.7, 0.4],
  health: 14,
  speed: 0.12,
  swimSpeed: 0.16,
  movement: 'amphibious',
  xp: 2,
  hidesInShell: true,
  sleeps: 'night',
  breed: ['seagrass', 'kelp'],
  tempt: ['seagrass', 'kelp', 'melon_slice'],
  heal: [['kelp', 2], ['melon_slice', 3]],
  spawn: [
    { biomes: ['river'], weight: 3, group: [1, 3], blocks: ['sand', 'mud', 'grass_block', 'gravel'] },
    { biomes: ['jungle', 'swamp'], weight: 2, group: [1, 2], blocks: ['grass_block', 'mud', 'podzol'] },
  ],
  loot: [{ item: 'turtle_scute', min: 0, max: 1 }],
  sounds: { ambient: 'mob.turtle.ambient', hurt: 'mob.turtle.hurt', death: 'mob.turtle.death', pitch: [0.9, 1.1], interval: 30 },
  egg: ['#2e3324', '#e8c232'],

  model: {
    bones: [
      { name: 'root', pivot: [0, 0, 0] },
      {
        name: 'body', parent: 'root', pivot: [0, 3, 0],
        cubes: [
          // Low, streamlined shell for swimming.
          { origin: [-4, 2, -5], size: [8, 3, 10], mat: 'shell' },
          { origin: [-3, 5, -4], size: [6, 1, 8], mat: 'shell' },
          { origin: [-4, 1, -5], size: [8, 1, 10], mat: 'plastron' },
        ],
      },
      {
        name: 'head', parent: 'body', pivot: [0, 3, -5],
        cubes: [
          { origin: [-1, 2, -7], size: [2, 2, 2], mat: 'skin' },
          {
            origin: [-1, 2, -10], size: [2, 2, 3], mat: 'skin',
            marks: [...eyes(3, { back: 1, down: 0, color: '#0a0a08' }), { face: 'top', x: 0, y: 1, color: '#e8c232' }, { face: 'top', x: 1, y: 0, color: '#e8c232' }, { face: 'front', x: 0, y: 1, w: 2, color: '#e8c232' }],
          },
        ],
      },
      { name: 'tail', parent: 'body', pivot: [0, 2, 5], cubes: [{ origin: [-1, 2, 5], size: [1, 1, 2], mat: 'skin' }] },
      // Webbed, paddle-like feet.
      ...legs4({ x: 5, front: -4, back: 2, w: 2, d: 2, h: 2, foot: 0, mat: 'skin' }),
    ],
  },

  materials: {
    shell: { base: '#1e2218', layers: [patches('#3a4228', { size: 3, line: 0.2, vary: 0.25, where: (c) => c.face !== 'bottom' }), mottle(0.08)] },
    plastron: { base: '#c2b07a', layers: [mottle(0.08)] },
    skin: { base: '#2a2a24', layers: [region('#e8c232', ({ i, j, face: f }) => f !== 'bottom' && (i * 7 + j * 3) % 11 === 0), mottle(0.1)] },
  },

  anims: shelled({ tail: 'tail', headTuck: 3, legTuckX: -1, walkLength: 1.4 }),
};
