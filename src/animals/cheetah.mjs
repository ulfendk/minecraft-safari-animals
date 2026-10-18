import { quadruped } from '../lib/anim.mjs';
import { felid } from '../lib/bodies.mjs';
import { all, bone, face, LEGS, notFace } from '../lib/parts.mjs';
import { fur, mottle, region, spots, underside } from '../lib/texture.mjs';

export default {
  id: 'cheetah',
  name: 'Cheetah',
  role: 'predator',
  family: ['big_cat', 'feline'],
  size: [0.8, 1.1],
  health: 18,
  speed: 0.32,
  xp: 4,
  // Short, very fast sprints.
  attack: { damage: 4, speed: 2.1, leap: true, cooldown: 1.2 },
  hunts: ['gazelle', 'warthog', 'rabbit'],
  huntInterval: 30,
  huntRange: 20,
  fleesFrom: ['lion', 'hyena', 'leopard'],
  sleeps: 'night',
  breed: ['rabbit', 'safari:raw_game_meat'],
  tempt: ['rabbit', 'safari:raw_game_meat'],
  heal: [['rabbit', 3], ['safari:raw_game_meat', 4]],
  spawn: [{ biomes: ['savanna'], weight: 2, group: [1, 2], blocks: ['grass_block'] }],
  loot: [{ item: 'leather', min: 0, max: 1 }],
  sounds: { ambient: 'mob.cat.straymeow', hurt: 'mob.cat.hit', death: 'mob.ocelot.death', pitch: [1.2, 1.4], interval: 20 },
  egg: ['#dcae62', '#1f1612'],
  client: { runSpeed: 6 },

  model: felid({ bodyW: 6, bodyH: 6, bodyL: 16, legH: 13, legW: 2, headW: 6, headH: 5, headD: 4, muzzleW: 4, tailL: 14, eyeColor: '#c8902a' }),

  materials: {
    fur: {
      base: '#dcae62',
      layers: [
        underside('#f4ead6', { y: 14, soft: 2, where: bone('body') }),
        spots('#1f1612', { size: 2, radius: 0.34, where: all(bone('body', 'head', ...LEGS), notFace('bottom')) }),
        // "Tear lines" from the eyes down to the mouth.
        region('#1f1612', all(bone('head'), face('front'), ({ i, fw, j }) => j >= 1 && (i === 1 || i === fw - 2))),
        mottle(0.05),
        fur(0.05),
      ],
    },
    muzzle: { base: '#f4ead6', layers: [region('#1f1612', ({ face: f, i, fw }) => f === 'front' && (i === 0 || i === fw - 1)), fur(0.04)] },
    ear: '#b38a4c',
    tail: {
      base: '#dcae62',
      layers: [spots('#1f1612', { size: 2, radius: 0.35 }), region('#1f1612', ({ p }) => Math.floor(p[1]) % 3 === 0 && p[1] < 6)],
    },
    paw: '#e8d4ad',
  },

  anims: quadruped({ tail: ['tail', 'tail2'], ears: ['ear_l', 'ear_r'], swing: 34, sleepDrop: 10, legFold: 85, walkLength: 0.9, runLength: 0.3 }),
};
