import { extras, quadruped } from '../lib/anim.mjs';
import { ursid } from '../lib/bodies.mjs';
import { all, bone, face } from '../lib/parts.mjs';
import { fur, mottle, region } from '../lib/texture.mjs';

const GOLD = '#e9a63c';
const model = ursid({ bodyW: 8, bodyH: 7, bodyL: 12, legH: 6, legW: 3, headW: 6, headH: 5, headD: 5, muzzleW: 4, muzzleH: 3, muzzleD: 2, earSize: 1, eyeColor: '#6b4526' });

export default {
  id: 'sun_bear',
  name: 'Sun Bear',
  role: 'neutral',
  family: ['bear'],
  size: [0.8, 0.8],
  health: 22,
  speed: 0.25,
  xp: 3,
  attack: { damage: 5, speed: 1.5 },
  climbs: true,
  fallImmune: true,
  sleeps: 'day',
  breed: ['honeycomb', 'sweet_berries'],
  tempt: ['honeycomb', 'honey_bottle', 'sweet_berries', 'glow_berries', 'melon_slice'],
  heal: [['honeycomb', 4], ['honey_bottle', 6], ['sweet_berries', 2], ['melon_slice', 3]],
  spawn: [{ biomes: ['jungle'], weight: 2, group: [1, 2], blocks: ['grass_block', 'podzol'] }],
  loot: [{ item: 'leather', min: 0, max: 1 }],
  sounds: { ambient: 'mob.polarbear.idle', hurt: 'mob.polarbear.hurt', death: 'mob.polarbear.death', pitch: [1.2, 1.35], interval: 20 },
  egg: ['#1b1817', '#e9a63c'],

  model,

  materials: {
    fur: {
      base: '#1b1817',
      layers: [
        // The golden "rising sun" on the chest: a U-shaped bib below the neck.
        region(GOLD, all(bone('body'), face('front'), ({ i, j, fw, fh }) =>
          (j === fh - 1 && i >= 1 && i <= fw - 2) || (j >= fh - 5 && (i === 1 || i === fw - 2)))),
        mottle(0.06, { scale: 2 }),
        fur(0.06),
      ],
    },
    muzzle: { base: '#c9a57a', layers: [fur(0.05)] },
    ear: '#151312',
    paw: '#121010',
    claw: '#cfc3a8',
    jaw: { base: '#c9a57a', layers: [region('#8a3a36', face('top'))] },
    fang: '#efe8d8',
  },

  anims: {
    ...quadruped({ tail: ['tail'], ears: ['ear_l', 'ear_r'], swing: 30, sleepDrop: 4, legFold: 75, walkLength: 0.8, runLength: 0.4 }),
    rear: extras.rear(model.rear),
  },
};
