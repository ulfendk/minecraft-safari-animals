import { serpent } from '../lib/anim.mjs';
import { region, spots, mottle } from '../lib/texture.mjs';

const SEGMENTS = 8;
const segs = [];
for (let i = 0; i < SEGMENTS; i++) {
  const z = i * 5;
  // Thickest in the middle, tapering to a thin tail.
  const taper = i < SEGMENTS - 3 ? 0 : i - (SEGMENTS - 4);
  const w = 4 - Math.min(2, Math.floor(taper / 1.5) * 1) * 1;
  const h = 3 - (taper > 2 ? 1 : 0);
  segs.push({
    name: `seg${i + 1}`, parent: i === 0 ? 'root' : `seg${i}`, pivot: [0, 1.5, z],
    cubes: [{ origin: [-w / 2, 0, z], size: [w, h, 5], mat: 'scales' }],
  });
}

export default {
  id: 'anaconda',
  name: 'Green Anaconda',
  role: 'predator',
  family: ['reptile', 'snake'],
  size: [1.0, 0.4],
  health: 30,
  speed: 0.18,
  swimSpeed: 0.18,
  movement: 'amphibious',
  xp: 5,
  knockbackResistance: 0.5,
  // A crushing squeeze: the victim is slowed right down.
  attack: { damage: 4, speed: 1.4, effect: 'slowness' },
  hunts: ['capybara', 'flamingo', 'warthog', 'gazelle', 'rabbit', 'chicken', 'turtle'],
  huntInterval: 40,
  huntRange: 12,
  sleeps: 'day',
  breed: ['chicken', 'rabbit'],
  tempt: ['chicken', 'rabbit'],
  heal: [['chicken', 3], ['rabbit', 3]],
  spawn: [
    { biomes: ['swamp', 'mangrove'], weight: 2, group: [1, 1], blocks: ['grass_block', 'mud'] },
    { biomes: ['jungle', 'river'], weight: 1, group: [1, 1], blocks: ['grass_block', 'mud', 'sand'] },
  ],
  loot: [{ item: 'leather', min: 1, max: 2 }],
  sounds: { ambient: 'mob.cat.hiss', hurt: 'mob.turtle.hurt', death: 'mob.turtle.death', pitch: [0.45, 0.55], interval: 25 },
  egg: ['#4d5a2a', '#1a1a10'],

  model: {
    bones: [
      { name: 'root', pivot: [0, 0, 0] },
      ...segs,
      {
        name: 'head', parent: 'seg1', pivot: [0, 1.5, 0],
        cubes: [
          {
            origin: [-2, 0, -4], size: [4, 2, 4], mat: 'head',
            // Eyes and nostrils sit on top, so it can watch from just under the water.
            marks: [{ face: 'top', x: 0, y: 2, color: '#d8a82a' }, { face: 'top', x: 3, y: 2, color: '#d8a82a' }, { face: 'top', x: 1, y: 0, color: '#1a1a10' }, { face: 'top', x: 2, y: 0, color: '#1a1a10' }],
          },
          { origin: [-1, 0, -6], size: [2, 1, 2], mat: 'head' },
        ],
      },
      { name: 'tongue', parent: 'head', pivot: [0, 0.5, -6], cubes: [{ origin: [0, 0, -8], size: [0, 1, 2], mat: 'tongue' }] },
    ],
  },

  materials: {
    scales: {
      base: '#4d5a2a',
      layers: [
        // Big black ovals along the back, smaller ones with yellow centres along the flanks.
        spots('#14160c', { size: 3, radius: 0.42, seed: 3, where: ({ face: f }) => f === 'top' }),
        spots('#14160c', { size: 2.4, radius: 0.4, seed: 8, where: ({ face: f }) => f === 'left' || f === 'right' }),
        spots('#c8a83a', { size: 2.4, radius: 0.18, seed: 8, where: ({ face: f }) => f === 'left' || f === 'right' }),
        region('#c8b85a', ({ face: f }) => f === 'bottom'),
        mottle(0.1, { scale: 2 }),
      ],
    },
    head: { base: '#4d5a2a', layers: [region('#2a2e18', ({ face: f, j }) => (f === 'left' || f === 'right') && j === 0), mottle(0.08)] },
    tongue: '#c42a3a',
  },

  anims: serpent({ segments: ['head', ...segs.map((s) => s.name)], amp: 10, tongue: 'tongue' }),
};
