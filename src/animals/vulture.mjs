import { bird } from '../lib/anim.mjs';
import { eyes } from '../lib/parts.mjs';
import { fur, mottle, region } from '../lib/texture.mjs';

export default {
  id: 'vulture',
  name: 'Vulture',
  role: 'scavenger',
  family: ['bird', 'scavenger'],
  size: [0.7, 0.8],
  health: 12,
  speed: 0.2,
  flySpeed: 0.18,
  movement: 'fly',
  xp: 2,
  attack: { damage: 2, speed: 1.4 },
  breed: ['rotten_flesh'],
  tempt: ['rotten_flesh'],
  heal: [['rotten_flesh', 3]],
  sleeps: 'night',
  spawn: [
    { biomes: ['savanna'], weight: 2, group: [1, 3], blocks: ['grass_block'] },
    { biomes: ['desert', 'mesa'], weight: 1, group: [1, 2] },
  ],
  loot: [{ item: 'feather', min: 1, max: 3 }],
  sounds: { ambient: 'mob.phantom.idle', hurt: 'mob.parrot.hurt', death: 'mob.parrot.death', pitch: [1.3, 1.5], interval: 20 },
  egg: ['#3b2c22', '#e3c2b6'],

  model: {
    bones: [
      { name: 'root', pivot: [0, 0, 0] },
      // Hunched, standing pose.
      { name: 'body', parent: 'root', pivot: [0, 6, 0], rotation: [-20, 0, 0], cubes: [{ origin: [-3, 4, -3], size: [6, 5, 7], mat: 'feathers' }] },
      { name: 'tail', parent: 'body', pivot: [0, 5, 4], rotation: [30, 0, 0], cubes: [{ origin: [-2, 4, 4], size: [4, 1, 4], mat: 'flight' }] },
      { name: 'wing_l', parent: 'body', pivot: [3, 9, -2], cubes: [{ origin: [3, 3, -3], size: [1, 6, 9], mat: 'wing' }] },
      { name: 'wing_r', parent: 'body', pivot: [-3, 9, -2], cubes: [{ origin: [-4, 3, -3], size: [1, 6, 9], mat: 'wing' }] },
      {
        name: 'neck', parent: 'body', pivot: [0, 8, -2], rotation: [40, 0, 0],
        cubes: [
          { origin: [-2, 8, -4], size: [4, 2, 3], mat: 'ruff' },
          { origin: [-1, 10, -3], size: [2, 2, 2], mat: 'skin' },
        ],
      },
      {
        name: 'head', parent: 'neck', pivot: [0, 12, -2], rotation: [-25, 0, 0],
        cubes: [
          { origin: [-1, 12, -5], size: [2, 2, 3], mat: 'skin', marks: eyes(3, { back: 1, down: 0, color: '#2a1810' }) },
          { origin: [-1, 12, -7], size: [2, 2, 2], mat: 'beak' },
          { origin: [-1, 11, -7], size: [2, 1, 1], mat: 'beaktip' },
        ],
      },
      { name: 'leg_l', parent: 'root', pivot: [1.5, 4, 0], cubes: [{ origin: [1, 0, -1], size: [1, 4, 1], mat: 'leg' }, { origin: [1, 0, -2], size: [1, 1, 1], mat: 'leg' }] },
      { name: 'leg_r', parent: 'root', pivot: [-1.5, 4, 0], cubes: [{ origin: [-2, 0, -1], size: [1, 4, 1], mat: 'leg' }, { origin: [-2, 0, -2], size: [1, 1, 1], mat: 'leg' }] },
    ],
  },

  materials: {
    feathers: { base: '#5a4434', layers: [region('#c9b9a4', ({ face: f }) => f === 'front' || f === 'bottom'), mottle(0.12, { scale: 2 }), fur(0.08)] },
    // Folded wing: dark flight feathers, a pale band of coverts, brown shoulders.
    wing: {
      base: '#4a3628',
      layers: [
        region('#d8cbb6', ({ p }) => p[1] > 5.5 && p[1] < 6.6),
        region('#231a14', ({ p }) => p[2] > 4 || p[1] < 4.5),
        mottle(0.1, { scale: 2 }),
        fur(0.08),
      ],
    },
    flight: '#231a14',
    ruff: { base: '#efe8dc', layers: [fur(0.12)] },
    skin: { base: '#cfa79c', layers: [mottle(0.08, { scale: 1.5 })] },
    beak: '#a39d93',
    beaktip: '#2e2a26',
    leg: '#8f8a83',
  },

  anims: bird({ neck: 'neck', swing: 30, sleepDrop: 3, walkLength: 0.7, flyBase: 75, flapAmp: 15, glideBase: 85 }),
};
