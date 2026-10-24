import { extras, quadruped } from '../lib/anim.mjs';
import { ursid } from '../lib/bodies.mjs';
import { all, bone, face } from '../lib/parts.mjs';
import { fur, mottle, region } from '../lib/texture.mjs';

const CREAM = '#e3cf9c';
const model = ursid({ bodyW: 10, bodyH: 9, bodyL: 16, legH: 7, legW: 4, headW: 8, headH: 6, headD: 6, muzzleW: 4, muzzleH: 3, muzzleD: 3 });
const neckBottom = 15 - 6 - 1; // body top - head height - 1: the chest shows below the neck

export default {
  id: 'spectacled_bear',
  name: 'Spectacled Bear',
  role: 'neutral',
  family: ['bear'],
  size: [1.0, 1.0],
  health: 30,
  speed: 0.24,
  xp: 4,
  knockbackResistance: 0.4,
  attack: { damage: 6, speed: 1.3 },
  climbs: true,
  fallImmune: true,
  sleeps: 'night',
  breed: ['sweet_berries', 'apple', 'melon_slice'],
  tempt: ['sweet_berries', 'glow_berries', 'apple', 'melon_slice', 'honeycomb'],
  heal: [['sweet_berries', 2], ['apple', 4], ['melon_slice', 3], ['honeycomb', 4]],
  spawn: [{ biomes: ['jungle'], weight: 2, group: [1, 2], blocks: ['grass_block', 'podzol'] }],
  loot: [{ item: 'leather', min: 0, max: 2 }],
  sounds: { ambient: 'mob.polarbear.idle', hurt: 'mob.polarbear.hurt', death: 'mob.polarbear.death', pitch: [0.9, 1.0], interval: 24 },
  egg: ['#211c1a', '#e3cf9c'],

  model,

  materials: {
    fur: {
      base: '#211c1a',
      layers: [
        // The cream "spectacles" around the eyes, and the cream bib on the throat and chest.
        region(CREAM, all(bone('head'), face('front'), ({ i, j, fw }) => j <= 2 && (i <= 2 || i >= fw - 3) && !(j === 0 && (i === 0 || i === fw - 1)))),
        region(CREAM, all(bone('head'), face('bottom'), ({ j, fh }) => j <= 1 || j >= fh - 2)),
        region(CREAM, all(bone('body'), face('front'), ({ i, p, fw }) => p[1] < neckBottom && Math.abs(i - (fw - 1) / 2) < 3 - (neckBottom - p[1]) * 0.4)),
        mottle(0.08, { scale: 3 }),
        fur(0.08),
      ],
    },
    muzzle: { base: CREAM, layers: [fur(0.05)] },
    ear: '#191514',
    paw: '#141110',
    claw: '#a89c84',
    jaw: { base: CREAM, layers: [region('#8a3a36', face('top'))] },
    fang: '#efe8d8',
  },

  anims: {
    ...quadruped({ tail: ['tail'], ears: ['ear_l', 'ear_r'], swing: 26, sleepDrop: 5, legFold: 75, walkLength: 1.1, runLength: 0.5 }),
    rear: extras.rear(model.rear),
  },
};
