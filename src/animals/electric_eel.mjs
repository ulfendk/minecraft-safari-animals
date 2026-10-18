import { serpent } from '../lib/anim.mjs';
import { region, mottle } from '../lib/texture.mjs';

const SEGMENTS = 6;
const segs = [];
for (let i = 0; i < SEGMENTS; i++) {
  const z = i * 4;
  const thin = i >= SEGMENTS - 2;
  segs.push({
    name: `seg${i + 1}`, parent: i === 0 ? 'root' : `seg${i}`, pivot: [0, 1, z],
    cubes: [
      { origin: [-1, thin ? 0.5 | 0 : 0, z], size: [2, thin && i === SEGMENTS - 1 ? 1 : 2, 4], mat: 'skin' },
      // The long ribbon fin that runs along the underside.
      { origin: [0, -1, z], size: [0, 1, 4], mat: 'fin' },
    ],
  });
}

export default {
  id: 'electric_eel',
  name: 'Electric Eel',
  role: 'neutral',
  family: ['fish', 'eel'],
  size: [0.5, 0.3],
  health: 14,
  speed: 0.12,
  swimSpeed: 0.13,
  movement: 'swim',
  xp: 4,
  // A powerful shock: the target is stunned (slowed) for a few seconds.
  attack: { damage: 5, speed: 1.4, effect: 'slowness' },
  shocks: true,
  sleeps: 'never',
  spawn: [{ biomes: ['jungle', 'river', 'swamp'], weight: 1, group: [1, 1], water: true }],
  loot: [{ item: 'salmon', min: 0, max: 1, smelts: true }, { item: 'glow_ink_sac', min: 0, max: 1, chance: 0.3 }],
  sounds: { ambient: 'mob.guardian.ambient', hurt: 'mob.guardian.hit', death: 'mob.guardian.death', pitch: [1.3, 1.5], interval: 25 },
  egg: ['#2e3328', '#e8902a'],

  model: {
    bones: [
      { name: 'root', pivot: [0, 0, 0] },
      ...segs,
      {
        name: 'head', parent: 'seg1', pivot: [0, 1, 0],
        cubes: [{
          origin: [-1, 0, -3], size: [2, 2, 3], mat: 'skin',
          marks: [{ face: 'right', x: 1, y: 0, color: '#0a0a08' }, { face: 'left', x: 1, y: 0, color: '#0a0a08' }, { face: 'front', x: 0, y: 1, w: 2, color: '#1a1a14' }],
        }],
      },
    ],
  },

  materials: {
    // Dark olive above; orange-yellow throat and belly.
    skin: { base: '#2e3328', layers: [region('#e8902a', ({ face: f, p }) => f === 'bottom' || (p[1] < 0.6 && p[2] < 6)), mottle(0.12, { scale: 1.5 })] },
    fin: { base: '#4a4434', layers: [region('#6a6044', ({ j }) => j === 0)] },
  },

  anims: (() => {
    const a = serpent({ segments: ['head', ...segs.map((s) => s.name)], amp: 12 });
    return { swim: a.swim, idle: a.idle, attack: a.attack };
  })(),
};
