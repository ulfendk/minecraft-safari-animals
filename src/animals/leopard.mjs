import { quadruped } from '../lib/anim.mjs';
import { felid } from '../lib/bodies.mjs';
import { all, bone, LEGS, notFace } from '../lib/parts.mjs';
import { fur, mottle, rosettes, spots, underside } from '../lib/texture.mjs';

export default {
  id: 'leopard',
  name: 'Leopard',
  role: 'predator',
  family: ['big_cat', 'feline'],
  size: [0.9, 0.9],
  health: 22,
  speed: 0.3,
  xp: 4,
  attack: { damage: 5, speed: 1.6, leap: true },
  hunts: ['antelope', 'warthog', 'monkey', 'meerkat'],
  huntInterval: 35,
  sleeps: 'day',
  climbs: true,
  fallImmune: true,
  breed: ['chicken', 'safari:raw_game_meat'],
  tempt: ['chicken', 'safari:raw_game_meat'],
  heal: [['chicken', 3], ['safari:raw_game_meat', 4]],
  spawn: [
    { biomes: ['savanna'], weight: 1, group: [1, 1], blocks: ['grass_block'] },
    { biomes: ['jungle'], weight: 1, group: [1, 1], blocks: ['grass_block', 'podzol'] },
  ],
  loot: [{ item: 'leather', min: 0, max: 1 }],
  sounds: { ambient: 'mob.cat.hiss', hurt: 'mob.cat.hit', death: 'mob.ocelot.death', pitch: [0.5, 0.6], interval: 30 },
  egg: ['#d9a95a', '#2a1c12'],

  model: felid({ bodyW: 6, bodyH: 7, bodyL: 16, legH: 9, legW: 2, headW: 6, headH: 5, headD: 5, tailL: 14, eyeColor: '#a7c45a' }),

  materials: {
    fur: {
      base: '#d9a95a',
      layers: [
        underside('#f2e6cc', { y: 10, soft: 2, where: bone('body') }),
        rosettes('#2a1c12', { size: 3.4, inner: 0.24, outer: 0.4, centre: '#c08a40', where: all(bone('body'), notFace('bottom')) }),
        spots('#2a1c12', { size: 2, radius: 0.32, where: bone('head', ...LEGS) }),
        mottle(0.05),
        fur(0.05),
      ],
    },
    muzzle: { base: '#f2e6cc', layers: [fur(0.04)] },
    ear: '#a87a3e',
    tail: { base: '#d9a95a', layers: [spots('#2a1c12', { size: 2, radius: 0.35 })] },
    paw: '#e6cfa3',
  },

  anims: quadruped({ tail: ['tail', 'tail2'], ears: ['ear_l', 'ear_r'], swing: 30, sleepDrop: 6, legFold: 80, walkLength: 0.9, runLength: 0.4 }),
};
