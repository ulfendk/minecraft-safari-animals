import { quadruped } from '../lib/anim.mjs';
import { felid } from '../lib/bodies.mjs';
import { all, bone, LEGS, notFace } from '../lib/parts.mjs';
import { fur, mottle, rosettePixels, spots, underside } from '../lib/texture.mjs';

export default {
  id: 'snow_leopard',
  name: 'Snow Leopard',
  role: 'predator',
  family: ['big_cat', 'feline'],
  size: [0.9, 0.9],
  scale: 1.05,
  health: 22,
  speed: 0.3,
  xp: 4,
  // Stalks the wild sheep and goats on the steep slopes and leaps on them from above.
  attack: { damage: 5, speed: 1.6, leap: true },
  hunts: ['caprine'],
  huntInterval: 40,
  sleeps: 'day',
  fallImmune: true,
  breed: ['mutton', 'safari:raw_game_meat'],
  tempt: ['mutton', 'safari:raw_game_meat'],
  heal: [['mutton', 3], ['safari:raw_game_meat', 4]],
  spawn: [
    { biomes: ['peaks'], weight: 1, group: [1, 1] },
    { biomes: ['mountain'], weight: 1, group: [1, 1] },
  ],
  loot: [{ item: 'leather', min: 0, max: 1 }],
  sounds: { ambient: 'mob.cat.hiss', hurt: 'mob.cat.hit', death: 'mob.ocelot.death', pitch: [0.6, 0.7], interval: 30 },
  egg: ['#d6d3c8', '#3a3836'],

  // Thick fur, small rounded ears and a very long, thick tail it wraps around itself for warmth.
  model: felid({ bodyW: 6, bodyH: 7, bodyL: 16, legH: 8, legW: 3, headW: 6, headH: 5, headD: 5, tailL: 18, earH: 1, eyeColor: '#9fb3a8' }),

  materials: {
    fur: {
      base: '#d6d3c8',
      layers: [
        underside('#f1efe8', { y: 10, soft: 2, where: bone('body') }),
        rosettePixels('#3a3836', { centre: '#c4bfb1', cell: 5, gaps: 0.35, where: all(bone('body', 'tail'), notFace('bottom')) }),
        spots('#3a3836', { size: 2, radius: 0.3, where: bone('head', ...LEGS) }),
        mottle(0.05),
        fur(0.08),
      ],
    },
    muzzle: { base: '#eeece6', layers: [fur(0.04)] },
    ear: '#8a8780',
    tail: { base: '#d6d3c8', layers: [spots('#3a3836', { size: 3, radius: 0.4 }), fur(0.08)] },
    paw: '#e8e5dc',
  },

  anims: quadruped({ tail: ['tail', 'tail2'], ears: ['ear_l', 'ear_r'], swing: 30, sleepDrop: 6, legFold: 80, walkLength: 0.9, runLength: 0.4 }),
};
