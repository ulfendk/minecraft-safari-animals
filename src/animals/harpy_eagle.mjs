import { bird } from '../lib/anim.mjs';
import { all, bone, face } from '../lib/parts.mjs';
import { fur, mottle, region } from '../lib/texture.mjs';

/** Pale and dark bars across flight and tail feathers. */
const barred = (dark, period = 2) => (c, { p }) => (Math.floor(p[1] + p[2]) % period === 0 ? [dark[0], dark[1], dark[2], 255] : c);

export default {
  id: 'harpy_eagle',
  name: 'Harpy Eagle',
  role: 'predator',
  family: ['bird', 'raptor'],
  size: [0.8, 1.1],
  health: 24,
  speed: 0.22,
  flySpeed: 0.22,
  movement: 'fly',
  xp: 6,
  // One of the strongest birds of prey, with talons the size of a bear's claws.
  attack: { damage: 7, speed: 1.6 },
  hunts: ['baboon', 'chimpanzee', 'meerkat', 'chameleon', 'rabbit', 'chicken', 'parrot', 'koala'],
  huntInterval: 40,
  huntRange: 24,
  sleeps: 'night',
  breed: ['chicken', 'rabbit'],
  tempt: ['chicken', 'rabbit'],
  heal: [['chicken', 4], ['rabbit', 4]],
  spawn: [{ biomes: ['jungle'], weight: 1, group: [1, 1], blocks: ['grass_block', 'podzol'] }],
  loot: [{ item: 'feather', min: 1, max: 4 }],
  sounds: { ambient: 'mob.phantom.idle', hurt: 'mob.parrot.hurt', death: 'mob.parrot.death', pitch: [1.0, 1.2], interval: 22 },
  egg: ['#5a5e64', '#f0eee8'],

  model: {
    bones: [
      { name: 'root', pivot: [0, 0, 0] },
      {
        name: 'body', parent: 'root', pivot: [0, 8, 0], rotation: [-10, 0, 0],
        cubes: [{ origin: [-3, 5, -3], size: [6, 8, 6], mat: 'plumage' }],
      },
      { name: 'tail', parent: 'body', pivot: [0, 6, 3], rotation: [55, 0, 0], cubes: [{ origin: [-2, 5, 3], size: [4, 1, 7], mat: 'tailfeathers' }] },
      { name: 'wing_l', parent: 'body', pivot: [3, 12, -1], cubes: [{ origin: [3, 4, -3], size: [1, 9, 8], mat: 'wing' }] },
      { name: 'wing_r', parent: 'body', pivot: [-3, 12, -1], cubes: [{ origin: [-4, 4, -3], size: [1, 9, 8], mat: 'wing' }] },
      { name: 'neck', parent: 'body', pivot: [0, 13, -1], cubes: [{ origin: [-2, 13, -3], size: [4, 1, 4], mat: 'head' }] },
      {
        name: 'head', parent: 'neck', pivot: [0, 14, -1],
        cubes: [
          {
            origin: [-2, 14, -4], size: [4, 4, 4], mat: 'head',
            // Grey facial disc with dark, forward-facing eyes.
            marks: [{ face: 'front', x: 0, y: 1, color: '#14100c' }, { face: 'front', x: 3, y: 1, color: '#14100c' }],
          },
          { origin: [-1, 15, -6], size: [2, 1, 2], mat: 'beak' },
          { origin: [-1, 14, -6], size: [2, 1, 1], mat: 'beak' },
          // The split double crest, lying back over the head.
          { origin: [-2, 18, -1], size: [1, 3, 1], mat: 'crest', rotation: [-60, 0, 12], pivot: [-1.5, 18, -0.5] },
          { origin: [1, 18, -1], size: [1, 3, 1], mat: 'crest', rotation: [-60, 0, -12], pivot: [1.5, 18, -0.5] },
        ],
      },
      {
        name: 'leg_l', parent: 'root', pivot: [1.5, 5, 0],
        cubes: [{ origin: [1, 3, -1], size: [2, 3, 2], mat: 'thigh' }, { origin: [1, 0, -1], size: [2, 3, 2], mat: 'foot' }, { origin: [1, 0, -2], size: [2, 1, 1], mat: 'talon' }],
      },
      {
        name: 'leg_r', parent: 'root', pivot: [-1.5, 5, 0],
        cubes: [{ origin: [-3, 3, -1], size: [2, 3, 2], mat: 'thigh' }, { origin: [-3, 0, -1], size: [2, 3, 2], mat: 'foot' }, { origin: [-3, 0, -2], size: [2, 1, 1], mat: 'talon' }],
      },
    ],
  },

  materials: {
    plumage: {
      base: '#4a4e54',
      layers: [
        // White belly with a broad black band across the chest.
        region('#f0eee8', all(bone('body'), face('front', 'bottom'))),
        region('#1a1a1c', all(bone('body'), face('front', 'left', 'right'), ({ p }) => p[1] > 10.5 && p[1] < 12.5)),
        mottle(0.08, { scale: 2 }),
        fur(0.06),
      ],
    },
    wing: { base: '#3a3e44', layers: [barred([28, 28, 30], 3), mottle(0.08)] },
    tailfeathers: { base: '#5a5e64', layers: [barred([26, 26, 28], 2)] },
    head: { base: '#a8acb0', layers: [region('#7a7e84', face('top', 'back')), fur(0.06)] },
    crest: '#1a1a1c',
    beak: '#1a1a1c',
    thigh: { base: '#f0eee8', layers: [barred([40, 40, 44], 2)] },
    foot: '#e8c23a',
    talon: '#14100c',
  },

  anims: bird({ neck: 'neck', swing: 25, sleepDrop: 3, walkLength: 0.8, flyBase: 78, flapAmp: 12, glideBase: 85 }),
};
