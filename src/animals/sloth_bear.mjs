import { extras, quadruped } from '../lib/anim.mjs';
import { ursid } from '../lib/bodies.mjs';
import { all, bone, face } from '../lib/parts.mjs';
import { fur, mottle, region } from '../lib/texture.mjs';

const WHITE = '#e8e0cc';
// The white V on the chest, in model space: it opens upwards from just above the belly.
const chestV = ({ p }) => p[1] > 6 && Math.abs(Math.abs(p[0]) - (p[1] - 6.5) * 0.7) < 0.75;
const model = ursid({ bodyW: 10, bodyH: 9, bodyL: 16, legH: 7, legW: 4, headW: 6, headH: 6, headD: 5, muzzleW: 4, muzzleH: 3, muzzleD: 4, shag: 2 });

export default {
  id: 'sloth_bear',
  name: 'Sloth Bear',
  role: 'neutral',
  family: ['bear'],
  size: [1.0, 1.0],
  health: 30,
  speed: 0.24,
  xp: 4,
  knockbackResistance: 0.4,
  attack: { damage: 7, speed: 1.3 },
  // Short-tempered: it rears up when you come close and attacks if you get right up to it.
  hostile: { range: 3 },
  sleeps: 'day',
  breed: ['honeycomb', 'sweet_berries'],
  tempt: ['honeycomb', 'honey_bottle', 'sweet_berries', 'apple'],
  heal: [['honeycomb', 4], ['honey_bottle', 6], ['sweet_berries', 2], ['apple', 4]],
  spawn: [{ biomes: ['savanna'], weight: 1, group: [1, 2], blocks: ['grass_block', 'coarse_dirt'] }],
  loot: [{ item: 'leather', min: 0, max: 2 }],
  sounds: { ambient: 'mob.polarbear.idle', hurt: 'mob.polarbear.hurt', death: 'mob.polarbear.death', pitch: [0.85, 0.95], interval: 18 },
  egg: ['#1c1918', '#e8e0cc'],

  model,

  materials: {
    fur: { base: '#1c1918', layers: [region(WHITE, all(bone('body'), face('front'), chestV)), mottle(0.08, { scale: 3 }), fur(0.12)] },
    // A long shaggy ruff with a white V on the chest.
    shag: {
      base: '#181514',
      layers: [
        region(WHITE, all(face('front'), chestV)),
        fur(0.16),
      ],
    },
    muzzle: { base: '#cfc6b4', layers: [region('#8f877a', face('front')), fur(0.05)] },
    ear: '#141211',
    paw: '#141211',
    claw: '#f0ebe0',
    jaw: { base: '#cfc6b4', layers: [region('#8a3a36', face('top'))] },
    fang: '#efe8d8',
  },

  anims: {
    ...quadruped({ tail: ['tail'], ears: ['ear_l', 'ear_r'], swing: 28, sleepDrop: 5, legFold: 75, walkLength: 1.0, runLength: 0.5 }),
    rear: extras.rear(model.rear),
  },
};
