import { arachnid } from '../lib/anim.mjs';
import { mottle, region, fur } from '../lib/texture.mjs';

// Legs: [side, index, z, length, yaw]. Front legs are longest and reach forward.
const LEGS = [];
for (const side of [1, -1]) {
  [[-2.5, 4, -35], [-1.5, 3, -12], [-0.5, 3, 12], [0.5, 4, 35]].forEach(([z, len, yaw], index) => {
    const x0 = side > 0 ? 2 : -2 - len;
    const tipX = side > 0 ? 2 + len : -3 - len;
    LEGS.push({
      name: `leg_${side > 0 ? 'l' : 'r'}${index + 1}`, side, index,
      bone: {
        name: `leg_${side > 0 ? 'l' : 'r'}${index + 1}`, parent: 'body', pivot: [side * 2, 3.5, z + 0.5], rotation: [0, side * yaw, 0],
        cubes: [
          // Femur rising slightly from the body, then the lower leg down to the ground (orange "knee").
          { origin: [x0, 3, Math.floor(z)], size: [len, 1, 1], mat: 'leg' },
          { origin: [tipX, 0, Math.floor(z)], size: [1, 4, 1], mat: 'shin' },
        ],
      },
    });
  });
}

export default {
  id: 'tarantula',
  name: 'Tarantula',
  role: 'neutral',
  family: ['arachnid', 'small'],
  size: [0.7, 0.4],
  health: 8,
  speed: 0.2,
  movement: 'climb',
  xp: 2,
  attack: { damage: 2, speed: 1.3, effect: 'slowness' },
  sleeps: 'day',
  breed: ['spider_eye'],
  tempt: ['spider_eye'],
  spawn: [
    { biomes: ['jungle'], weight: 2, group: [1, 1], blocks: ['grass_block', 'podzol'] },
    { biomes: ['savanna', 'desert'], weight: 1, group: [1, 1] },
  ],
  loot: [{ item: 'string', min: 0, max: 2 }, { item: 'spider_eye', min: 0, max: 1, chance: 0.4 }],
  sounds: { ambient: 'mob.spider.say', hurt: 'mob.spider.say', death: 'mob.spider.death', pitch: [1.4, 1.6], interval: 20 },
  egg: ['#1a1614', '#d8641e'],

  model: {
    bones: [
      { name: 'root', pivot: [0, 0, 0] },
      {
        name: 'body', parent: 'root', pivot: [0, 3, 0],
        cubes: [
          // Cephalothorax with eyes on top, then a large hairy abdomen.
          { origin: [-2, 2, -3], size: [4, 2, 4], mat: 'carapace', marks: [{ face: 'top', x: 1, y: 0, w: 2, color: '#0a0808' }] },
          { origin: [-3, 2, 1], size: [6, 4, 5], mat: 'abdomen' },
          // Fangs and pedipalps.
          { origin: [-1, 1, -4], size: [2, 2, 1], mat: 'fang' },
          { origin: [1, 1, -5], size: [1, 1, 2], mat: 'leg' },
          { origin: [-2, 1, -5], size: [1, 1, 2], mat: 'leg' },
        ],
      },
      ...LEGS.map((l) => l.bone),
    ],
  },

  materials: {
    // Dark carapace with a pale rim, like a red-knee's.
    carapace: { base: '#2a2220', layers: [region('#b07a42', ({ face: f, j }) => (f === 'left' || f === 'right' || f === 'front') && j === 0), fur(0.1)] },
    abdomen: { base: '#1a1614', layers: [region('#8a5a3a', ({ p }) => (Math.floor(p[0] * 3 + p[2] * 5) * 2654435761 >>> 0) % 9 === 0), fur(0.18)] },
    fang: '#0a0808',
    leg: { base: '#1e1a18', layers: [fur(0.15)] },
    shin: { base: '#1e1a18', layers: [region('#d8641e', ({ j }) => j === 0), fur(0.12)] },
  },

  anims: arachnid({ legs: LEGS.map(({ name, side, index }) => ({ bone: name, side, index })), fangs: undefined }),
};
