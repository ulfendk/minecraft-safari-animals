import { extras, quadruped } from '../lib/anim.mjs';
import { caprid, hornArc } from '../lib/bodies.mjs';
import { all, bone, face, LEGS } from '../lib/parts.mjs';
import { fur, gradient, mottle, region, underside } from '../lib/texture.mjs';

// Thin black horns that go straight up and hook back at the tip.
const model = caprid({
  bodyW: 6, bodyH: 6, bodyL: 12, legH: 10, legW: 2, neckW: 3, neckH: 9, headW: 4, headH: 4, headD: 5, muzzleD: 2,
  horns: ({ top, back }) => hornArc([[1, top + 0.5, back - 2.5], [1, top + 1.5, back - 2.5], [1, top + 2.5, back - 2.5], [1, top + 3.5, back - 2], [1, top + 3.5, back - 1], [1, top + 2.7, back - 0.5]], { size: 1 }),
});

export default {
  id: 'chamois',
  name: 'Chamois',
  role: 'prey',
  family: ['caprine', 'grazer'],
  size: [0.7, 1.1],
  health: 10,
  speed: 0.3,
  panicSpeed: 1.9,
  fleeSpeed: 2.0,
  // Shy: the herd bolts as soon as a person comes near (see scripts/behaviours.js).
  fleesFrom: ['player'],
  fleeDistance: 12,
  xp: 2,
  fallImmune: true,
  breed: ['wheat'],
  tempt: ['wheat'],
  grazes: true,
  sleeps: 'night',
  spawn: [
    { biomes: ['mountain'], weight: 5, group: [3, 6] },
    { biomes: ['peaks'], weight: 3, group: [2, 5] },
  ],
  loot: [
    { item: 'safari:raw_game_meat', min: 1, max: 1, smelts: true },
    { item: 'leather', min: 0, max: 1 },
  ],
  sounds: { ambient: 'mob.goat.ambient', hurt: 'mob.goat.hurt', death: 'mob.goat.death', pitch: [1.25, 1.4] },
  egg: ['#9a6a3e', '#1e1916'],
  client: { runSpeed: 5 },

  model,

  materials: {
    hide: {
      base: '#9a6a3e',
      layers: [
        // A dark stripe along the spine and dark legs on a fox-brown summer coat.
        region('#3a2a1e', all(bone('body', 'neck'), face('top'), ({ i, fw }) => Math.abs(i - (fw - 1) / 2) < 1)),
        underside('#d9c4a3', { y: 10, soft: 1, where: bone('body') }),
        gradient('#2a201a', { axis: 1, from: 10, to: 4, where: bone(...LEGS) }),
        mottle(0.07),
        fur(0.06),
      ],
    },
    // The white face with a black band from the horns through each eye to the muzzle.
    face: {
      base: '#efe8dc',
      layers: [
        region('#1e1916', all(face('left', 'right'), ({ p }) => p[1] < 21.5 && p[1] > 19.5)),
        region('#1e1916', all(face('front'), ({ i, fw }) => i === 0 || i === fw - 1)),
        fur(0.04),
      ],
    },
    muzzle: { base: '#e6dfd2', layers: [region('#1e1916', face('left', 'right')), fur(0.04)] },
    ear: { base: '#efe8dc', layers: [region('#1e1916', face('top'))] },
    tail: '#1e1916',
    horn: '#141210',
    hoof: '#1a1612',
  },

  anims: {
    ...quadruped({ neck: 'neck', tail: ['tail'], ears: ['ear_l', 'ear_r'], swing: 34, sleepDrop: 6, legFold: 85, walkLength: 0.8, runLength: 0.35 }),
    alert: extras.alert({ ears: ['ear_l', 'ear_r'] }),
  },
};
