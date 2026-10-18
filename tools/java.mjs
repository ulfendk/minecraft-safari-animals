// Generates the Java edition's resources (java/src/generated/resources) from the
// same specs as the Bedrock packs. GeckoLib reads the Bedrock geometry and
// animation formats directly, so models and animations are shared as-is.
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { NS } from '../src/lib/constants.mjs';
import { eggIcon } from '../src/lib/texture.mjs';
import { PNG } from 'pngjs';

const BEDROCK_TO_JAVA_SOUNDS = {
  'mob.horse.donkey.idle': 'entity.donkey.ambient', 'mob.horse.donkey.hit': 'entity.donkey.hurt',
  'mob.horse.donkey.death': 'entity.donkey.death', 'mob.horse.eat': 'entity.horse.eat',
  'mob.goat.ambient': 'entity.goat.ambient', 'mob.goat.hurt': 'entity.goat.hurt', 'mob.goat.death': 'entity.goat.death',
  'mob.cow.say': 'entity.cow.ambient', 'mob.cow.hurt': 'entity.cow.hurt',
  'mob.pig.say': 'entity.pig.ambient', 'mob.pig.death': 'entity.pig.death',
  'mob.hoglin.hurt': 'entity.hoglin.hurt', 'mob.hoglin.ambient': 'entity.hoglin.ambient',
  'mob.hoglin.death': 'entity.hoglin.death', 'mob.hoglin.angry': 'entity.hoglin.angry',
  'mob.polarbear.warning': 'entity.polar_bear.warning', 'mob.polarbear.hurt': 'entity.polar_bear.hurt',
  'mob.polarbear.death': 'entity.polar_bear.death',
  'mob.cat.hiss': 'entity.cat.hiss', 'mob.cat.hit': 'entity.cat.hurt', 'mob.ocelot.death': 'entity.ocelot.death',
  'mob.cat.straymeow': 'entity.cat.stray_ambient',
  'mob.fox.screech': 'entity.fox.screech', 'mob.fox.ambient': 'entity.fox.ambient', 'mob.fox.hurt': 'entity.fox.hurt',
  'mob.fox.death': 'entity.fox.death', 'mob.fox.sniff': 'entity.fox.sniff',
  'mob.wolf.hurt': 'entity.wolf.hurt', 'mob.wolf.death': 'entity.wolf.death', 'mob.wolf.bark': 'entity.wolf.ambient',
  'mob.ravager.ambient': 'entity.ravager.ambient', 'mob.ravager.hurt': 'entity.ravager.hurt',
  'mob.ravager.death': 'entity.ravager.death', 'mob.ravager.roar': 'entity.ravager.roar',
  'mob.llama.idle': 'entity.llama.ambient', 'mob.llama.hurt': 'entity.llama.hurt', 'mob.llama.death': 'entity.llama.death',
  'mob.chicken.say': 'entity.chicken.ambient', 'mob.chicken.hurt': 'entity.chicken.hurt',
  'mob.parrot.idle': 'entity.parrot.ambient', 'mob.parrot.hurt': 'entity.parrot.hurt', 'mob.parrot.death': 'entity.parrot.death',
  'mob.phantom.idle': 'entity.phantom.ambient',
  'mob.turtle.ambient': 'entity.turtle.ambient_land', 'mob.turtle.hurt': 'entity.turtle.hurt', 'mob.turtle.death': 'entity.turtle.death',
  'mob.panda.idle': 'entity.panda.ambient', 'mob.panda.hurt': 'entity.panda.hurt', 'mob.panda.death': 'entity.panda.death',
  'mob.panda.idle.aggressive': 'entity.panda.aggressive_ambient',
};
const VANILLA_PREY = new Set(['pig', 'chicken', 'parrot', 'rabbit', 'sheep', 'cow']);
const ITEM_RENAMES = { deadbush: 'dead_bush' };

const javaItem = (id) => {
  const [ns, name] = id.includes(':') ? id.split(':') : ['minecraft', id];
  return `${ns}:${ITEM_RENAMES[name] ?? name}`;
};
const javaSound = (s) => {
  if (!s) return null;
  const j = BEDROCK_TO_JAVA_SOUNDS[s];
  if (!j) throw new Error(`No Java sound mapped for Bedrock sound "${s}" (tools/java.mjs)`);
  return `minecraft:${j}`;
};

async function write(path, data) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, typeof data === 'string' || Buffer.isBuffer(data) ? data : JSON.stringify(data, null, 2) + '\n');
}

/** Turn the Bedrock-style hunting/flee families into concrete entity ids. */
function resolveTargets(families, animals) {
  const out = new Set();
  for (const f of families ?? []) {
    let matched = false;
    for (const a of animals) {
      if (a.id === f || (a.family ?? []).includes(f)) {
        out.add(`${NS}:${a.id}`);
        matched = true;
      }
    }
    if (VANILLA_PREY.has(f)) out.add(`minecraft:${f}`);
    else if (!matched && f === 'player') out.add('minecraft:player');
  }
  return [...out];
}

function hostileRule(a) {
  if (!a.hostile) return null;
  let when = 'always';
  for (const f of a.hostile.filters ?? []) {
    if (f.test === 'is_daytime') when = f.value ? 'day' : 'night';
    if (f.test === 'in_water' && f.subject === 'other') when = 'in_water';
  }
  return { range: a.hostile.range ?? 8, when };
}

/** Species data read by the Java mod at startup (dk.ulfen.safari.species.Species). */
function speciesRecord(a, animals, animNames) {
  const s = a.sounds ?? {};
  return {
    id: a.id,
    kind: a.ride ? 'mount' : 'animal',
    width: a.size[0],
    height: a.size[1],
    health: a.health,
    speed: a.speed,
    attackDamage: a.attack?.damage ?? 0,
    attackSpeed: a.attack?.speed ?? 1.3,
    leap: !!a.attack?.leap,
    knockbackResistance: a.knockbackResistance ?? 0,
    alertsPack: !!a.alertsPack,
    hunts: resolveTargets(a.hunts, animals),
    huntInterval: a.huntInterval ?? 30,
    huntRange: a.huntRange ?? 16,
    fleesFrom: resolveTargets(a.fleesFrom, animals),
    fleeDistance: a.fleeDistance ?? 12,
    fleeSpeed: a.fleeSpeed ?? 1.6,
    panicSpeed: a.panicSpeed ?? 1.5,
    hostile: hostileRule(a),
    sleeps: a.sleeps ?? 'night',
    movement: a.movement ?? 'walk',
    flySpeed: a.flySpeed ?? 0.15,
    climbs: !!a.climbs,
    fallImmune: !!a.fallImmune || a.movement === 'fly',
    grazes: !!a.grazes,
    wades: !!a.wades,
    breed: (a.breed ?? []).map(javaItem),
    tempt: (a.tempt ?? a.breed ?? []).map(javaItem),
    heal: (a.heal ?? []).map(([item, amount]) => ({ item: javaItem(item), amount })),
    variants: a.variants?.length ?? 0,
    babyScale: a.babyScale ?? 0.5,
    ride: a.ride ? {
      seats: (a.ride.seats ?? [a.ride.seat]).length,
      seatHeight: (a.ride.seats ?? [a.ride.seat])[0][1],
      chest: !!a.ride.chest,
      jump: a.ride.jump !== false,
      jumpStrength: a.ride.jumpStrength ?? 0.5,
      tameItems: (a.ride.tameItems ?? []).map(javaItem),
      temper: a.ride.temper ?? 100,
    } : null,
    sounds: {
      ambient: javaSound(s.ambient), hurt: javaSound(s.hurt), death: javaSound(s.death),
      pitchMin: (s.pitch ?? [1, 1])[0], pitchMax: (s.pitch ?? [1, 1])[1], interval: s.interval ?? 10,
    },
    animations: animNames,
    idle: a.client?.idle ?? ['idle'],
    runSpeed: a.client?.runSpeed ?? 5,
    maneRule: a.client?.visibility?.mane ? 'variant0_adult' : null,
    spawns: (a.spawn ?? []).map((sp) => ({ biomes: sp.biomes, weight: sp.weight ?? 5, min: sp.group?.[0] ?? 1, max: sp.group?.[1] ?? 1 })),
    layEgg: a.extraComponents?.['minecraft:spawn_entity'] ? javaItem(a.extraComponents['minecraft:spawn_entity'].entities.spawn_item) : null,
    scavenger: !!a.extraComponents?.['minecraft:behavior.pickup_items'],
    egg: a.egg,
  };
}

function lootTable(a) {
  return {
    type: 'minecraft:entity',
    pools: (a.loot ?? []).map((l) => ({
      rolls: 1,
      ...(l.chance ? { conditions: [{ condition: 'minecraft:random_chance', chance: l.chance }] } : {}),
      entries: [{
        type: 'minecraft:item',
        name: javaItem(l.item),
        functions: [
          { function: 'minecraft:set_count', count: { type: 'minecraft:uniform', min: l.min ?? 0, max: l.max ?? 1 } },
          ...(l.smelts ? [{ function: 'minecraft:furnace_smelt', conditions: [{ condition: 'minecraft:entity_properties', entity: 'this', predicate: { flags: { is_on_fire: true } } }] }] : []),
          { function: 'minecraft:enchanted_count_increase', enchantment: 'minecraft:looting', count: { type: 'minecraft:uniform', min: 0, max: 1 } },
        ],
      }],
    })),
  };
}

/** Bedrock recipe -> Java recipe (one or more files). */
function javaRecipes(recipe) {
  const [type, body] = Object.entries(recipe)[0];
  const name = body.description.identifier.split(':')[1];
  const result = (r) => ({ id: javaItem(r.item), count: r.count ?? 1 });
  if (type === 'minecraft:recipe_shaped') {
    return [[name, {
      type: 'minecraft:crafting_shaped',
      category: 'misc',
      pattern: body.pattern,
      key: Object.fromEntries(Object.entries(body.key).map(([k, v]) => [k, javaItem(v.item)])),
      result: result(body.result),
    }]];
  }
  if (type === 'minecraft:recipe_shapeless') {
    return [[name, {
      type: 'minecraft:crafting_shapeless',
      category: 'misc',
      ingredients: body.ingredients.flatMap((i) => Array.from({ length: i.count ?? 1 }, () => javaItem(i.item))),
      result: result(body.result),
    }]];
  }
  if (type === 'minecraft:recipe_furnace') {
    const base = { ingredient: javaItem(body.input), result: { id: javaItem(body.output) } };
    return [
      [name, { type: 'minecraft:smelting', category: 'food', ...base, experience: 0.35, cookingtime: 200 }],
      [`${name}_from_smoking`, { type: 'minecraft:smoking', category: 'food', ...base, experience: 0.35, cookingtime: 100 }],
      [`${name}_from_campfire`, { type: 'minecraft:campfire_cooking', category: 'food', ...base, experience: 0.35, cookingtime: 600 }],
    ];
  }
  throw new Error(`Unknown recipe type ${type}`);
}

/** Bedrock block geometry (per-face UV boxes and planes) -> Java block model elements. */
function blockModel(block) {
  const elements = [];
  for (const bone of block.geometry['minecraft:geometry'][0].bones) {
    for (const cube of bone.cubes) {
      const from = [cube.origin[0] + 8, cube.origin[1], cube.origin[2] + 8];
      const to = from.map((v, i) => v + cube.size[i]);
      const faces = {};
      const all = { north: 'north', south: 'south', east: 'east', west: 'west', up: 'up', down: 'down' };
      for (const f of Object.keys(cube.uv)) faces[all[f]] = { uv: [0, 0, 16, 16], texture: '#all' };
      const el = { from, to, faces };
      if (cube.rotation) {
        const axis = cube.rotation[1] ? 'y' : cube.rotation[0] ? 'x' : 'z';
        el.rotation = { origin: [8, 0, 8], axis, angle: cube.rotation[{ x: 0, y: 1, z: 2 }[axis]] };
      }
      elements.push(el);
    }
  }
  return { textures: { all: `${NS}:block/${block.id}`, particle: `${NS}:block/${block.id}` }, elements };
}

/** Vanilla-style helmet layer (64x32) for the safari hat. */
function hatLayer() {
  const png = new PNG({ width: 64, height: 32 });
  png.data.fill(0);
  const put = (x, y, c) => png.data.set(c, (y * 64 + x) * 4);
  const khaki = [201, 176, 122, 255], band = [90, 58, 30, 255], light = [216, 192, 140, 255];
  // Head box UV at (0,0), 8x8x8: top (8..16, 0..8), sides (0..32, 8..16).
  for (let y = 0; y < 8; y++) for (let x = 8; x < 16; x++) put(x, y, (x + y) % 5 ? khaki : light);
  for (let x = 0; x < 32; x++) {
    for (let y = 8; y < 11; y++) put(x, y, khaki);
    put(x, 11, band);
  }
  return PNG.sync.write(png);
}

export async function buildJava({ animals, geos, anims, textures, items, blocks, recipes, projectiles, langs, icon, OUT }) {
  const R = OUT;
  await rm(R, { recursive: true, force: true });
  const A = join(R, 'assets', NS);
  const D = join(R, 'data', NS);

  const species = [];
  for (const a of animals) {
    await write(join(A, 'geckolib', 'models', 'entity', `${a.id}.geo.json`), geos[a.id]);
    await write(join(A, 'geckolib', 'animations', 'entity', `${a.id}.animation.json`), anims[a.id]);
    await write(join(A, 'textures', 'entity', `${a.id}.png`), textures[a.id]);
    await write(join(A, 'textures', 'item', `${a.id}_spawn_egg.png`), eggIcon(a.egg[0], a.egg[1], a.id.length));
    await itemModel(A, `${a.id}_spawn_egg`, 'minecraft:item/generated');
    await write(join(D, 'loot_table', 'entities', `${a.id}.json`), lootTable(a));
    species.push(speciesRecord(a, animals, Object.keys(a.anims)));
  }
  await write(join(D, 'species.json'), species);

  // Thrown spear uses a GeckoLib model; pebbles and fruit render as flat items.
  for (const p of projectiles.filter((x) => x.rotate)) {
    await write(join(A, 'geckolib', 'models', 'entity', `${p.id}.geo.json`), geos[p.id]);
    await write(join(A, 'textures', 'entity', `${p.id}.png`), textures[p.id]);
    await write(join(A, 'geckolib', 'animations', 'entity', `${p.id}.animation.json`), { format_version: '1.8.0', animations: { [`animation.safari.${p.id}.idle`]: { loop: true, bones: {} } } });
  }

  for (const item of items) {
    await write(join(A, 'textures', 'item', `${item.id}.png`), item.icon);
    const handheld = /spear|club|knife|sling/.test(item.id);
    await itemModel(A, item.id, handheld ? 'minecraft:item/handheld' : 'minecraft:item/generated');
  }
  await write(join(A, 'textures', 'entity', 'equipment', 'humanoid', 'safari_hat.png'), hatLayer());
  await write(join(A, 'equipment', 'safari_hat.json'), { layers: { humanoid: [{ texture: `${NS}:safari_hat` }] } });

  for (const block of blocks) {
    await write(join(A, 'textures', 'block', `${block.id}.png`), block.texture);
    await write(join(A, 'models', 'block', `${block.id}.json`), blockModel(block));
    await write(join(A, 'blockstates', `${block.id}.json`), { variants: { '': { model: `${NS}:block/${block.id}` } } });
    await write(join(A, 'models', 'item', `${block.id}.json`), { parent: `${NS}:block/${block.id}` });
    await write(join(A, 'items', `${block.id}.json`), { model: { type: 'minecraft:model', model: `${NS}:item/${block.id}` } });
    await write(join(D, 'loot_table', 'blocks', `${block.id}.json`), {
      type: 'minecraft:block',
      pools: [{ rolls: 1, entries: [{ type: 'minecraft:item', name: `${NS}:${block.id}` }], conditions: [{ condition: 'minecraft:survives_explosion' }] }],
    });
  }

  for (const recipe of recipes) for (const [name, body] of javaRecipes(recipe)) await write(join(D, 'recipe', `${name}.json`), body);

  // World generation (added to biomes by dk.ulfen.safari.world.SafariWorldgen). 26.x format:
  // worldgen/feature (no "config" wrapper) + placed_feature with count/offset/filter for patches.
  const W = join(D, 'worldgen');
  await write(join(W, 'feature', 'thorn_bush.json'), { type: 'minecraft:simple_block', to_place: { id: `${NS}:thorn_bush` } });
  await write(join(W, 'feature', 'termite_mound.json'), { type: 'minecraft:simple_block', to_place: { id: `${NS}:termite_mound` } });
  await write(join(W, 'feature', 'watering_hole_plants.json'), { type: 'minecraft:simple_block', to_place: { id: 'minecraft:seagrass' } });
  await write(join(W, 'feature', 'watering_hole.json'), {
    type: 'minecraft:waterlogged_vegetation_patch',
    depth: 2, extra_bottom_block_chance: 0.3, extra_edge_column_chance: 0.4,
    ground_state: { id: 'minecraft:mud' },
    replaceable: '#minecraft:dirt',
    surface: 'floor',
    vegetation_chance: 0.2,
    vegetation_feature: { feature: `${NS}:watering_hole_plants`, placement: [] },
    vertical_range: 5,
    xz_radius: { type: 'minecraft:uniform', min_inclusive: 3, max_inclusive: 6 },
  });
  const trapezoid = (r) => ({ type: 'minecraft:trapezoid', min: -r, max: r, plateau: 0 });
  const patch = (feature, rarity, count, below) => ({
    feature: `${NS}:${feature}`,
    placement: [
      { type: 'minecraft:rarity_filter', chance: rarity },
      { type: 'minecraft:in_square' },
      { type: 'minecraft:heightmap', heightmap: 'MOTION_BLOCKING_NO_LEAVES' },
      { type: 'minecraft:biome' },
      { type: 'minecraft:count', count },
      { type: 'minecraft:offset', x: trapezoid(4), y: trapezoid(1), z: trapezoid(4) },
      {
        type: 'minecraft:block_predicate_filter',
        predicate: { type: 'minecraft:all_of', predicates: [
          { type: 'minecraft:matching_block_tag', tag: 'minecraft:air' },
          { type: 'minecraft:matching_blocks', blocks: below, offset: [0, -1, 0] },
        ] },
      },
    ],
  });
  await write(join(W, 'placed_feature', 'thorn_bush.json'), patch('thorn_bush', 4, 6, ['minecraft:grass_block', 'minecraft:coarse_dirt', 'minecraft:dirt']));
  await write(join(W, 'placed_feature', 'termite_mound.json'), patch('termite_mound', 8, 2, ['minecraft:grass_block', 'minecraft:coarse_dirt', 'minecraft:dirt', 'minecraft:sand', 'minecraft:red_sand']));
  await write(join(W, 'placed_feature', 'watering_hole.json'), {
    feature: `${NS}:watering_hole`,
    placement: [
      { type: 'minecraft:rarity_filter', chance: 40 },
      { type: 'minecraft:in_square' },
      { type: 'minecraft:heightmap', heightmap: 'WORLD_SURFACE_WG' },
      { type: 'minecraft:biome' },
    ],
  });

  // Language files: Bedrock keys -> Java keys.
  for (const [locale, entries] of Object.entries(langs)) {
    const out = {};
    for (const [k, v] of entries) {
      let m;
      if ((m = k.match(/^entity\.safari:(.+)\.name$/))) out[`entity.${NS}.${m[1]}`] = v;
      else if ((m = k.match(/^item\.spawn_egg\.entity\.safari:(.+)\.name$/))) out[`item.${NS}.${m[1]}_spawn_egg`] = v;
      else if ((m = k.match(/^item\.safari:(.+)\.name$/))) out[`item.${NS}.${m[1]}`] = v;
      else if ((m = k.match(/^tile\.safari:(.+)\.name$/))) out[`block.${NS}.${m[1]}`] = v;
      else if (k.startsWith('safari.')) out[k] = v.replace(/%s/g, '%s');
    }
    out[`itemGroup.${NS}`] = locale === 'da_DK' ? 'Safaridyr' : 'Safari Animals';
    await write(join(A, 'lang', `${locale.toLowerCase()}.json`), out);
  }

  await write(join(A, 'icon.png'), icon);
  return species.length;
}

async function itemModel(A, id, parent) {
  await write(join(A, 'models', 'item', `${id}.json`), { parent, textures: { layer0: `${NS}:item/${id}` } });
  await write(join(A, 'items', `${id}.json`), { model: { type: 'minecraft:model', model: `${NS}:item/${id}` } });
}
