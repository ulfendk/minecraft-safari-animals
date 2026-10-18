import { bird } from '../lib/anim.mjs';
import { fur, mottle, region } from '../lib/texture.mjs';

export default {
  id: 'flamingo',
  name: 'Flamingo',
  role: 'prey',
  family: ['bird', 'flamingo'],
  size: [0.5, 1.3],
  health: 8,
  speed: 0.22,
  xp: 2,
  wades: true,
  breed: ['kelp', 'tropical_fish'],
  tempt: ['kelp', 'tropical_fish'],
  sleeps: 'night',
  spawn: [
    { biomes: ['swamp', 'mangrove'], weight: 5, group: [4, 8], blocks: ['grass_block', 'mud', 'sand', 'clay', 'dirt'] },
    { biomes: ['river', 'beach'], weight: 2, group: [4, 8], blocks: ['sand', 'gravel', 'clay', 'mud'] },
  ],
  loot: [{ item: 'feather', min: 0, max: 2 }],
  sounds: { ambient: 'mob.parrot.idle', hurt: 'mob.parrot.hurt', death: 'mob.parrot.death', pitch: [0.6, 0.7], interval: 12 },
  egg: ['#f08aa0', '#1e1a1a'],
  client: { idle: ['one_leg'] },

  model: {
    bones: [
      { name: 'root', pivot: [0, 0, 0] },
      { name: 'body', parent: 'root', pivot: [0, 16, 0], cubes: [{ origin: [-2, 14, -4], size: [4, 5, 8], mat: 'feathers' }] },
      { name: 'tail', parent: 'body', pivot: [0, 17, 4], rotation: [-20, 0, 0], cubes: [{ origin: [-1, 15, 4], size: [2, 2, 3], mat: 'wingtip' }] },
      { name: 'wing_l', parent: 'body', pivot: [2, 18, -2], cubes: [{ origin: [2, 15, -3], size: [1, 3, 7], mat: 'wing' }] },
      { name: 'wing_r', parent: 'body', pivot: [-2, 18, -2], cubes: [{ origin: [-3, 15, -3], size: [1, 3, 7], mat: 'wing' }] },
      { name: 'neck', parent: 'body', pivot: [0, 18, -3], rotation: [-8, 0, 0], cubes: [{ origin: [-1, 18, -5], size: [2, 10, 2], mat: 'feathers' }] },
      {
        name: 'head', parent: 'neck', pivot: [0, 28, -4],
        cubes: [
          {
            origin: [-1, 28, -7], size: [2, 2, 3], mat: 'feathers',
            // Yellow eye with a black pupil on each side of the head.
            marks: [
              { face: 'right', x: 0, y: 0, color: '#f2d64b' }, { face: 'right', x: 1, y: 0, color: '#111111' },
              { face: 'left', x: 2, y: 0, color: '#f2d64b' }, { face: 'left', x: 1, y: 0, color: '#111111' },
            ],
          },
          { origin: [-1, 27, -9], size: [2, 2, 2], mat: 'beak' },
          { origin: [-1, 25, -9], size: [2, 2, 1], mat: 'beaktip' },
        ],
      },
      { name: 'leg_l', parent: 'root', pivot: [1, 15, 0], cubes: [{ origin: [0, 0, -1], size: [1, 15, 1], mat: 'leg' }, { origin: [0, 0, -3], size: [1, 1, 2], mat: 'leg' }] },
      { name: 'leg_r', parent: 'root', pivot: [-1, 15, 0], cubes: [{ origin: [-1, 0, -1], size: [1, 15, 1], mat: 'leg' }, { origin: [-1, 0, -3], size: [1, 1, 2], mat: 'leg' }] },
    ],
  },

  materials: {
    feathers: { base: '#f08aa0', layers: [mottle(0.08, { scale: 3 }), fur(0.05)] },
    wing: { base: '#f27a93', layers: [region('#1e1a1a', ({ p }) => p[2] > 2), fur(0.05)] },
    wingtip: '#1e1a1a',
    beak: '#f4e6d8',
    beaktip: '#1e1a1a',
    leg: '#e06f88',
  },

  anims: bird({ neck: 'neck', swing: 30, sleepDrop: 8, walkLength: 0.9 }),
};
