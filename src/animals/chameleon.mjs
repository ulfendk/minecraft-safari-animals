import { quadruped } from '../lib/anim.mjs';
import { all, bone, face, legs4 } from '../lib/parts.mjs';
import { mottle, region, stripes } from '../lib/texture.mjs';

/** Skin in one colour scheme; the chameleon switches between them to match what it stands on. */
const skin = ([base, light, dark]) => ({
  base,
  layers: [
    // A pale stripe along each flank and darker diagonal bands.
    region(light, all(bone('body'), face('left', 'right'), ({ p }) => p[1] > 5 && p[1] < 6)),
    stripes(dark, { axis: 2, period: 3, width: 0.25, warp: 0.6, where: all(bone('body', 'tail', 'tail2', 'tail3'), face('left', 'right', 'top')) }),
    region(light, all(bone('body'), face('bottom'))),
    mottle(0.12, { scale: 1.5 }),
  ],
});
const GREEN = ['#5f9e3c', '#c9de6a', '#3d6e26'];
const BROWN = ['#7a5636', '#b08a5a', '#4e341e'];
const SAND = ['#c9b27a', '#ece0b4', '#9a8452'];

export default {
  id: 'chameleon',
  name: 'Chameleon',
  role: 'prey',
  family: ['reptile', 'chameleon', 'small'],
  size: [0.4, 0.5],
  health: 6,
  speed: 0.1,
  movement: 'climb',
  xp: 1,
  colourChange: true,
  sleeps: 'night',
  strollRange: 5,
  breed: ['spider_eye'],
  tempt: ['spider_eye'],
  variants: [{ weight: 2 }, { weight: 1, texture: 'brown', materials: { skin: skin(BROWN) } }, { weight: 1, texture: 'sand', materials: { skin: skin(SAND) } }],
  variantsMixed: true,
  spawn: [
    { biomes: ['jungle'], weight: 3, group: [1, 1], blocks: ['grass_block', 'podzol'] },
    { biomes: ['savanna'], weight: 1, group: [1, 1], blocks: ['grass_block'] },
  ],
  loot: [],
  sounds: { hurt: 'mob.frog.hurt', death: 'mob.frog.death', pitch: [0.8, 0.9] },
  egg: ['#5f9e3c', '#c9de6a'],

  model: {
    bones: [
      { name: 'root', pivot: [0, 0, 0] },
      {
        name: 'body', parent: 'root', pivot: [0, 6, 0],
        cubes: [
          // Tall, flattened body with a saw-toothed crest.
          { origin: [-1, 4, -3], size: [2, 5, 7], mat: 'skin' },
          { origin: [-1, 9, -2], size: [2, 1, 5], mat: 'skin', marks: [{ face: 'left', x: 1, y: 0, color: '#00000000' }, { face: 'left', x: 3, y: 0, color: '#00000000' }, { face: 'right', x: 1, y: 0, color: '#00000000' }, { face: 'right', x: 3, y: 0, color: '#00000000' }] },
        ],
      },
      {
        name: 'head', parent: 'body', pivot: [0, 7, -3],
        cubes: [
          { origin: [-1, 5, -7], size: [2, 4, 4], mat: 'skin', marks: [{ face: 'front', x: 0, y: 3, w: 2, color: '#2a2a1e' }] },
          // The casque: a helmet-like crest sweeping back over the neck.
          { origin: [-1, 9, -6], size: [2, 2, 3], mat: 'skin', rotation: [-20, 0, 0], pivot: [0, 9, -4.5] },
          // Turret eyes that swivel independently.
          { origin: [1, 7, -6], size: [1, 2, 2], mat: 'skin', marks: [{ face: 'left', x: 0, y: 0, w: 2, h: 2, color: '#d8c84a' }, { face: 'left', x: 1, y: 1, color: '#0a0a08' }] },
          { origin: [-2, 7, -6], size: [1, 2, 2], mat: 'skin', marks: [{ face: 'right', x: 0, y: 0, w: 2, h: 2, color: '#d8c84a' }, { face: 'right', x: 0, y: 1, color: '#0a0a08' }] },
        ],
      },
      // Prehensile tail coiled into a spiral.
      { name: 'tail', parent: 'body', pivot: [0, 5.5, 4], cubes: [{ origin: [-1, 5, 4], size: [2, 1, 4], mat: 'skin' }] },
      { name: 'tail2', parent: 'tail', pivot: [0, 5.5, 8], rotation: [-100, 0, 0], cubes: [{ origin: [-1, 5, 8], size: [2, 1, 3], mat: 'skin' }] },
      { name: 'tail3', parent: 'tail2', pivot: [0, 5.5, 11], rotation: [-110, 0, 0], cubes: [{ origin: [-1, 5, 11], size: [2, 1, 2], mat: 'skin' }] },
      // Thin legs set wide, with clasping feet.
      ...legs4({ x: 2, front: -2, back: 2, w: 1, d: 1, h: 4, foot: 1, mat: 'skin', footMat: 'foot' }).map((b) => ({
        ...b, rotation: [0, 0, b.name.endsWith('l') ? -7 : 7],
      })),
    ],
  },

  materials: { skin: skin(GREEN), foot: '#3a3a2a' },

  anims: quadruped({ tail: ['tail'], swing: 25, sleepDrop: 2, legFold: 50, walkLength: 1.6, runLength: 1.0 }),
};
