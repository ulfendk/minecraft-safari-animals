import { quadruped } from '../lib/anim.mjs';
import { caprid, hornArc, sideArc } from '../lib/bodies.mjs';
import { all, bone, face, LEGS } from '../lib/parts.mjs';
import { fur, gradient, mottle, region, underside } from '../lib/texture.mjs';

// Long horns sweeping up and back in a wide arc, with knobbly ridges along the front.
const model = caprid({
  bodyW: 8, bodyH: 8, bodyL: 14, legH: 10, legW: 2, neckW: 4, neckH: 9, headW: 4, headH: 4, headD: 6, muzzleD: 2,
  beard: 2,
  horns: ({ top, back, side }) => hornArc(
    sideArc({ x: side - 1, centre: [top - 6, back + 1], radius: 7, from: -15, to: 80, steps: 11, spread: 1.5 }),
    { size: [2, 2, 2, 2, 2, 2, 2, 1] },
  ),
});

export default {
  id: 'alpine_ibex',
  name: 'Alpine Ibex',
  role: 'prey',
  family: ['caprine', 'grazer'],
  size: [0.9, 1.3],
  health: 16,
  speed: 0.27,
  panicSpeed: 1.7,
  fleeSpeed: 1.7,
  xp: 3,
  // Walks up near-vertical rock faces (and dam walls) as if they were flat ground.
  movement: 'climb',
  climbs: true,
  fallImmune: true,
  breed: ['wheat'],
  tempt: ['wheat'],
  grazes: true,
  sleeps: 'night',
  spawn: [
    { biomes: ['peaks'], weight: 4, group: [2, 4] },
    { biomes: ['mountain'], weight: 4, group: [2, 4] },
  ],
  loot: [
    { item: 'safari:raw_game_meat', min: 1, max: 2, smelts: true },
    { item: 'leather', min: 0, max: 1 },
  ],
  sounds: { ambient: 'mob.goat.ambient', hurt: 'mob.goat.hurt', death: 'mob.goat.death', pitch: [0.85, 0.95] },
  egg: ['#7d6e5c', '#4a3d30'],

  model,

  materials: {
    hide: {
      base: '#7d6e5c',
      layers: [
        // A darker brown chest, flanks stripe and legs on a grey-brown coat.
        region('#4a3d30', all(bone('body'), face('left', 'right'), ({ p }) => p[1] < 12 && p[1] > 10.5)),
        region('#4a3d30', all(bone('neck'), face('front', 'bottom'))),
        underside('#d8cdb8', { y: 10.5, soft: 1, where: bone('body') }),
        gradient('#3e332a', { axis: 1, from: 9, to: 3, where: bone(...LEGS) }),
        region('#d8cdb8', all(bone(...LEGS), face('back'), ({ p }) => p[1] > 5)),
        mottle(0.08),
        fur(0.06),
      ],
    },
    face: { base: '#6e604f', layers: [region('#857663', face('top')), fur(0.05)] },
    muzzle: { base: '#5a4d3f', layers: [fur(0.05)] },
    beard: { base: '#3a2f25', layers: [fur(0.1)] },
    ear: '#6e604f',
    tail: '#2e251d',
    horn: { base: '#5e5243', layers: [region('#857560', ({ p, face: f }) => (f === 'front' || f === 'top') && Math.floor(p[1] - p[2]) % 2 === 0), mottle(0.06)] },
    hoof: '#24201c',
  },

  anims: quadruped({ neck: 'neck', tail: ['tail'], ears: ['ear_l', 'ear_r'], swing: 30, sleepDrop: 6, legFold: 80, walkLength: 0.9, runLength: 0.4 }),
};
