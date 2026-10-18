// Custom items: definitions, pixel-art icons, recipes.
import { pixelIcon } from './lib/texture.mjs';

const MEAT = {
  '.': null, o: '#5a1f1a', r: '#b5413a', p: '#d9736b', w: '#f0d9c8',
};
const COOKED = {
  '.': null, o: '#3b2213', r: '#8a4f2b', p: '#b8743f', w: '#e7c79a',
};
const meatRows = [
  '................',
  '................',
  '......oooo......',
  '....oorrrroo....',
  '...orrppprrro...',
  '..orrpprrrrrro..',
  '..orpprrrrrrro..',
  '.orrprrrrrrrro..',
  '.orrrrrrrrrro...',
  '.orrrrrrrroo....',
  '..orrrrrroww....',
  '...ooooooowwo...',
  '..........oww...',
  '...........oo...',
  '................',
  '................',
];

export const items = [
  {
    id: 'field_guide',
    name: 'Safari Field Guide',
    category: 'equipment',
    stack: 1,
    icon: pixelIcon([
      '................',
      '..ggggggggggg...',
      '..gyyyyyyyyyyg..',
      '..gyggggggggyg..',
      '..gygwwwwwwgyg..',
      '..gygwkwwkwgyg..',
      '..gygwwkkwwgyg..',
      '..gygwkkkkwgyg..',
      '..gygwwkkwwgyg..',
      '..gygwwwwwwgyg..',
      '..gyggggggggyg..',
      '..gyyyyyyyyyyg..',
      '..gppppppppppg..',
      '..ggggggggggg...',
      '................',
      '................',
    ], { '.': null, g: '#3d5a2a', y: '#5f8a3a', w: '#e9d8a6', k: '#7a4a22', p: '#f4ecd8' }),
  },
  {
    id: 'raw_game_meat',
    name: 'Raw Game Meat',
    category: 'nature',
    food: { nutrition: 3, saturation: 0.3 },
    icon: pixelIcon(meatRows, MEAT),
  },
  {
    id: 'cooked_game_meat',
    name: 'Cooked Game Meat',
    category: 'nature',
    food: { nutrition: 8, saturation: 0.8 },
    icon: pixelIcon(meatRows, COOKED),
  },
  {
    id: 'ostrich_egg',
    name: 'Ostrich Egg',
    category: 'nature',
    stack: 16,
    icon: pixelIcon([
      '................',
      '................',
      '......oooo......',
      '.....owwwwo.....',
      '....owwwwwwo....',
      '...owwwwwwwso...',
      '...owwwwwwwso...',
      '..owwwwwwwwsso..',
      '..owwwwwwwwsso..',
      '..owwwwwwwssso..',
      '..owwwwwwwssso..',
      '...owwwwwsssoo..',
      '....osssssso....',
      '.....oooooo.....',
      '................',
      '................',
    ], { '.': null, o: '#8a7d66', w: '#f6f0e1', s: '#ddd2bb' }),
  },
  {
    id: 'fried_ostrich_egg',
    name: 'Fried Ostrich Egg',
    category: 'nature',
    food: { nutrition: 10, saturation: 0.8 },
    icon: pixelIcon([
      '................',
      '................',
      '....wwwwww......',
      '..wwwwwwwwwww...',
      '.wwwwwwwwwwwww..',
      '.wwwwyyyyywwwww.',
      'wwwwyyyyyyywwww.',
      'wwwwyyyyyyywwww.',
      'wwwwyyyyyyyywww.',
      '.wwwwyyyyyywwww.',
      '.wwwwwyyywwwww..',
      '..wwwwwwwwwww...',
      '....wwwwwww.....',
      '................',
      '................',
      '................',
    ], { '.': null, w: '#f7f3ea', y: '#f2b632' }),
  },
  {
    id: 'zebra_hide',
    name: 'Zebra Hide',
    category: 'items',
    icon: pixelIcon([
      '................',
      '................',
      '..wkwwkwwkwwk...',
      '.wwkwwkwwkwwkw..',
      '.kwwkwwkwwkwwk..',
      '..wwkwwkwwkwwkw.',
      '..kwwkwwkwwkwwk.',
      '.wwkwwkwwkwwkw..',
      '.kwwkwwkwwkwwk..',
      '..wkwwkwwkwwkww.',
      '..wwkwwkwwkwwk..',
      '.wkwwkwwkwwkww..',
      '..k.....wk..kw..',
      '................',
      '................',
      '................',
    ], { '.': null, w: '#f1eee6', k: '#1d1d1d' }),
  },
];

export const recipes = [
  {
    'minecraft:recipe_shapeless': {
      description: { identifier: 'safari:field_guide' },
      tags: ['crafting_table'],
      ingredients: [{ item: 'minecraft:book' }, { item: 'minecraft:wheat' }],
      result: { item: 'safari:field_guide' },
      unlock: [{ item: 'minecraft:book' }],
    },
  },
  {
    'minecraft:recipe_furnace': {
      description: { identifier: 'safari:cooked_game_meat' },
      tags: ['furnace', 'smoker', 'campfire', 'soul_campfire'],
      input: 'safari:raw_game_meat',
      output: 'safari:cooked_game_meat',
    },
  },
  {
    'minecraft:recipe_furnace': {
      description: { identifier: 'safari:fried_ostrich_egg' },
      tags: ['furnace', 'smoker', 'campfire', 'soul_campfire'],
      input: 'safari:ostrich_egg',
      output: 'safari:fried_ostrich_egg',
    },
  },
  {
    'minecraft:recipe_shapeless': {
      description: { identifier: 'safari:leather_from_zebra_hide' },
      tags: ['crafting_table'],
      ingredients: [{ item: 'safari:zebra_hide' }],
      result: { item: 'minecraft:leather' },
      unlock: [{ item: 'safari:zebra_hide' }],
    },
  },
];

export function buildItem(item) {
  const components = {
    'minecraft:icon': `safari_${item.id}`,
    'minecraft:display_name': { value: `item.safari:${item.id}.name` },
    'minecraft:max_stack_size': item.stack ?? 64,
  };
  if (item.food) {
    Object.assign(components, {
      'minecraft:food': { nutrition: item.food.nutrition, saturation_modifier: item.food.saturation },
      'minecraft:use_animation': 'eat',
      'minecraft:use_modifiers': { use_duration: 1.6, movement_modifier: 0.35 },
    });
  }
  Object.assign(components, item.components ?? {});
  return {
    format_version: '1.21.90',
    'minecraft:item': {
      description: { identifier: `safari:${item.id}`, menu_category: { category: item.category ?? 'items' } },
      components,
    },
  };
}
