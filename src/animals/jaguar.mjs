import { extras, quadruped } from '../lib/anim.mjs';
import { felid } from '../lib/bodies.mjs';
import { all, bone, LEGS, notFace } from '../lib/parts.mjs';
import { fur, mottle, region, rosettePixels, spots, underside } from '../lib/texture.mjs';

/** Coat colours: golden with big dark-centred rosettes, or black (the rosettes barely show). */
const coat = (base, mark, inner, belly, muzzle) => ({
  fur: {
    base,
    layers: [
      underside(belly, { y: 8.5, soft: 1, where: bone('body') }),
      rosettePixels(mark, { centre: inner, cell: 5, gaps: 0.2, where: all(bone('body', 'tail'), notFace('bottom')) }),
      spots(mark, { size: 2, radius: 0.3, where: bone(...LEGS) }),
      spots(mark, { size: 1.6, radius: 0.24, seed: 4, where: all(bone('head'), notFace('front')) }),
      region(mark, all(bone('head'), ({ face: f, i, j }) => f === 'front' && j === 0 && i % 3 === 1)),
      mottle(0.05),
      fur(0.05),
    ],
  },
  muzzle: { base: muzzle, layers: [fur(0.04)] },
  ear: { base: base, layers: [region(mark, ({ face: f }) => f === 'back')] },
  tail: { base, layers: [spots(mark, { size: 2, radius: 0.4 })] },
  paw: belly,
  jaw: { base: muzzle, layers: [region('#a8443c', ({ face: f }) => f === 'top')] },
});
const GOLDEN = coat('#d4993f', '#24170f', '#9c6a28', '#f0e2c4', '#ecd5a6');
const BLACK = coat('#25201c', '#110d0b', '#1a1512', '#2e2723', '#3a322c');

export default {
  id: 'jaguar',
  name: 'Jaguar',
  role: 'predator',
  // shell_crusher: its bite goes straight through a turtle's or tortoise's shell.
  family: ['big_cat', 'feline', 'shell_crusher'],
  size: [1.0, 1.0],
  scale: 1.15,
  health: 28,
  speed: 0.28,
  swimSpeed: 0.1,
  xp: 5,
  attack: { damage: 7, speed: 1.5, leap: true },
  hunts: ['capybara', 'caiman', 'shelled', 'pig', 'chicken', 'monkey'],
  huntInterval: 40,
  sleeps: 'day',
  climbs: true,
  fallImmune: true,
  breed: ['beef', 'porkchop', 'safari:raw_game_meat'],
  tempt: ['beef', 'porkchop', 'safari:raw_game_meat'],
  heal: [['beef', 4], ['porkchop', 4], ['safari:raw_game_meat', 4]],
  variants: [
    { weight: 5 },
    { weight: 1, texture: 'black', materials: BLACK },
  ],
  spawn: [
    { biomes: ['jungle'], weight: 2, group: [1, 1], blocks: ['grass_block', 'podzol'] },
    { biomes: ['swamp', 'mangrove'], weight: 1, group: [1, 1], blocks: ['grass_block', 'mud'] },
  ],
  loot: [{ item: 'leather', min: 0, max: 2 }],
  sounds: { ambient: 'mob.cat.hiss', hurt: 'mob.cat.hit', death: 'mob.ocelot.death', pitch: [0.4, 0.5], interval: 28 },
  egg: ['#d4993f', '#24170f'],

  // Stockier than a leopard: a broad head, a deep chest, short thick legs and a shorter tail.
  model: felid({
    bodyW: 10, bodyH: 9, bodyL: 18, legH: 8, legW: 4, headW: 8, headH: 7, headD: 6, muzzleW: 4, muzzleH: 4, muzzleD: 2,
    tailL: 11, jaw: true, jawOpen: 10, eyeColor: '#b8cc5a',
  }),

  materials: { ...GOLDEN, fang: '#f4efe2' },

  anims: {
    ...quadruped({ tail: ['tail', 'tail2'], ears: ['ear_l', 'ear_r'], swing: 28, sleepDrop: 6, legFold: 80, walkLength: 1.0, runLength: 0.45 }),
    roar: extras.roar({ head: 'head', jaw: 'jaw' }),
    // Jaguars swim well: a dog paddle with the head held up.
    swim: { loop: true, animation_length: 1, bones: {
      leg_fl: { rotation: { '0.00': [-40, 0, 0], '0.50': [20, 0, 0], '1.00': [-40, 0, 0] } },
      leg_fr: { rotation: { '0.00': [20, 0, 0], '0.50': [-40, 0, 0], '1.00': [20, 0, 0] } },
      leg_bl: { rotation: { '0.00': [30, 0, 0], '0.50': [-10, 0, 0], '1.00': [30, 0, 0] } },
      leg_br: { rotation: { '0.00': [-10, 0, 0], '0.50': [30, 0, 0], '1.00': [-10, 0, 0] } },
      head: { rotation: [-20, 0, 0] },
    } },
  },
};
