import { primate, quadruped } from '../lib/anim.mjs';
import { ape } from '../lib/bodies.mjs';
import { fur, mottle } from '../lib/texture.mjs';

export default {
  id: 'chimpanzee',
  name: 'Chimpanzee',
  role: 'neutral',
  family: ['primate', 'ape'],
  size: [0.8, 1.1],
  health: 20,
  speed: 0.27,
  xp: 3,
  attack: { damage: 4, speed: 1.4 },
  alertsPack: true,
  climbs: true,
  fallImmune: true,
  breed: ['sweet_berries', 'glow_berries', 'apple'],
  tempt: ['sweet_berries', 'glow_berries', 'apple', 'melon_slice'],
  heal: [['apple', 4], ['sweet_berries', 2]],
  sleeps: 'night',
  spawn: [{ biomes: ['jungle'], weight: 4, group: [3, 6], blocks: ['grass_block', 'podzol'] }],
  loot: [],
  sounds: { ambient: 'mob.panda.idle', hurt: 'mob.fox.hurt', death: 'mob.panda.death', pitch: [1.3, 1.5], interval: 12 },
  egg: ['#2a221e', '#c9a48a'],
  // Realistic Hunting: the heart sits high in the upright chest, above the long arms.
  hunt: { torso: { heart: [[0.15, 0.45], [0.62, 0.86], 0.4], lungs: [[0.05, 0.6], [0.45, 0.95], 0.75] } },

  model: ape({ chestW: 8, chestH: 9, chestD: 5, hipW: 6, hipH: 6, hipD: 5, armW: 3, armH: 12, legW: 3, legH: 8, headW: 6, headH: 6, headD: 5, ears: true, faceColor: '#c9a48a' }),

  materials: {
    fur: { base: '#2a221e', layers: [mottle(0.08, { scale: 3 }), fur(0.08)] },
    brow: '#b8927a',
    face: '#c9a48a',
    hand: '#5a4438',
  },

  anims: {
    ...quadruped({ swing: 28, sleepDrop: 5, legFold: 70, walkLength: 0.9, runLength: 0.45 }),
    ...primate({ armL: 'leg_fl', armR: 'leg_fr' }),
  },
};
