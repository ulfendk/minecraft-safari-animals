import { quadruped } from '../lib/anim.mjs';
import { caprid, hornArc } from '../lib/bodies.mjs';
import { all, bone, face, LEGS } from '../lib/parts.mjs';
import { fur, mottle, region } from '../lib/texture.mjs';

// The biggest of all wild cattle: a dark bull with a high ridge over the shoulders that runs
// halfway down the back, white stockings, a pale grey boss between the horns and thick horns
// that curve out, up and in.
const top = 23; // top of the back (caprid: legH - 1 + bodyH)
const base = caprid({
  bodyW: 12, bodyH: 13, bodyL: 22, legH: 11, legW: 4, neckW: 8, neckH: 5, headW: 7, headH: 7, headD: 7, muzzleD: 2,
  tail: 9, earL: 2,
  horns: ({ top: t, back, side }) => [
    { origin: [-side + 0.5, t - 1, back - 4], size: [2 * side - 1, 2, 3], mat: 'boss' },
    ...hornArc(
      [[side + 0.5, t - 1.5, back - 3], [side + 2, t - 1, back - 3], [side + 3, t, back - 3.5], [side + 3.5, t + 1.5, back - 4], [side + 3, t + 3, back - 4], [side + 2, t + 4, back - 3.5]],
      { size: [2, 2, 2, 2, 1, 1] },
    ),
  ],
});
const model = {
  ...base,
  bones: base.bones.map((b) => (b.name === 'body'
    ? {
      ...b,
      cubes: [
        ...b.cubes,
        // The dorsal ridge: highest over the shoulders, stepping down towards the middle of the back.
        { origin: [-4, top, -10], size: [8, 5, 8], mat: 'hide' },
        { origin: [-3, top, -2], size: [6, 3, 4], mat: 'hide' },
        { origin: [-2, top, 2], size: [4, 1, 3], mat: 'hide' },
      ],
    }
    : b)),
};

export default {
  id: 'gaur',
  name: 'Gaur',
  role: 'megafauna',
  family: ['bovine', 'grazer'],
  size: [1.6, 2.0],
  scale: 1.55,
  health: 50,
  speed: 0.23,
  xp: 7,
  knockbackResistance: 0.85,
  // Short-tempered: gets close and the bull charges, and the herd joins in.
  attack: { damage: 10, speed: 1.7, cooldown: 1.5 },
  hostile: { range: 6, filters: [{ test: 'is_baby', subject: 'self', value: false }] },
  alertsPack: true,
  breed: ['wheat'],
  tempt: ['wheat', 'hay_block'],
  heal: [['wheat', 2], ['hay_block', 20]],
  grazes: true,
  sleeps: 'night',
  spawn: [{ biomes: ['jungle'], weight: 2, group: [2, 5], blocks: ['grass_block', 'podzol'] }],
  loot: [
    { item: 'leather', min: 1, max: 3 },
    { item: 'safari:raw_game_meat', min: 2, max: 5, smelts: true },
  ],
  sounds: { ambient: 'mob.cow.say', hurt: 'mob.cow.hurt', death: 'mob.cow.hurt', pitch: [0.4, 0.5], interval: 18 },
  egg: ['#2a1d16', '#e8e2d2'],
  client: { runSpeed: 4 },

  model,

  materials: {
    // Near-black, browner on the flanks, with white stockings below the knees.
    hide: {
      base: '#2a1d16',
      layers: [
        region('#3e2a1e', all(bone('body'), face('left', 'right'), ({ p }) => p[1] < 16)),
        region('#e8e2d2', all(bone(...LEGS), ({ p }) => p[1] < 6)),
        mottle(0.08, { scale: 4 }),
        fur(0.05),
      ],
    },
    face: { base: '#2a1d16', layers: [fur(0.05)] },
    boss: { base: '#9a968a', layers: [fur(0.08)] },
    muzzle: { base: '#8f8a80', layers: [fur(0.04)] },
    ear: '#2a1d16',
    tail: { base: '#2a1d16', layers: [region('#120d0a', ({ p }) => p[1] < 17)] },
    horn: { base: '#b8b48a', layers: [region('#1e1a16', ({ p }) => p[1] > 28.5)] },
    hoof: '#16120f',
  },

  anims: quadruped({ neck: 'neck', tail: ['tail'], ears: ['ear_l', 'ear_r'], swing: 24, sleepDrop: 6, legFold: 75, walkLength: 1.2, runLength: 0.55 }),
};
