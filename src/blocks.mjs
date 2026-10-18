// Custom blocks. The thorn bush is a 1.5-block-tall barrier: land animals can't
// jump it and get hurt when they push against it (see scripts/thorns.js).
import { PNG } from 'pngjs';
import { hex } from './lib/texture.mjs';

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
}

/** 16x16 tangle of thorny branches with a few leaves, on transparency. */
function thornTexture() {
  const png = new PNG({ width: 16, height: 16 });
  png.data.fill(0);
  const put = (x, y, c) => {
    if (x < 0 || y < 0 || x > 15 || y > 15) return;
    png.data.set(hex(c), (y * 16 + x) * 4);
  };
  const rand = rng(7);
  const bark = ['#5a3b22', '#6e4a2b', '#4a2f1b'];
  for (let b = 0; b < 7; b++) {
    let x = 1 + Math.floor(rand() * 14), y = 15;
    let dx = rand() < 0.5 ? -1 : 1;
    while (y >= 0) {
      put(x, y, bark[Math.floor(rand() * bark.length)]);
      if (rand() < 0.25) put(x + (rand() < 0.5 ? -1 : 1), y, '#d8c9a3'); // thorn
      if (rand() < 0.08) put(x + dx, y - 1, '#6f8a3a'); // leaf
      y -= 1;
      if (rand() < 0.45) x += dx;
      if (rand() < 0.2) dx = -dx;
      x = Math.max(0, Math.min(15, x));
    }
  }
  return PNG.sync.write(png);
}

const plane = (origin, size, rotation) => {
  const faces = size[0] === 0 ? ['east', 'west'] : ['north', 'south'];
  return {
    origin, size, ...(rotation ? { rotation, pivot: [0, 0, 0] } : {}),
    uv: Object.fromEntries(faces.map((f) => [f, { uv: [0, 0], uv_size: [16, 16] }])),
  };
};

export const blocks = [
  {
    id: 'thorn_bush',
    name: 'Thorn Bush',
    texture: thornTexture(),
    geometry: {
      format_version: '1.12.0',
      'minecraft:geometry': [{
        description: { identifier: 'geometry.safari.thorn_bush', texture_width: 16, texture_height: 16 },
        bones: [{
          name: 'bush', pivot: [0, 0, 0],
          cubes: [
            plane([-8, 0, -7], [16, 24, 0]),
            plane([-8, 0, 7], [16, 24, 0]),
            plane([-7, 0, -8], [0, 24, 16]),
            plane([7, 0, -8], [0, 24, 16]),
            plane([-8, 0, 0], [16, 24, 0], [0, 45, 0]),
            plane([-8, 0, 0], [16, 24, 0], [0, -45, 0]),
          ],
        }],
      }],
    },
    definition: {
      format_version: '1.21.90',
      'minecraft:block': {
        description: { identifier: 'safari:thorn_bush', menu_category: { category: 'nature' } },
        components: {
          'minecraft:geometry': 'geometry.safari.thorn_bush',
          'minecraft:material_instances': { '*': { texture: 'safari_thorn_bush', render_method: 'alpha_test', ambient_occlusion: false, face_dimming: false } },
          // Taller than a block, like a fence, so mobs can't jump over it.
          'minecraft:collision_box': { origin: [-8, 0, -8], size: [16, 24, 16] },
          'minecraft:selection_box': { origin: [-8, 0, -8], size: [16, 16, 16] },
          'minecraft:light_dampening': 0,
          'minecraft:destructible_by_mining': { seconds_to_destroy: 0.6 },
          'minecraft:destructible_by_explosion': { explosion_resistance: 1 },
          'minecraft:flammable': { catch_chance_modifier: 30, destroy_chance_modifier: 60 },
          'minecraft:map_color': '#6e5a33',
          'minecraft:display_name': 'tile.safari:thorn_bush.name',
        },
      },
    },
  },
];

export const blockRecipes = [
  {
    'minecraft:recipe_shapeless': {
      description: { identifier: 'safari:thorn_bush' },
      tags: ['crafting_table'],
      ingredients: [{ item: 'minecraft:deadbush' }, { item: 'minecraft:stick', count: 2 }],
      result: { item: 'safari:thorn_bush', count: 2 },
      unlock: [{ item: 'minecraft:deadbush' }],
    },
  },
];

/** World generation: scattered thorn bushes in savannas. */
export const features = {
  'features/thorn_bush_feature.json': {
    format_version: '1.13.0',
    'minecraft:single_block_feature': {
      description: { identifier: 'safari:thorn_bush_feature' },
      places_block: 'safari:thorn_bush',
      enforce_placement_rules: false,
      enforce_survivability_rules: false,
      may_attach_to: { min_sides_must_attach: 1, bottom: ['minecraft:grass_block', 'minecraft:coarse_dirt', 'minecraft:dirt'] },
    },
  },
  'feature_rules/thorn_bush_rule.json': {
    format_version: '1.13.0',
    'minecraft:feature_rules': {
      description: { identifier: 'safari:thorn_bush_rule', places_feature: 'safari:thorn_bush_feature' },
      conditions: {
        placement_pass: 'surface_pass',
        'minecraft:biome_filter': [{ test: 'has_biome_tag', operator: '==', value: 'savanna' }],
      },
      distribution: {
        iterations: 3,
        scatter_chance: { numerator: 1, denominator: 5 },
        x: { distribution: 'uniform', extent: [0, 15] },
        y: 'query.heightmap(variable.worldx, variable.worldz)',
        z: { distribution: 'uniform', extent: [0, 15] },
      },
    },
  },
};
