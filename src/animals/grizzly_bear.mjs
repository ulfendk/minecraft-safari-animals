import { extras, quadruped } from '../lib/anim.mjs';
import { ursid } from '../lib/bodies.mjs';
import { all, bone, face } from '../lib/parts.mjs';
import { fur, gradient, mottle, region, underside } from '../lib/texture.mjs';

const model = ursid({ bodyW: 12, bodyH: 11, bodyL: 20, legH: 9, legW: 5, headW: 8, headH: 7, headD: 7, muzzleW: 4, muzzleH: 4, muzzleD: 3, hump: 2 });

export default {
  id: 'grizzly_bear',
  name: 'Grizzly Bear',
  role: 'megafauna',
  family: ['bear'],
  size: [1.4, 1.4],
  scale: 1.35,
  health: 45,
  speed: 0.25,
  xp: 6,
  knockbackResistance: 0.7,
  attack: { damage: 9, speed: 1.4 },
  // Rears up as a warning when you come close, and charges if you stay right next to it.
  hostile: { range: 4 },
  hunts: ['salmon', 'cod', 'rabbit'],
  huntInterval: 60,
  sleeps: 'night',
  breed: ['salmon', 'sweet_berries', 'honeycomb'],
  tempt: ['salmon', 'cod', 'sweet_berries', 'honeycomb', 'honey_bottle'],
  heal: [['salmon', 4], ['sweet_berries', 2], ['honeycomb', 4], ['honey_bottle', 6]],
  spawn: [
    { biomes: ['taiga'], weight: 3, group: [1, 2], blocks: ['grass_block', 'podzol', 'coarse_dirt'] },
    { biomes: ['forest'], weight: 1, group: [1, 1], blocks: ['grass_block'] },
  ],
  loot: [{ item: 'leather', min: 1, max: 3 }, { item: 'safari:raw_game_meat', min: 1, max: 3, smelts: true }],
  sounds: { ambient: 'mob.polarbear.idle', hurt: 'mob.polarbear.hurt', death: 'mob.polarbear.death', pitch: [0.6, 0.7], interval: 20 },
  egg: ['#6b4a2e', '#c9a273'],

  model,

  materials: {
    fur: {
      base: '#6b4a2e',
      layers: [
        // Silver-tipped ("grizzled") hair over the hump and back, darker legs.
        gradient('#a4825c', { axis: 1, from: 14, to: 22, where: all(bone('body'), face('top', 'left', 'right', 'front')) }),
        region('#4a321e', bone('leg_fl', 'leg_fr', 'leg_bl', 'leg_br')),
        underside('#55391f', { y: 10, soft: 2, where: bone('body') }),
        mottle(0.1, { scale: 3 }),
        fur(0.1),
      ],
    },
    muzzle: { base: '#a07a52', layers: [fur(0.06)] },
    ear: '#4a321e',
    paw: '#2e2016',
    claw: '#d8cbb0',
    jaw: { base: '#a07a52', layers: [region('#8a3a36', face('top'))] },
    fang: '#efe8d8',
  },

  anims: {
    ...quadruped({ tail: ['tail'], ears: ['ear_l', 'ear_r'], swing: 24, sleepDrop: 6, legFold: 75, walkLength: 1.3, runLength: 0.55 }),
    rear: extras.rear(model.rear),
  },
};
