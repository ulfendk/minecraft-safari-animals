import { serpent, serpentThreat } from '../lib/anim.mjs';
import { region, stripes, gradient, mottle } from '../lib/texture.mjs';
import { all, bone, face, notFace } from '../lib/parts.mjs';

// The longest venomous snake: olive-brown and dark towards the tail, crossed by
// narrow pale chevrons, with a cream throat and a narrow hood it spreads when it
// rears up to look a threat in the eye.
const SEGMENTS = 9;
const WIDTHS = [2, 3, 3, 3, 3, 2, 2, 2, 1];
const HEIGHTS = [2, 2, 2, 2, 2, 2, 2, 1, 1];
const segs = WIDTHS.map((w, i) => ({
  name: `seg${i + 1}`, parent: i === 0 ? 'root' : `seg${i}`, pivot: [0, 1, i * 5],
  cubes: [{ origin: [-w / 2, 0, i * 5], size: [w, HEIGHTS[i], 5], mat: i === 0 ? 'neck' : 'scales' }],
}));
const BODY = segs.map((s) => s.name);
const EYE = '#16120a';
const IRIS = '#c8a43a';

export default {
  id: 'king_cobra',
  name: 'King Cobra',
  role: 'predator',
  family: ['reptile', 'snake', 'venomous_snake'],
  size: [0.8, 0.5],
  scale: 1.2,
  health: 20,
  speed: 0.2,
  xp: 5,
  // Venomous bite. It mostly hunts other snakes (its Latin name means "snake-eater").
  attack: { damage: 3, speed: 1.4, effect: 'poison' },
  hunts: ['mamba', 'rabbit', 'chicken'],
  huntInterval: 60,
  huntRange: 10,
  // Defends itself if you come too close.
  hostile: { range: 3, filters: [{ test: 'is_baby', subject: 'self', value: false }] },
  sleeps: 'night',
  climbs: true,
  breed: ['rabbit', 'chicken'],
  tempt: ['rabbit', 'chicken'],
  heal: [['rabbit', 3], ['chicken', 3]],
  spawn: [{ biomes: ['jungle'], weight: 2, group: [1, 1], blocks: ['grass_block', 'podzol', 'coarse_dirt'] }],
  loot: [{ item: 'leather', min: 0, max: 1 }],
  // King cobras growl rather than hiss: a deep, low hiss.
  sounds: { ambient: 'mob.cat.hiss', hurt: 'mob.turtle.hurt', death: 'mob.turtle.death', pitch: [0.35, 0.45], interval: 30 },
  egg: ['#3b3a26', '#d8cc88'],

  model: {
    bones: [
      { name: 'root', pivot: [0, 0, 0] },
      ...segs,
      // The hood: two flaps along the neck, folded flat against its sides until it rears.
      { name: 'hood_l', parent: 'seg1', pivot: [1, 2, 0], rotation: [0, 0, 90], cubes: [{ origin: [1, 1, 0], size: [3, 1, 5], mat: 'hood' }] },
      { name: 'hood_r', parent: 'seg1', pivot: [-1, 2, 0], rotation: [0, 0, -90], cubes: [{ origin: [-4, 1, 0], size: [3, 1, 5], mat: 'hood' }] },
      {
        name: 'head', parent: 'seg1', pivot: [0, 1, 0],
        cubes: [
          {
            // Broad, rounded head with big scales, and eyes set well forward on the sides.
            origin: [-1.5, 0, -4], size: [3, 2, 4], mat: 'head',
            marks: [
              { face: 'left', x: 1, y: 0, color: IRIS }, { face: 'left', x: 1, y: 1, color: EYE },
              { face: 'right', x: 2, y: 0, color: IRIS }, { face: 'right', x: 2, y: 1, color: EYE },
            ],
          },
          { origin: [-1, 0, -5], size: [2, 1, 1], mat: 'head', marks: [{ face: 'front', x: 0, y: 0, w: 2, color: '#2a2614' }] },
        ],
      },
      { name: 'tongue', parent: 'head', pivot: [0, 0.5, -5], cubes: [{ origin: [0, 0, -7], size: [0, 1, 2], mat: 'tongue' }] },
    ],
  },

  materials: {
    scales: {
      base: '#4a4628',
      layers: [
        // Paler olive-brown at the front, darkening to near-black at the tail.
        gradient('#1e1c12', { axis: 2, from: 10, to: 40 }),
        stripes('#d8cc88', { axis: 2, period: 5, width: 0.16, warp: 1.2, warpScale: 3, where: notFace('bottom') }),
        region('#d8cc88', ({ face: f }) => f === 'bottom'),
        mottle(0.08, { scale: 1.5 }),
      ],
    },
    neck: { base: '#5e5432', shading: 0.04, layers: [region('#e0d49a', ({ face: f }) => f === 'bottom' || f === 'front'), mottle(0.06)] },
    hood: {
      base: '#5a5030',
      shading: 0.04,
      layers: [
        // The underside of the hood faces forward when spread: cream with a dark rim.
        region('#e4d8a0', ({ face: f }) => f === 'bottom'),
        region('#2e2a18', all(face('bottom'), ({ p }) => Math.abs(p[0]) > 3.2)),
        stripes('#d8cc88', { axis: 2, period: 3, width: 0.25, warp: 0.4, where: face('top') }),
      ],
    },
    head: {
      base: '#5e5432',
      layers: [
        // Big head shields outlined in dark brown.
        region('#2e2a18', all(face('top'), ({ p }) => Math.round(p[2]) === -2 || Math.abs(p[0]) > 1.2)),
        region('#e0d49a', all(bone('head'), face('bottom'))),
        mottle(0.05),
      ],
    },
    tongue: '#2a2a2a',
  },

  anims: {
    ...serpent({ segments: ['head', ...BODY], amp: 12, tongue: 'tongue' }),
    threat: serpentThreat({ segments: ['head', ...BODY], raise: 2, angle: 65, hood: ['hood_l', 'hood_r'] }),
  },
};
