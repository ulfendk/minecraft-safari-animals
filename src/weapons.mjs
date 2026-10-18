// Stone age weapons: flint spear (melee or thrown), stone club, flint knife,
// and a sling that shoots pebbles.
import { PNG } from 'pngjs';
import { hex } from './lib/texture.mjs';

/** Draw a 16x16 icon from [x, y, color] pixels. */
function icon(pixels) {
  const png = new PNG({ width: 16, height: 16 });
  png.data.fill(0);
  for (const [x, y, c] of pixels) if (x >= 0 && y >= 0 && x < 16 && y < 16) png.data.set(hex(c), (y * 16 + x) * 4);
  return PNG.sync.write(png);
}

/** Pixels along the bottom-left to top-right diagonal, from step a to b. */
const diag = (a, b, color, offset = 0) => {
  const out = [];
  for (let k = a; k <= b; k++) out.push([k + offset, 15 - k, color]);
  return out;
};

const WOOD = '#7a5230', WOOD_DARK = '#5a3a20', FLINT = '#3c3d42', FLINT_LIGHT = '#6a6c72', LEATHER = '#8a5a34', STONE = '#7c7c7c', STONE_DARK = '#5a5a5a';

const spearIcon = icon([
  ...diag(0, 10, WOOD), ...diag(1, 10, WOOD_DARK, 1),
  ...diag(10, 11, LEATHER), ...diag(10, 11, LEATHER, 1),
  ...diag(12, 15, FLINT), ...diag(12, 14, FLINT_LIGHT, 1), ...diag(12, 14, FLINT, -1),
]);

// Club: wooden handle with a big rounded stone head lashed to the top.
const clubHead = [];
for (let y = 0; y < 16; y++)
  for (let x = 0; x < 16; x++) {
    const d = Math.hypot(x - 10.5, y - 4.5);
    if (d < 3.6) clubHead.push([x, y, d > 2.6 || (x + y) % 3 === 0 ? STONE_DARK : STONE]);
  }
const clubIcon = icon([...diag(0, 8, WOOD), ...diag(1, 7, WOOD_DARK, 1), ...clubHead, ...diag(7, 7, LEATHER), ...diag(7, 7, LEATHER, -1)]);

const knifeIcon = icon([
  ...diag(2, 6, WOOD), ...diag(3, 6, WOOD_DARK, 1),
  ...diag(7, 7, LEATHER), ...diag(7, 7, LEATHER, 1),
  ...diag(8, 13, FLINT), ...diag(8, 12, FLINT_LIGHT, 1),
]);

const slingIcon = icon([
  ...[[2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [13, 2], [12, 3], [11, 4], [10, 5], [9, 6]].map(([x, y]) => [x, y, '#d8cfb8']),
  ...[6, 7, 8, 9].flatMap((x) => [[x, 7, LEATHER], [x, 8, LEATHER], [x, 9, '#6a4426']]),
  [5, 7, LEATHER], [10, 7, LEATHER], [7, 10, '#6a4426'], [8, 10, '#6a4426'],
]);

const pebbleIcon = icon([
  ...[[5, 7], [6, 7], [7, 7], [5, 8], [6, 8], [7, 8], [8, 8], [6, 9], [7, 9]].map(([x, y]) => [x, y, (x + y) % 2 ? STONE : '#8e8e8e']),
  ...[[9, 10], [10, 10], [9, 11], [10, 11], [11, 11]].map(([x, y]) => [x, y, (x + y) % 2 ? STONE_DARK : STONE]),
]);

const melee = (damage, durability) => ({
  'minecraft:damage': damage,
  'minecraft:durability': { max_durability: durability },
  'minecraft:hand_equipped': true,
  'minecraft:enchantable': { slot: 'sword', value: 5 },
});

export const weaponItems = [
  {
    id: 'flint_spear',
    name: 'Flint Spear',
    category: 'equipment',
    stack: 1,
    icon: spearIcon,
    components: {
      ...melee(5, 150),
      // Hold to charge, release to throw.
      'minecraft:throwable': { do_swing_animation: false, launch_power_scale: 1.0, max_draw_duration: 1.0, max_launch_power: 2.2, min_draw_duration: 0.3, scale_power_by_draw_duration: true },
      'minecraft:projectile': { projectile_entity: 'safari:thrown_spear', minimum_critical_power: 1.5 },
      'minecraft:use_modifiers': { use_duration: 3600, movement_modifier: 0.35 },
      'minecraft:repairable': { repair_items: [{ items: ['minecraft:flint'], repair_amount: 50 }] },
    },
  },
  {
    id: 'stone_club',
    name: 'Stone Club',
    category: 'equipment',
    stack: 1,
    icon: clubIcon,
    components: { ...melee(7, 180), 'minecraft:repairable': { repair_items: [{ items: ['minecraft:cobblestone'], repair_amount: 60 }] } },
  },
  {
    id: 'flint_knife',
    name: 'Flint Knife',
    category: 'equipment',
    stack: 1,
    icon: knifeIcon,
    components: { ...melee(4, 120), 'minecraft:repairable': { repair_items: [{ items: ['minecraft:flint'], repair_amount: 40 }] } },
  },
  {
    id: 'sling',
    name: 'Sling',
    category: 'equipment',
    stack: 1,
    icon: slingIcon,
    components: {
      'minecraft:durability': { max_durability: 200 },
      'minecraft:hand_equipped': true,
      'minecraft:shooter': {
        ammunition: [{ item: 'safari:pebble', use_offhand: true, search_inventory: true, use_in_creative: true }],
        max_draw_duration: 1.0,
        scale_power_by_draw_duration: true,
        charge_on_draw: false,
      },
      'minecraft:use_modifiers': { use_duration: 3600, movement_modifier: 0.5 },
    },
  },
  {
    id: 'pebble',
    name: 'Pebble',
    category: 'equipment',
    stack: 64,
    icon: pebbleIcon,
    components: {
      // Pebbles can also be thrown by hand, just not as hard.
      'minecraft:throwable': { do_swing_animation: true, launch_power_scale: 0.9, max_launch_power: 0.9 },
      'minecraft:projectile': { projectile_entity: 'safari:thrown_pebble' },
    },
  },
];

export const weaponRecipes = [
  {
    'minecraft:recipe_shaped': {
      description: { identifier: 'safari:flint_spear' },
      tags: ['crafting_table'],
      pattern: ['  F', ' L ', 'S  '],
      key: { F: { item: 'minecraft:flint' }, L: { item: 'minecraft:stick' }, S: { item: 'minecraft:stick' } },
      result: { item: 'safari:flint_spear' },
      unlock: [{ item: 'minecraft:flint' }],
    },
  },
  {
    'minecraft:recipe_shaped': {
      description: { identifier: 'safari:stone_club' },
      tags: ['crafting_table'],
      pattern: [' CC', ' SC', 'S  '],
      key: { C: { item: 'minecraft:cobblestone' }, S: { item: 'minecraft:stick' } },
      result: { item: 'safari:stone_club' },
      unlock: [{ item: 'minecraft:cobblestone' }],
    },
  },
  {
    'minecraft:recipe_shaped': {
      description: { identifier: 'safari:flint_knife' },
      tags: ['crafting_table'],
      pattern: ['F', 'S'],
      key: { F: { item: 'minecraft:flint' }, S: { item: 'minecraft:stick' } },
      result: { item: 'safari:flint_knife' },
      unlock: [{ item: 'minecraft:flint' }],
    },
  },
  {
    'minecraft:recipe_shaped': {
      description: { identifier: 'safari:sling' },
      tags: ['crafting_table'],
      pattern: ['T T', ' L '],
      key: { T: { item: 'minecraft:string' }, L: { item: 'minecraft:leather' } },
      result: { item: 'safari:sling' },
      unlock: [{ item: 'minecraft:string' }],
    },
  },
  {
    'minecraft:recipe_shapeless': {
      description: { identifier: 'safari:pebbles_from_cobblestone' },
      tags: ['crafting_table'],
      ingredients: [{ item: 'minecraft:cobblestone' }],
      result: { item: 'safari:pebble', count: 4 },
      unlock: [{ item: 'minecraft:cobblestone' }],
    },
  },
  {
    'minecraft:recipe_shapeless': {
      description: { identifier: 'safari:pebbles_from_gravel' },
      tags: ['crafting_table'],
      ingredients: [{ item: 'minecraft:gravel' }],
      result: { item: 'safari:pebble', count: 2 },
      unlock: [{ item: 'minecraft:gravel' }],
    },
  },
];

/** Projectiles thrown by the weapons. Models point their tip towards -z (the direction of travel). */
export const weaponProjectiles = [
  {
    id: 'thrown_spear',
    name: 'Flint Spear',
    damage: 8,
    power: 2.2,
    gravity: 0.04,
    rotate: true,
    hitSound: 'item.trident.hit',
    model: {
      bones: [{
        name: 'body', pivot: [0, 0, 0],
        cubes: [
          { origin: [0, 0, -5], size: [1, 1, 14], mat: 'shaft' },
          { origin: [0, 0, -6], size: [1, 1, 1], mat: 'binding', inflate: 0.15 },
          { origin: [0, -1, -9], size: [1, 3, 3], mat: 'flint' },
        ],
      }],
    },
    materials: { shaft: '#7a5230', binding: '#8a5a34', flint: { base: '#3c3d42', layers: [] } },
  },
  {
    id: 'thrown_pebble',
    name: 'Pebble',
    damage: 3,
    power: 1.6,
    gravity: 0.05,
    rotate: false,
    hitSound: 'random.bowhit',
    model: { bones: [{ name: 'body', pivot: [0, 1, 0], cubes: [{ origin: [-1, 0, -1], size: [2, 2, 2], mat: 'stone' }] }] },
    materials: { stone: '#7c7c7c' },
  },
];
