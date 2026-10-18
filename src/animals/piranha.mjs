import { fish } from '../lib/anim.mjs';
import { all, bone, face } from '../lib/parts.mjs';
import { gradient, mottle, region } from '../lib/texture.mjs';

export default {
  id: 'piranha',
  name: 'Piranha',
  role: 'predator',
  family: ['fish', 'piranha'],
  size: [0.4, 0.35],
  health: 6,
  speed: 0.14,
  swimSpeed: 0.16,
  movement: 'swim',
  school: true,
  xp: 2,
  attack: { damage: 2, speed: 1.6 },
  // A feeding frenzy: they go for prey in the water, and for swimmers who are already hurt.
  hunts: ['capybara', 'flamingo', 'turtle'],
  huntInterval: 20,
  huntRange: 10,
  hostile: { range: 10, filters: [{ test: 'in_water', subject: 'other', value: true }, { test: 'actor_health', subject: 'other', operator: '<', value: 14 }] },
  sleeps: 'never',
  spawn: [
    { biomes: ['jungle', 'river'], weight: 4, group: [4, 7], water: true },
    { biomes: ['swamp', 'mangrove'], weight: 2, group: [3, 5], water: true },
  ],
  loot: [{ item: 'cod', min: 0, max: 1, smelts: true }, { item: 'bone_meal', min: 0, max: 1, chance: 0.1 }],
  sounds: { hurt: 'mob.fish.hurt', death: 'mob.fish.death', pitch: [0.9, 1.1] },
  egg: ['#8e9aa2', '#d8281e'],

  model: {
    bones: [
      { name: 'root', pivot: [0, 0, 0] },
      {
        name: 'body', parent: 'root', pivot: [0, 2.5, 0],
        cubes: [
          // Deep, flattened body; blunt head with a jutting lower jaw.
          { origin: [-1, 0, -3], size: [2, 5, 6], mat: 'scales' },
          {
            origin: [-1, 1, -5], size: [2, 4, 2], mat: 'scales',
            marks: [{ face: 'right', x: 1, y: 1, color: '#c43a1e' }, { face: 'left', x: 0, y: 1, color: '#c43a1e' }],
          },
          // Fins: dorsal, anal and a little pectoral on each side.
          { origin: [0, 5, -1], size: [0, 2, 3], mat: 'fin' },
          { origin: [0, -1, 1], size: [0, 1, 2], mat: 'fin' },
          { origin: [1, 1, -2], size: [1, 1, 2], mat: 'fin', rotation: [0, 0, -30], pivot: [1, 1.5, -1] },
          { origin: [-2, 1, -2], size: [1, 1, 2], mat: 'fin', rotation: [0, 0, 30], pivot: [-1, 1.5, -1] },
        ],
      },
      {
        name: 'jaw', parent: 'body', pivot: [0, 1, -4],
        cubes: [{ origin: [-1, 0, -6], size: [2, 1, 3], mat: 'jaw', marks: [{ face: 'top', x: 0, y: 0, w: 2, color: '#f2efe4' }, { face: 'right', x: 2, y: 0, color: '#f2efe4' }, { face: 'left', x: 0, y: 0, color: '#f2efe4' }] }],
      },
      { name: 'tail', parent: 'body', pivot: [0, 2.5, 3], cubes: [{ origin: [0, 0, 3], size: [0, 5, 3], mat: 'tailfin' }] },
    ],
  },

  materials: {
    scales: {
      base: '#8e9aa2',
      layers: [
        // Silvery back, flecked with glints, and a blood-red belly and throat.
        region('#d8281e', all(bone('body'), ({ face: f, p }) => f === 'bottom' || p[1] < 1.8)),
        gradient('#5a6670', { axis: 1, from: 3, to: 5, where: bone('body') }),
        region('#d8e0e6', ({ p, face: f }) => f !== 'bottom' && (Math.floor(p[2] * 3 + p[1] * 5) * 2654435761 >>> 0) % 13 === 0),
        mottle(0.06, { scale: 1 }),
      ],
      shading: 0.08,
    },
    jaw: { base: '#c43a1e', layers: [] },
    fin: { base: '#6a5048', layers: [] },
    tailfin: { base: '#3a2e2a', layers: [region('#8a6a5a', ({ i }) => i < 1)] },
  },

  anims: fish({ jaw: 'jaw' }),
};
