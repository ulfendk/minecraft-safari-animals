import { quadruped } from '../lib/anim.mjs';
import { caprid, hornArc } from '../lib/bodies.mjs';
import { all, bone, face, LEGS } from '../lib/parts.mjs';
import { fur, mottle, region } from '../lib/texture.mjs';

// A huge shoulder hump under a woolly cape that covers the head, neck and forequarters; the
// hindquarters are short-haired and much slimmer. The head hangs low, with short black horns.
const base = caprid({
  bodyW: 10, bodyH: 12, bodyL: 20, legH: 9, legW: 4, neckW: 8, neckH: 2, headW: 7, headH: 7, headD: 6, muzzleD: 2,
  hump: 5, beard: 4, tail: 7, earL: 1,
  horns: ({ top, back, side }) => [
    // A bushy mop of hair on the forehead.
    { origin: [-side - 0.5, top - 3, back - 5], size: [2 * side + 1, 4, 5], mat: 'mane', hair: true },
    ...hornArc([[side + 0.5, top - 2, back - 3], [side + 1.5, top - 1.5, back - 3], [side + 2, top - 0.5, back - 3.5]], { size: [2, 2, 1] }),
  ],
});
const model = {
  ...base,
  bones: base.bones.map((b) => (b.name === 'body'
    ? {
      ...b,
      cubes: [
        ...b.cubes.filter((c) => c.origin[1] < 20),
        // The hump rising above the cape, the cape itself and the long hair over the front legs.
        { origin: [-5, 20, -11], size: [10, 6, 8], mat: 'mane', hair: true },
        { origin: [-7, 11, -11], size: [14, 12, 10], mat: 'mane', hair: true },
        { origin: [-6, 5, -10.5], size: [12, 6, 8], mat: 'mane', hair: true },
      ],
    }
    : b)),
};

export default {
  id: 'bison',
  name: 'American Bison',
  role: 'megafauna',
  family: ['bovine', 'grazer'],
  size: [1.5, 1.8],
  scale: 1.6,
  health: 45,
  speed: 0.22,
  xp: 6,
  knockbackResistance: 0.8,
  // Unpredictable: gets close and it lowers its head and charges, and the herd comes with it.
  attack: { damage: 8, speed: 1.6, cooldown: 1.5 },
  hostile: { range: 5, filters: [{ test: 'is_baby', subject: 'self', value: false }] },
  alertsPack: true,
  breed: ['wheat'],
  tempt: ['wheat', 'hay_block'],
  heal: [['wheat', 2], ['hay_block', 20]],
  grazes: true,
  sleeps: 'night',
  strollRange: 14,
  spawn: [
    { biomes: ['plains'], weight: 3, group: [4, 8], blocks: ['grass_block'] },
    { biomes: ['tundra'], weight: 1, group: [2, 4] },
  ],
  loot: [
    { item: 'leather', min: 1, max: 3 },
    { item: 'safari:raw_game_meat', min: 2, max: 4, smelts: true },
  ],
  sounds: { ambient: 'mob.cow.say', hurt: 'mob.cow.hurt', death: 'mob.cow.hurt', pitch: [0.45, 0.55], interval: 16 },
  egg: ['#5a3d26', '#2a1c12'],
  client: { runSpeed: 4 },

  model,

  materials: {
    hide: { base: '#5e4029', layers: [region('#4a3220', all(bone(...LEGS), ({ p }) => p[1] < 5)), mottle(0.08, { scale: 3 }), fur(0.08)] },
    mane: { base: '#3a2618', layers: [region('#4a3322', ({ i, j }) => (i * 5 + Math.floor(j / 2)) % 5 === 0), mottle(0.1, { scale: 3 }), fur(0.16)] },
    face: { base: '#2a1c12', layers: [fur(0.1)] },
    muzzle: { base: '#1e1510', layers: [fur(0.05)] },
    beard: { base: '#2a1c12', layers: [fur(0.14)] },
    ear: '#2a1c12',
    tail: { base: '#3a2618', layers: [region('#21160e', ({ p }) => p[1] < 15), fur(0.1)] },
    horn: '#1a1612',
    hoof: '#16120f',
  },

  anims: quadruped({ neck: 'neck', tail: ['tail'], ears: ['ear_l', 'ear_r'], swing: 22, sleepDrop: 6, legFold: 75, walkLength: 1.3, runLength: 0.6 }),
};
