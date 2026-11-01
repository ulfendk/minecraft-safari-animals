import { quadruped } from '../lib/anim.mjs';
import { caprid, hornArc } from '../lib/bodies.mjs';
import { all, bone, face, LEGS } from '../lib/parts.mjs';
import { fur, mottle, region } from '../lib/texture.mjs';

// The wild ancestor of cattle: a long-legged, deep-chested black bull with a pale stripe down
// the spine, a pale muzzle and great pale horns that sweep out, forward and up.
const model = caprid({
  bodyW: 11, bodyH: 11, bodyL: 22, legH: 12, legW: 4, neckW: 7, neckH: 6, headW: 6, headH: 6, headD: 7, muzzleD: 2,
  hump: 2, tail: 9, earL: 2,
  horns: ({ top, back, side }) => hornArc(
    [[side + 0.5, top - 1, back - 2.5], [side + 2, top - 0.5, back - 3], [side + 3.5, top + 0.5, back - 4], [side + 4.5, top + 2, back - 5.5], [side + 4.5, top + 3.5, back - 7], [side + 4, top + 4.5, back - 8]],
    { size: [2, 2, 2, 2, 1, 1] },
  ),
});

export default {
  id: 'aurochs',
  name: 'Aurochs',
  role: 'megafauna',
  family: ['bovine', 'grazer'],
  size: [1.5, 1.9],
  scale: 1.6,
  health: 42,
  speed: 0.24,
  xp: 6,
  knockbackResistance: 0.8,
  // Fierce and fearless: charges anyone who comes near, and the herd joins in.
  attack: { damage: 9, speed: 1.7, cooldown: 1.5 },
  hostile: { range: 8, filters: [{ test: 'is_baby', subject: 'self', value: false }] },
  alertsPack: true,
  breed: ['wheat'],
  tempt: ['wheat', 'hay_block'],
  heal: [['wheat', 2], ['hay_block', 20]],
  grazes: true,
  sleeps: 'night',
  spawn: [
    { biomes: ['forest'], weight: 2, group: [2, 4], blocks: ['grass_block'] },
    { biomes: ['plains'], weight: 1, group: [2, 4], blocks: ['grass_block'] },
  ],
  loot: [
    { item: 'leather', min: 1, max: 3 },
    { item: 'beef', min: 2, max: 4, smelts: true },
  ],
  sounds: { ambient: 'mob.cow.say', hurt: 'mob.cow.hurt', death: 'mob.cow.hurt', pitch: [0.5, 0.6], interval: 16 },
  egg: ['#1e1714', '#c9b48a'],
  client: { runSpeed: 4 },

  model,

  materials: {
    // Black with a pale eel stripe along the spine.
    hide: { base: '#211915', layers: [region('#b59a6a', all(bone('body'), face('top'), ({ p }) => Math.abs(p[0]) < 1.5)), mottle(0.08, { scale: 4 }), fur(0.06)] },
    face: { base: '#211915', layers: [region('#3a2c22', face('top')), fur(0.06)] },
    muzzle: { base: '#d6ccbb', layers: [fur(0.04)] },
    ear: '#211915',
    tail: { base: '#211915', layers: [region('#120e0c', ({ p }) => p[1] < 17)] },
    horn: { base: '#ddd1b6', layers: [region('#2a2420', ({ p }) => p[1] > 29)] },
    hoof: '#16120f',
  },

  anims: quadruped({ neck: 'neck', tail: ['tail'], ears: ['ear_l', 'ear_r'], swing: 26, sleepDrop: 6, legFold: 75, walkLength: 1.1, runLength: 0.5 }),
};
