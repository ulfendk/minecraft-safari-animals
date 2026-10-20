import { extras, quadruped } from '../lib/anim.mjs';
import { felid } from '../lib/bodies.mjs';
import { all, bone, face, LEGS } from '../lib/parts.mjs';
import { fur, gradient, mottle, region, underside } from '../lib/texture.mjs';

export default {
  id: 'lion',
  name: 'Lion',
  role: 'predator',
  family: ['big_cat', 'feline'],
  size: [1.2, 1.3],
  scale: 1.25,
  health: 34,
  speed: 0.28,
  xp: 6,
  knockbackResistance: 0.3,
  attack: { damage: 7, speed: 1.6, leap: true },
  alertsPack: true,
  hunts: ['zebra', 'antelope', 'warthog', 'giraffe'],
  huntInterval: 25,
  huntRange: 20,
  // Adults attack players who come close (they roar a warning first, see scripts).
  hostile: { range: 7, filters: [{ test: 'is_baby', subject: 'self', value: false }] },
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
  client: { visibility: { mane: 'query.variant == 0 && !query.is_baby' }, idle: ['idle', 'snarl'] },
  // Realistic Hunting: lionesses (variant 1) have no mane.
  hunt: { maleBones: ['mane'] },

  model: felid({
    bodyW: 10, bodyH: 9, bodyL: 20, legH: 11, legW: 4, headW: 8, headH: 7, headD: 6, muzzleW: 4, muzzleH: 4, muzzleD: 3,
    tailL: 13, tuft: true, mane: 'full', hump: 1, jaw: true, jawOpen: 18, eyeColor: '#e0a020',
  }),

  materials: {
    fur: {
      base: '#c49452',
      layers: [
        // An old scar across the face.
        region('#8a5a35', all(bone('head'), face('front'), ({ i, j }) => i === j + 1 && i >= 5 && i <= 7)),
        underside('#e8cf9e', { y: 12, soft: 2, where: bone('body') }),
        gradient('#e2c08a', { axis: 1, from: 8, to: 2, where: bone(...LEGS) }),
        mottle(0.06),
        fur(0.05),
      ],
    },
    muzzle: { base: '#dcc08e', layers: [region('#efe0c0', face('bottom', 'left', 'right')), fur(0.05)] },
    ear: { base: '#c99a55', layers: [gradient('#3a2516', { axis: 2, from: -12, to: -11, where: face('back') })] },
    tail: { base: '#c99a55', layers: [fur(0.05)] },
    tuft: { base: '#3e2614', layers: [fur(0.1)] },
    mane: { base: '#5a3418', layers: [gradient('#2a170b', { axis: 1, from: 22, to: 8 }), mottle(0.18, { scale: 2.5 }), fur(0.14)] },
    jaw: { base: '#c49452', layers: [region('#a8443c', face('top'))] },
    fang: '#f4efe2',
    paw: '#b88a4a',
  },

  anims: {
    ...quadruped({ tail: ['tail', 'tail2'], ears: ['ear_l', 'ear_r'], swing: 28, sleepDrop: 8, legFold: 80, walkLength: 1.1, runLength: 0.45 }),
    roar: extras.roar({ head: 'head', jaw: 'jaw' }),
    // Low prowl with a twitching tail and a snarl.
    snarl: { loop: true, animation_length: 2, bones: {
      jaw: { rotation: { '0.00': [0, 0, 0], '1.00': [8, 0, 0], '2.00': [0, 0, 0] } },
      tail2: { rotation: { '0.00': [0, 0, 0], '0.50': [0, 25, 0], '1.00': [0, -15, 0], '1.50': [0, 20, 0], '2.00': [0, 0, 0] } },
    } },
  },
};
