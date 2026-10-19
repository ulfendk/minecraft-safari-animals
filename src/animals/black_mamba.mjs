import { serpent, serpentThreat } from '../lib/anim.mjs';
import { region, gradient, spots, mottle } from '../lib/texture.mjs';
import { face, notFace, all } from '../lib/parts.mjs';

// Africa's fastest snake. Not black at all: slender and gunmetal grey-olive with a
// pale belly. Its name comes from the inky-black inside of its mouth, which it
// gapes wide as a warning while rearing up.
const SEGMENTS = 10;
const segs = [];
for (let i = 0; i < SEGMENTS; i++) {
  const tip = i >= SEGMENTS - 2;
  segs.push({
    name: `seg${i + 1}`, parent: i === 0 ? 'root' : `seg${i}`, pivot: [0, 1, i * 5],
    cubes: [{ origin: [tip ? -0.5 : -1, 0, i * 5], size: [tip ? 1 : 2, tip ? 1 : 2, 5], mat: 'scales' }],
  });
}
const BODY = segs.map((s) => s.name);
const MOUTH = '#0b0a09';

export default {
  id: 'black_mamba',
  name: 'Black Mamba',
  role: 'predator',
  family: ['reptile', 'snake', 'venomous_snake', 'mamba'],
  size: [0.6, 0.4],
  scale: 1.15,
  health: 16,
  speed: 0.3,
  xp: 5,
  // Very fast, and strikes again and again.
  attack: { damage: 3, speed: 2.2, effect: 'poison', cooldown: 0.6 },
  hunts: ['rabbit', 'chicken', 'meerkat'],
  huntInterval: 50,
  huntRange: 10,
  hostile: { range: 4, filters: [{ test: 'is_baby', subject: 'self', value: false }] },
  sleeps: 'night',
  climbs: true,
  breed: ['rabbit', 'chicken'],
  tempt: ['rabbit', 'chicken'],
  heal: [['rabbit', 3], ['chicken', 3]],
  spawn: [{ biomes: ['savanna'], weight: 2, group: [1, 1], blocks: ['grass_block', 'coarse_dirt'] }],
  loot: [{ item: 'leather', min: 0, max: 1 }],
  sounds: { ambient: 'mob.cat.hiss', hurt: 'mob.turtle.hurt', death: 'mob.turtle.death', pitch: [0.75, 0.9], interval: 30 },
  egg: ['#5f5b4c', '#0b0a09'],
  client: { runSpeed: 4 },

  model: {
    bones: [
      { name: 'root', pivot: [0, 0, 0] },
      ...segs,
      {
        // Long "coffin-shaped" head: flat-topped with a squared-off brow.
        name: 'head', parent: 'seg1', pivot: [0, 1, 0],
        cubes: [
          {
            origin: [-1.5, 1, -5], size: [3, 1, 5], mat: 'head',
            marks: [
              { face: 'left', x: 1, y: 0, color: '#141210' }, { face: 'right', x: 3, y: 0, color: '#141210' },
              { face: 'bottom', x: 0, y: 0, w: 3, h: 5, color: MOUTH },
            ],
          },
          { origin: [-1, 2, -3], size: [2, 1, 3], mat: 'head' },
        ],
      },
      {
        name: 'jaw', parent: 'head', pivot: [0, 1, 0],
        cubes: [{ origin: [-1.5, 0, -5], size: [3, 1, 5], mat: 'jaw', marks: [{ face: 'top', x: 0, y: 0, w: 3, h: 5, color: MOUTH }] }],
      },
      { name: 'tongue', parent: 'head', pivot: [0, 1, -5], cubes: [{ origin: [0, 0.5, -7], size: [0, 1, 2], mat: 'tongue' }] },
    ],
  },

  materials: {
    scales: {
      base: '#615d4e',
      layers: [
        // A little browner and darker towards the tail, with faint darker flecks.
        gradient('#46423a', { axis: 2, from: 15, to: 50 }),
        spots('#3a372f', { size: 2, radius: 0.22, seed: 5, where: all(notFace('bottom'), ({ p }) => p[2] > 25) }),
        region('#c8c4a6', ({ face: f }) => f === 'bottom'),
        mottle(0.07, { scale: 1.5 }),
      ],
    },
    head: { base: '#67624f', layers: [region('#2e2b25', all(face('top'), ({ p }) => Math.round(p[2]) === -3)), mottle(0.05)] },
    jaw: { base: '#c8c4a6', layers: [mottle(0.05)] },
    tongue: '#1a1a1a',
  },

  anims: {
    ...serpent({ segments: ['head', ...BODY], amp: 14, tongue: 'tongue', jaw: 'jaw' }),
    threat: serpentThreat({ segments: ['head', ...BODY], raise: 2, angle: 55, jaw: 'jaw', gape: 55, length: 2.5 }),
  },
};
