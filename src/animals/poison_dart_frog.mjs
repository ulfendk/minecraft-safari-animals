import { frog } from '../lib/anim.mjs';
import { all, face } from '../lib/parts.mjs';
import { mottle, region, spots } from '../lib/texture.mjs';

/** Colour morphs: blue with black spots, golden, and "strawberry" red with blue legs. */
const morph = (body, legs, spot) => ({
  body: { base: body, layers: [...(spot ? [spots(spot, { size: 1.8, radius: 0.3, seed: 5 })] : []), mottle(0.08, { scale: 1 })] },
  legs: { base: legs, layers: [...(spot ? [spots(spot, { size: 1.6, radius: 0.28, seed: 9 })] : []), mottle(0.06, { scale: 1 })] },
});
const BLUE = morph('#2a64d8', '#1a3aa0', '#0a0a14');
const GOLD = morph('#f2c22a', '#e0a81e', null);
const STRAWBERRY = morph('#d8281e', '#1e3ab0', '#3a0a08');

export default {
  id: 'poison_dart_frog',
  name: 'Poison Dart Frog',
  role: 'prey',
  family: ['frog', 'small'],
  size: [0.3, 0.25],
  health: 4,
  speed: 0.22,
  movement: 'hop',
  xp: 1,
  poisonous: true,
  // Wipe a dart along the frog's skin to coat it with poison (the frog isn't harmed).
  extraComponents: {
    'minecraft:interact': {
      interactions: [{
        on_interact: { filters: { all_of: [{ test: 'has_equipment', subject: 'other', domain: 'hand', value: 'safari:dart' }] } },
        transform_to_item: 'safari:poison_dart',
        use_item: true,
        play_sounds: 'mob.frog.eat',
        interact_text: 'action.interact.safari.poison_dart',
      }],
    },
  },
  sleeps: 'night',
  strollRange: 4,
  breed: ['spider_eye', 'slime_ball'],
  tempt: ['spider_eye'],
  variants: [
    { weight: 1 },
    { weight: 1, texture: 'golden', materials: GOLD },
    { weight: 1, texture: 'strawberry', materials: STRAWBERRY },
  ],
  spawn: [{ biomes: ['jungle'], weight: 3, group: [2, 4], blocks: ['grass_block', 'podzol', 'mud'] }],
  loot: [],
  sounds: { ambient: 'mob.frog.ambient', hurt: 'mob.frog.hurt', death: 'mob.frog.death', pitch: [1.6, 1.9], interval: 12 },
  egg: ['#2a64d8', '#0a0a14'],

  model: {
    bones: [
      { name: 'root', pivot: [0, 0, 0] },
      {
        name: 'body', parent: 'root', pivot: [0, 1, 1],
        cubes: [
          { origin: [-2, 1, -1], size: [4, 2, 4], mat: 'body' },
          { origin: [-2, 1, -3], size: [4, 2, 2], mat: 'body', marks: [{ face: 'front', x: 1, y: 1, w: 2, color: '#0a0a0a' }] },
          // Big glossy black eyes.
          { origin: [1, 3, -3], size: [1, 1, 1], mat: 'eye' },
          { origin: [-2, 3, -3], size: [1, 1, 1], mat: 'eye' },
        ],
      },
      { name: 'throat', parent: 'body', pivot: [0, 1, -2], cubes: [{ origin: [-1, 0, -3], size: [2, 1, 2], mat: 'body' }] },
      { name: 'leg_fl', parent: 'body', pivot: [1.5, 2, -2], cubes: [{ origin: [1, 0, -3], size: [2, 2, 1], mat: 'legs' }] },
      { name: 'leg_fr', parent: 'body', pivot: [-1.5, 2, -2], cubes: [{ origin: [-3, 0, -3], size: [2, 2, 1], mat: 'legs' }] },
      // Folded hind legs.
      { name: 'leg_bl', parent: 'body', pivot: [2, 2, 1], cubes: [{ origin: [2, 0, -1], size: [1, 2, 4], mat: 'legs' }, { origin: [2, 0, -2], size: [2, 1, 1], mat: 'legs' }] },
      { name: 'leg_br', parent: 'body', pivot: [-2, 2, 1], cubes: [{ origin: [-3, 0, -1], size: [1, 2, 4], mat: 'legs' }, { origin: [-4, 0, -2], size: [2, 1, 1], mat: 'legs' }] },
    ],
  },

  materials: { ...BLUE, eye: { base: '#0a0a0a', layers: [region('#ffffff', all(face('front'), ({ i, j }) => i === 0 && j === 0))] } },

  anims: frog({ throat: 'throat' }),
};
