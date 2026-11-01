import { quadruped } from '../lib/anim.mjs';
import { caprid, hornArc } from '../lib/bodies.mjs';
import { all, bone, face, LEGS } from '../lib/parts.mjs';
import { fur, mottle, region } from '../lib/texture.mjs';

// Short black daggers of horns, curving slightly back.
const model = caprid({
  bodyW: 8, bodyH: 9, bodyL: 14, legH: 9, legW: 3, neckW: 5, neckH: 9, headW: 4, headH: 4, headD: 6, muzzleD: 2,
  beard: 3, hump: 2, skirt: 2,
  horns: ({ top, back }) => hornArc([[1, top + 0.5, back - 2.5], [1, top + 1.5, back - 2.2], [1, top + 2.5, back - 1.7], [1, top + 3.3, back - 1]], { size: 1 }),
});

export default {
  id: 'mountain_goat',
  name: 'Mountain Goat',
  role: 'prey',
  family: ['caprine', 'grazer'],
  size: [0.9, 1.3],
  health: 18,
  speed: 0.24,
  xp: 3,
  knockbackResistance: 0.4,
  // Stands its ground: sharp horns, even against bears.
  attack: { damage: 4, speed: 1.4, cooldown: 1.5 },
  fallImmune: true,
  breed: ['wheat'],
  tempt: ['wheat'],
  grazes: true,
  sleeps: 'night',
  spawn: [
    { biomes: ['peaks'], weight: 6, group: [2, 4] },
    { biomes: ['mountain'], weight: 2, group: [1, 3] },
  ],
  loot: [
    { item: 'safari:raw_game_meat', min: 1, max: 2, smelts: true },
    { item: 'white_wool', min: 0, max: 1 },
  ],
  sounds: { ambient: 'mob.goat.ambient', hurt: 'mob.goat.hurt', death: 'mob.goat.death', pitch: [0.9, 1.0] },
  egg: ['#eeebe2', '#1d1b1a'],

  model,

  materials: {
    hide: {
      base: '#eeebe2',
      layers: [
        region('#e2dccb', all(bone(...LEGS), ({ p }) => p[1] < 4)),
        mottle(0.05, { scale: 3 }),
        fur(0.12),
      ],
    },
    skirt: { base: '#e8e3d6', layers: [region('#d9d2c0', ({ i }) => i % 2 === 0), fur(0.12)] },
    beard: { base: '#f2efe8', layers: [fur(0.1)] },
    face: { base: '#f0ede5', layers: [fur(0.06)] },
    muzzle: { base: '#e6e1d6', layers: [region('#2a2624', face('bottom')), fur(0.05)] },
    ear: '#e6e1d6',
    tail: '#e6e1d6',
    horn: '#1b1a19',
    hoof: '#1d1b1a',
  },

  anims: quadruped({ neck: 'neck', tail: ['tail'], ears: ['ear_l', 'ear_r'], swing: 26, sleepDrop: 6, legFold: 80, walkLength: 1.1, runLength: 0.45 }),
};
