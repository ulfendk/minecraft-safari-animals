import { extras, quadruped } from '../lib/anim.mjs';
import { caprid, hornArc, sideArc } from '../lib/bodies.mjs';
import { all, bone, face, LEGS } from '../lib/parts.mjs';
import { fur, gradient, mottle, region, underside } from '../lib/texture.mjs';

// Massive horns that curl back, down and forward again around the ear.
const model = caprid({
  bodyW: 8, bodyH: 7, bodyL: 14, legH: 10, legW: 2, neckW: 4, neckH: 10, headW: 5, headH: 5, headD: 6, muzzleD: 2,
  horns: ({ top, back, side }) => hornArc(
    sideArc({ x: side + 1, centre: [top - 2.5, back - 1.5], radius: 3, from: -25, to: 300, steps: 14, spread: 1, shrink: 0.3 }),
    { size: [3, 3, 3, 3, 2] },
  ),
});

export default {
  id: 'bighorn_sheep',
  name: 'Bighorn Sheep',
  role: 'prey',
  family: ['caprine', 'grazer'],
  size: [0.9, 1.3],
  health: 16,
  speed: 0.27,
  xp: 3,
  knockbackResistance: 0.3,
  // Rams butt back when they are hurt.
  attack: { damage: 5, speed: 1.6, cooldown: 1.5 },
  fallImmune: true,
  breed: ['wheat'],
  tempt: ['wheat'],
  grazes: true,
  sleeps: 'night',
  spawn: [
    { biomes: ['mountain'], weight: 6, group: [2, 5] },
    { biomes: ['mesa'], weight: 2, group: [2, 3] },
  ],
  loot: [
    { item: 'safari:raw_game_meat', min: 1, max: 2, smelts: true },
    { item: 'leather', min: 0, max: 1 },
  ],
  sounds: { ambient: 'mob.goat.ambient', hurt: 'mob.goat.hurt', death: 'mob.goat.death', pitch: [0.75, 0.85] },
  egg: ['#7a5a3c', '#ece2cc'],

  model,

  materials: {
    hide: {
      base: '#7a5a3c',
      layers: [
        // The pale rump patch and belly, and pale backs of the legs.
        region('#ece2cc', all(bone('body'), ({ p, face: f }) => f === 'back' || (p[2] > 5 && p[1] < 15 && f !== 'top'))),
        underside('#e6dac2', { y: 10, soft: 1, where: bone('body') }),
        region('#e6dac2', all(bone(...LEGS), face('back'))),
        gradient('#5a4029', { axis: 1, from: 6, to: 1, where: all(bone(...LEGS), face('front', 'left', 'right')) }),
        mottle(0.07),
        fur(0.06),
      ],
    },
    face: { base: '#6e5035', layers: [region('#8a6a4a', face('top')), fur(0.05)] },
    muzzle: { base: '#e2d6bf', layers: [fur(0.04)] },
    ear: '#6e5035',
    tail: '#3a2a1e',
    // Growth rings across the horn.
    horn: { base: '#b39a72', layers: [region('#8e7652', ({ p }) => Math.floor(p[1] + p[2]) % 3 === 0), mottle(0.06)] },
    hoof: '#2a2420',
  },

  anims: {
    ...quadruped({ neck: 'neck', tail: ['tail'], ears: ['ear_l', 'ear_r'], swing: 30, sleepDrop: 6, legFold: 80, walkLength: 0.9, runLength: 0.4 }),
    clash: extras.clash(model.rear),
  },
};
