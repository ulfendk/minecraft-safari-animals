import { quadruped } from '../lib/anim.mjs';
import { caprid, hornArc } from '../lib/bodies.mjs';
import { all, bone, face, LEGS } from '../lib/parts.mjs';
import { fur, mottle, region } from '../lib/texture.mjs';

// A shaggy coat that hangs nearly to the ground, and horns that meet in a heavy boss on the
// forehead, sweep down past the cheeks and hook up and forward at the tips.
const model = caprid({
  bodyW: 12, bodyH: 11, bodyL: 18, legH: 8, legW: 4, neckW: 7, neckH: 5, headW: 6, headH: 6, headD: 6, muzzleD: 2,
  hump: 3, skirt: 6, tail: 2,
  horns: ({ top, back, side }) => [
    { origin: [-side, top - 1, back - 4], size: [2 * side, 2, 3], mat: 'horn' },
    ...hornArc(
      [[side + 1, top - 1, back - 2.5], [side + 2, top - 2.5, back - 3], [side + 2.5, top - 4, back - 3.5], [side + 2.5, top - 5.5, back - 4.5], [side + 2.5, top - 5.5, back - 6], [side + 2.5, top - 4.5, back - 7]],
      { size: [2, 2, 2, 2, 1, 1] },
    ),
  ],
});

export default {
  id: 'musk_ox',
  name: 'Musk Ox',
  role: 'megafauna',
  family: ['musk_ox', 'grazer'],
  size: [1.3, 1.5],
  scale: 1.6,
  health: 36,
  speed: 0.21,
  xp: 5,
  knockbackResistance: 0.7,
  // Ill-tempered: charges anyone who comes close, and the whole herd joins in.
  attack: { damage: 7, speed: 1.5, cooldown: 1.5 },
  hostile: { range: 6, filters: [{ test: 'is_baby', subject: 'self', value: false }] },
  alertsPack: true,
  breed: ['wheat'],
  tempt: ['wheat', 'hay_block'],
  heal: [['wheat', 2], ['hay_block', 20]],
  grazes: true,
  sleeps: 'night',
  spawn: [
    { biomes: ['tundra'], weight: 4, group: [3, 6] },
    { biomes: ['peaks'], weight: 1, group: [2, 4] },
  ],
  loot: [
    { item: 'leather', min: 1, max: 3 },
    { item: 'safari:raw_game_meat', min: 2, max: 4, smelts: true },
  ],
  sounds: { ambient: 'mob.cow.say', hurt: 'mob.cow.hurt', death: 'mob.cow.hurt', pitch: [0.5, 0.6], interval: 18 },
  egg: ['#3b2e24', '#c9bda6'],
  client: { runSpeed: 4 },

  model,

  materials: {
    // A pale saddle patch on the back of a dark brown coat.
    hide: { base: '#3b2e24', layers: [region('#8a7a64', all(bone('body'), face('top'), ({ p }) => p[2] > -2 && p[2] < 6)), region('#d2c8b4', all(bone(...LEGS), ({ p }) => p[1] < 3)), mottle(0.1, { scale: 3 }), fur(0.12)] },
    skirt: { base: '#2e241c', layers: [region('#45372b', ({ i, j }) => (i * 5 + Math.floor(j / 3)) % 4 === 0), fur(0.15)] },
    face: { base: '#3b2e24', layers: [fur(0.1)] },
    muzzle: { base: '#5a4c3e', layers: [fur(0.06)] },
    ear: '#3b2e24',
    tail: '#2e241c',
    horn: { base: '#cfc4ad', layers: [region('#3a342e', ({ p }) => p[1] < 18.5)] },
    hoof: '#1a1614',
  },

  anims: quadruped({ neck: 'neck', tail: ['tail'], ears: ['ear_l', 'ear_r'], swing: 20, sleepDrop: 6, legFold: 75, walkLength: 1.3, runLength: 0.6 }),
};
