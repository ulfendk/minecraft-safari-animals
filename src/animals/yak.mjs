import { quadruped } from '../lib/anim.mjs';
import { caprid, hornArc } from '../lib/bodies.mjs';
import { all, bone, face } from '../lib/parts.mjs';
import { fur, mottle, region } from '../lib/texture.mjs';

const top = 19; // top of the back (caprid: legH - 1 + bodyH)

// A pack animal: a long-haired skirt to the knees, a big shoulder hump, horns out to the
// sides and up. Saddled, it carries a rider and a pair of packs.
const model = caprid({
  bodyW: 12, bodyH: 11, bodyL: 20, legH: 9, legW: 4, neckW: 7, neckH: 6, headW: 6, headH: 6, headD: 6, muzzleD: 2,
  hump: 3, skirt: 5, tail: 6, earL: 2,
  horns: ({ top: t, back, side }) => hornArc(
    [[side + 0.5, t - 1.5, back - 2.5], [side + 2, t - 1.5, back - 2.5], [side + 3.5, t - 1, back - 2.5], [side + 4.5, t + 0.5, back - 3], [side + 4.5, t + 2, back - 3.5], [side + 4, t + 3, back - 4]],
    { size: [2, 2, 2, 2, 1, 1] },
  ),
  extra: [
    {
      name: 'saddle', parent: 'body', pivot: [0, top, 3],
      cubes: [
        { origin: [-6, top, -1], size: [12, 1, 8], mat: 'saddle', inflate: 0.2 },
        { origin: [-7, top - 6, 0], size: [1, 7, 6], mat: 'blanket' },
        { origin: [6, top - 6, 0], size: [1, 7, 6], mat: 'blanket' },
      ],
    },
    {
      name: 'chest', parent: 'body', pivot: [0, top - 4, 7],
      cubes: [
        { origin: [-9, top - 9, 3], size: [3, 6, 7], mat: 'chest' },
        { origin: [6, top - 9, 3], size: [3, 6, 7], mat: 'chest' },
      ],
    },
  ],
});

export default {
  id: 'yak',
  name: 'Yak',
  role: 'megafauna',
  family: ['bovine', 'grazer'],
  size: [1.3, 1.6],
  scale: 1.6,
  health: 34,
  speed: 0.2,
  xp: 5,
  knockbackResistance: 0.6,
  // Charges whoever hurts it.
  attack: { damage: 7, speed: 1.4, cooldown: 1.5 },
  breed: ['wheat'],
  tempt: ['wheat', 'hay_block'],
  heal: [['wheat', 2], ['hay_block', 20]],
  grazes: true,
  sleeps: 'night',
  strollRange: 12,
  ride: {
    seat: [0, 1.25, -0.2],
    tameItems: ['wheat', 'apple', 'hay_block'],
    temper: 100,
    chest: true,
    jumpStrength: 0.5,
  },
  spawn: [
    { biomes: ['peaks'], weight: 3, group: [2, 4] },
    { biomes: ['mountain'], weight: 2, group: [2, 3] },
  ],
  loot: [
    { item: 'leather', min: 1, max: 3 },
    { item: 'safari:raw_game_meat', min: 2, max: 4, smelts: true },
  ],
  sounds: { ambient: 'mob.cow.say', hurt: 'mob.cow.hurt', death: 'mob.cow.hurt', pitch: [0.55, 0.65], interval: 16 },
  egg: ['#2b2421', '#8a7a68'],
  client: { runSpeed: 4 },

  model,

  materials: {
    hide: { base: '#2f2723', layers: [region('#3d332d', all(bone('body', 'neck'), face('top'))), mottle(0.1, { scale: 3 }), fur(0.12)] },
    // Long, hanging hair in uneven strands.
    skirt: { base: '#241e1b', layers: [region('#3a302a', ({ i, j }) => (i * 7 + Math.floor(j / 3)) % 4 === 0), fur(0.14)] },
    face: { base: '#2f2723', layers: [fur(0.1)] },
    muzzle: { base: '#5e5046', layers: [fur(0.06)] },
    ear: '#2f2723',
    tail: { base: '#241e1b', layers: [fur(0.15)] },
    horn: { base: '#d8cdb8', layers: [region('#3a342e', ({ p }) => p[1] > 24.5)] },
    hoof: '#1a1614',
    saddle: { base: '#6b3e1f', layers: [fur(0.05)] },
    // A woven Tibetan saddle blanket.
    blanket: { base: '#a8262b', layers: [region('#e0b23a', ({ p }) => Math.floor(p[1]) % 3 === 0), region('#1f5a8a', ({ p }) => Math.floor(p[2]) % 3 === 0), fur(0.04)] },
    chest: { base: '#8f6a35', layers: [region('#4e3a1c', ({ i, j, fw, fh }) => i === 0 || j === 0 || i === fw - 1 || j === fh - 1), region('#b9b9b9', ({ face: f, i, j, fw }) => f !== 'top' && f !== 'bottom' && j === 2 && i === Math.floor(fw / 2))] },
  },

  anims: quadruped({ neck: 'neck', tail: ['tail'], ears: ['ear_l', 'ear_r'], swing: 22, sleepDrop: 6, legFold: 75, walkLength: 1.3, runLength: 0.6 }),
};
