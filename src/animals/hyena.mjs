import { quadruped } from '../lib/anim.mjs';
import { felid } from '../lib/bodies.mjs';
import { all, bone, LEGS, notFace } from '../lib/parts.mjs';
import { fur, mottle, spots, underside } from '../lib/texture.mjs';

export default {
  id: 'hyena',
  name: 'Hyena',
  role: 'predator',
  family: ['hyena', 'scavenger'],
  size: [0.8, 1.0],
  health: 18,
  speed: 0.28,
  xp: 3,
  attack: { damage: 4, speed: 1.4 },
  alertsPack: true,
  hunts: ['antelope', 'warthog', 'zebra'],
  huntInterval: 30,
  fleesFrom: ['lion'],
  sleeps: 'day',
  breed: ['rotten_flesh', 'bone', 'safari:raw_game_meat'],
  tempt: ['rotten_flesh', 'bone', 'safari:raw_game_meat'],
  heal: [['rotten_flesh', 2], ['safari:raw_game_meat', 4]],
  // Scavengers: they rush in and grab meat dropped by other hunters' kills.
  extraComponents: {
    'minecraft:shareables': {
      singular_pickup: true,
      items: ['safari:raw_game_meat', 'beef', 'porkchop', 'mutton', 'chicken', 'rabbit', 'rotten_flesh', 'bone'].map((item) => ({
        item: item.includes(':') ? item : `minecraft:${item}`, priority: 0, max_amount: 1,
      })),
    },
    'minecraft:equip_item': { can_wear_armor: false },
    'minecraft:behavior.pickup_items': { priority: 4, max_dist: 16, goal_radius: 1.5, speed_multiplier: 1.3 },
    'minecraft:behavior.eat_carried_item': { priority: 12, delay_before_eating: 60 },
  },
  spawn: [{ biomes: ['savanna'], weight: 2, group: [3, 5], blocks: ['grass_block', 'coarse_dirt'] }],
  loot: [{ item: 'bone', min: 0, max: 2 }],
  sounds: { ambient: 'mob.fox.screech', hurt: 'mob.wolf.hurt', death: 'mob.wolf.death', pitch: [0.8, 1.0], interval: 15 },
  egg: ['#a8936b', '#3a2c20'],

  model: felid({ bodyW: 6, bodyH: 7, bodyL: 14, legH: 10, legW: 2, headW: 6, headH: 5, headD: 5, muzzleW: 4, muzzleD: 3, tailL: 7, tuft: true, earH: 3, slope: 2, hump: 1, eyeColor: '#6b4a1e' }),

  materials: {
    fur: {
      base: '#a8936b',
      layers: [
        underside('#c9b892', { y: 11, soft: 2, where: bone('body') }),
        spots('#3a2c20', { size: 2, radius: 0.33, where: all(bone('body', ...LEGS), notFace('bottom')) }),
        mottle(0.08),
        fur(0.07),
      ],
    },
    muzzle: { base: '#3a2c20', layers: [fur(0.05)] },
    ear: '#5a4630',
    tail: '#a8936b',
    tuft: { base: '#2a2018', layers: [fur(0.1)] },
    paw: '#3a2c20',
  },

  anims: quadruped({ tail: ['tail', 'tail2'], ears: ['ear_l', 'ear_r'], swing: 30, sleepDrop: 7, legFold: 80, walkLength: 0.85, runLength: 0.4 }),
};
