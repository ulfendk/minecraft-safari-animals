import { extras, quadruped } from '../lib/anim.mjs';
import { felid } from '../lib/bodies.mjs';
import { bone, face, LEGS } from '../lib/parts.mjs';
import { fur, gradient, mottle, underside } from '../lib/texture.mjs';

export default {
  id: 'lion',
  name: 'Lion',
  role: 'predator',
  family: ['big_cat', 'feline'],
  size: [1.2, 1.3],
  health: 30,
  speed: 0.27,
  xp: 5,
  attack: { damage: 6, speed: 1.5, leap: true },
  alertsPack: true,
  hunts: ['zebra', 'antelope', 'warthog'],
  huntInterval: 40,
  sleeps: 'day',
  breed: ['beef', 'safari:raw_game_meat'],
  tempt: ['beef', 'safari:raw_game_meat'],
  heal: [['beef', 4], ['safari:raw_game_meat', 4]],
  // Variant 0 is a male with a mane, variant 1 a lioness.
  variants: [{ weight: 1 }, { weight: 2 }],
  spawn: [{ biomes: ['savanna'], weight: 2, group: [2, 4], blocks: ['grass_block'], herdEvent: { event: 'safari:make_variant_1', skip: 1 } }],
  loot: [{ item: 'leather', min: 0, max: 2 }],
  sounds: { ambient: 'mob.polarbear.warning', hurt: 'mob.polarbear.hurt', death: 'mob.polarbear.death', pitch: [0.6, 0.7], interval: 25 },
  egg: ['#c99a55', '#6b3f1d'],
  client: { visibility: { mane: 'query.variant == 0 && !query.is_baby' } },

  model: felid({ bodyW: 8, bodyH: 8, bodyL: 18, legH: 11, legW: 3, headW: 8, headH: 7, headD: 6, tailL: 12, tuft: true, mane: true }),

  materials: {
    fur: {
      base: '#c99a55',
      layers: [
        underside('#e8cf9e', { y: 12, soft: 2, where: bone('body') }),
        gradient('#e2c08a', { axis: 1, from: 8, to: 2, where: bone(...LEGS) }),
        mottle(0.06),
        fur(0.05),
      ],
    },
    muzzle: { base: '#efdcb8', layers: [fur(0.04)] },
    ear: { base: '#c99a55', layers: [gradient('#3a2516', { axis: 2, from: -12, to: -11, where: face('back') })] },
    tail: { base: '#c99a55', layers: [fur(0.05)] },
    tuft: { base: '#3e2614', layers: [fur(0.1)] },
    mane: { base: '#7a4a22', layers: [mottle(0.15, { scale: 3 }), fur(0.12)] },
    paw: '#b88a4a',
  },

  anims: {
    ...quadruped({ tail: ['tail', 'tail2'], ears: ['ear_l', 'ear_r'], swing: 28, sleepDrop: 8, legFold: 80, walkLength: 1.1, runLength: 0.45 }),
    roar: extras.roar({ head: 'head' }),
  },
};
