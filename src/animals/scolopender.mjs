import { serpent } from '../lib/anim.mjs';
import { mottle, region } from '../lib/texture.mjs';

const SEGMENTS = 10;
const segs = [];
for (let i = 0; i < SEGMENTS; i++) {
  const z = i * 2;
  const last = i === SEGMENTS - 1;
  segs.push({
    name: `seg${i + 1}`, parent: i === 0 ? 'root' : `seg${i}`, pivot: [0, 1.5, z],
    cubes: [
      { origin: [-2, 1, z], size: [4, 2, 2], mat: 'plate' },
      // One pair of legs per segment; the last pair trails backwards like a second set of antennae.
      ...(last
        ? [{ origin: [1, 1, z + 2], size: [1, 1, 4], mat: 'leg', rotation: [0, -20, 0], pivot: [1.5, 1.5, z + 2] },
          { origin: [-2, 1, z + 2], size: [1, 1, 4], mat: 'leg', rotation: [0, 20, 0], pivot: [-1.5, 1.5, z + 2] }]
        : [{ origin: [2, 0, z], size: [2, 1, 1], mat: 'leg' }, { origin: [-4, 0, z], size: [2, 1, 1], mat: 'leg' }]),
    ],
  });
}

export default {
  id: 'scolopender',
  name: 'Giant Centipede',
  role: 'predator',
  family: ['arthropod', 'centipede', 'small'],
  size: [0.5, 0.25],
  health: 12,
  speed: 0.26,
  movement: 'climb',
  xp: 3,
  attack: { damage: 3, speed: 1.4, effect: 'poison' },
  hunts: ['tarantula', 'poison_dart_frog', 'chameleon'],
  huntInterval: 30,
  hostile: { range: 5, filters: [{ test: 'is_daytime', subject: 'self', value: false }] },
  sleeps: 'day',
  breed: ['spider_eye'],
  tempt: ['spider_eye'],
  spawn: [{ biomes: ['jungle'], weight: 2, group: [1, 1], blocks: ['grass_block', 'podzol'] }],
  loot: [{ item: 'spider_eye', min: 0, max: 1, chance: 0.5 }],
  sounds: { ambient: 'mob.silverfish.say', hurt: 'mob.silverfish.hit', death: 'mob.silverfish.kill', pitch: [0.6, 0.8], interval: 18 },
  egg: ['#8a2a14', '#e8b02a'],

  model: {
    bones: [
      { name: 'root', pivot: [0, 0, 0] },
      ...segs,
      {
        name: 'head', parent: 'seg1', pivot: [0, 1.5, 0],
        cubes: [
          { origin: [-2, 1, -3], size: [4, 2, 3], mat: 'head' },
          // Venom claws (forcipules) and long antennae.
          { origin: [1, 0, -4], size: [1, 1, 2], mat: 'claw' },
          { origin: [-2, 0, -4], size: [1, 1, 2], mat: 'claw' },
          { origin: [1, 2, -7], size: [1, 1, 4], mat: 'antenna', rotation: [-15, -25, 0], pivot: [1.5, 2.5, -3] },
          { origin: [-2, 2, -7], size: [1, 1, 4], mat: 'antenna', rotation: [-15, 25, 0], pivot: [-1.5, 2.5, -3] },
        ],
      },
    ],
  },

  materials: {
    // Each plate is reddish-brown with a dark rear edge.
    plate: { base: '#8a2a14', layers: [region('#3a120a', ({ p }) => p[2] % 2 > 1.4), mottle(0.08, { scale: 1 })] },
    head: { base: '#2a0e08', layers: [mottle(0.08)] },
    leg: '#e8b02a',
    claw: '#140806',
    antenna: '#c98a20',
  },

  anims: serpent({ segments: segs.map((s) => s.name), amp: 8 }),
};
