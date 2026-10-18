import { primate, quadruped } from '../lib/anim.mjs';
import { ape } from '../lib/bodies.mjs';
import { all, bone, face } from '../lib/parts.mjs';
import { fur, mottle, region } from '../lib/texture.mjs';

export default {
  id: 'gorilla',
  name: 'Gorilla',
  role: 'megafauna',
  family: ['primate', 'ape'],
  size: [1.3, 1.7],
  health: 45,
  speed: 0.22,
  xp: 6,
  knockbackResistance: 0.6,
  attack: { damage: 9, speed: 1.3 },
  alertsPack: true,
  breed: ['melon_slice', 'bamboo'],
  tempt: ['melon_slice', 'bamboo', 'apple'],
  heal: [['melon_slice', 3], ['apple', 4], ['bamboo', 2]],
  sleeps: 'night',
  strollRange: 8,
  spawn: [{ biomes: ['jungle'], weight: 2, group: [2, 4], blocks: ['grass_block', 'podzol'] }],
  loot: [],
  sounds: { ambient: 'mob.panda.idle', hurt: 'mob.panda.hurt', death: 'mob.panda.death', pitch: [0.5, 0.6], interval: 20 },
  egg: ['#2b2b2e', '#9a9aa0'],

  model: ape({ chestW: 12, chestH: 13, chestD: 7, hipW: 10, hipH: 9, hipD: 6, armW: 4, armH: 17, legW: 4, legH: 10, headW: 8, headH: 8, headD: 6, crest: true, faceColor: '#1c1b1d', eyeColor: '#8a5a2a', pupilColor: '#000000' }),

  materials: {
    // Adult males have a silver saddle across the back.
    fur: { base: '#2b2b2e', layers: [region('#8e8e94', all(bone('body'), face('top', 'back', 'left', 'right'), ({ p }) => p[2] > -3 && p[1] > 12)), mottle(0.1, { scale: 3 }), fur(0.08)] },
    brow: '#1c1b1d',
    face: '#1c1b1d',
    hand: '#1c1b1d',
  },

  anims: {
    ...quadruped({ swing: 22, sleepDrop: 6, legFold: 70, walkLength: 1.2, runLength: 0.6 }),
    ...primate({ armL: 'leg_fl', armR: 'leg_fr' }),
  },
};
