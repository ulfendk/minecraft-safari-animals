import { extras, quadruped } from '../lib/anim.mjs';
import { felid } from '../lib/bodies.mjs';
import { all, bone, face, LEGS, notFace } from '../lib/parts.mjs';
import { fur, mottle, region, stripes, underside } from '../lib/texture.mjs';

const BLACK = '#1d1410';

export default {
  id: 'tiger',
  name: 'Tiger',
  role: 'predator',
  family: ['big_cat', 'feline'],
  size: [1.3, 1.3],
  health: 32,
  speed: 0.27,
  xp: 5,
  attack: { damage: 7, speed: 1.5, leap: true },
  hunts: ['pig', 'chicken', 'antelope', 'warthog', 'parrot'],
  huntInterval: 45,
  // Only dangerous to players after dark, and only up close.
  hostile: { range: 8, filters: [{ test: 'is_daytime', subject: 'self', value: false }] },
  sleeps: 'day',
  breed: ['beef', 'porkchop', 'safari:raw_game_meat'],
  tempt: ['beef', 'porkchop', 'safari:raw_game_meat'],
  heal: [['beef', 4], ['porkchop', 4], ['safari:raw_game_meat', 4]],
  climbs: true,
  spawn: [{ biomes: ['jungle'], weight: 2, group: [1, 1], blocks: ['grass_block', 'podzol'] }],
  loot: [{ item: 'leather', min: 0, max: 2 }],
  sounds: { ambient: 'mob.polarbear.warning', hurt: 'mob.polarbear.hurt', death: 'mob.polarbear.death', pitch: [0.7, 0.8], interval: 30 },
  egg: ['#e07a2a', '#1d1410'],

  model: felid({ bodyW: 8, bodyH: 9, bodyL: 20, legH: 11, legW: 3, headW: 8, headH: 7, headD: 7, tailL: 14, eyeColor: '#d6b33a' }),

  materials: {
    fur: {
      base: '#e07a2a',
      layers: [
        underside('#f3ead9', { y: 13, soft: 2, where: bone('body') }),
        stripes(BLACK, { axis: 2, period: 4, width: 0.3, warp: 2, warpScale: 4, where: all(bone('body'), notFace('bottom')) }),
        stripes(BLACK, { axis: 1, period: 3, width: 0.3, warp: 1, where: all(bone('tail', ...LEGS), notFace('bottom')) }),
        stripes(BLACK, { axis: 0, period: 3, width: 0.3, warp: 0.8, where: all(bone('head'), face('top', 'left', 'right')) }),
        region('#f3ead9', all(bone('head'), face('front'), ({ i, fw, j }) => j >= 3 && (i < 2 || i >= fw - 2))),
        mottle(0.05),
        fur(0.05),
      ],
    },
    muzzle: { base: '#f3ead9', layers: [fur(0.04)] },
    ear: { base: '#e07a2a', layers: [region('#f3ead9', ({ face: f }) => f === 'front'), region(BLACK, ({ face: f }) => f === 'back')] },
    tail: { base: '#e07a2a', layers: [stripes(BLACK, { axis: 1, period: 2.5, width: 0.4, warp: 0 })] },
    paw: '#d9cdb8',
  },

  anims: {
    ...quadruped({ tail: ['tail', 'tail2'], ears: ['ear_l', 'ear_r'], swing: 28, sleepDrop: 8, legFold: 80, walkLength: 1.1, runLength: 0.45 }),
    roar: extras.roar({ head: 'head' }),
  },
};
