// Generates the behavior pack and resource pack into build/.
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { animationFile } from '../src/lib/anim.mjs';
import { buildEntity, buildLoot, buildSpawnRules } from '../src/lib/behavior.mjs';
import { buildAnimationControllers, buildClientEntity, buildEntitySounds, buildRenderController } from '../src/lib/client.mjs';
import { MIN_ENGINE, NS, PACK_NAME, SCRIPT_SERVER_VERSION, SCRIPT_UI_VERSION } from '../src/lib/constants.mjs';
import { packIcon } from '../src/lib/icon.mjs';
import { langEntries, LOCALES, missingFoods } from '../src/lang.mjs';
import { guideEntry } from '../src/lib/info.mjs';
import { render } from './render.mjs';
import { buildGeometry } from '../src/lib/model.mjs';
import { paintTexture } from '../src/lib/texture.mjs';
import { buildItem, items, recipes } from '../src/items.mjs';
import { blockRecipes, blocks, features } from '../src/blocks.mjs';
import { buildHelper, buildHelperClient, buildProjectile, buildProjectileClient, helpers, projectiles } from '../src/projectiles.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'build');
const BP = join(OUT, 'behavior_pack');
const RP = join(OUT, 'resource_pack');

const UUID = {
  bpHeader: 'bf2d1a44-eb31-4911-a111-df986604b39c',
  bpData: 'ceb65b60-760e-46a9-a4b6-5a4ae8d2ad7b',
  bpScript: 'd0e2e917-6506-4570-9eed-9f1801c37fb4',
  rpHeader: '56fe0bb8-e44f-4d12-a3cb-1f50ba14da36',
  rpResources: 'e54d5458-75aa-4df1-8caf-22267358bd6f',
};

const textureCache = new WeakMap();
async function paintTextureCached(geo, a) {
  if (!textureCache.has(a)) textureCache.set(a, paintTexture(geo, a.materials));
  return textureCache.get(a);
}

async function write(path, data) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, typeof data === 'string' || Buffer.isBuffer(data) ? data : JSON.stringify(data, null, 2) + '\n');
}

export async function loadAnimals() {
  const dir = join(ROOT, 'src', 'animals');
  const files = (await readdir(dir)).filter((f) => f.endsWith('.mjs')).sort();
  const animals = [];
  for (const f of files) {
    const mod = await import(pathToFileURL(join(dir, f)).href);
    animals.push(mod.default);
  }
  linkFoodWeb(animals);
  return animals;
}

/** Prey automatically flees from every species that hunts it. */
function linkFoodWeb(animals) {
  for (const prey of animals) {
    const families = new Set([prey.id, ...(prey.family ?? [])]);
    const hunters = animals.filter((p) => p !== prey && (p.hunts ?? []).some((h) => families.has(h)));
    prey.fleesFrom = [...new Set([...(prey.fleesFrom ?? []), ...hunters.map((h) => h.id)])];
  }
}

function manifests(version) {
  const v = version.split('.').map(Number);
  const bp = {
    format_version: 2,
    header: {
      name: `${PACK_NAME} v${version} (Behavior)`,
      description: 'pack.description',
      uuid: UUID.bpHeader,
      version: v,
      min_engine_version: MIN_ENGINE,
    },
    modules: [
      { type: 'data', uuid: UUID.bpData, version: v },
      { type: 'script', language: 'javascript', uuid: UUID.bpScript, version: v, entry: 'scripts/main.js' },
    ],
    dependencies: [
      { uuid: UUID.rpHeader, version: v },
      { module_name: '@minecraft/server', version: SCRIPT_SERVER_VERSION },
      { module_name: '@minecraft/server-ui', version: SCRIPT_UI_VERSION },
    ],
    metadata: { authors: ['Safari Animals contributors'], license: 'MIT' },
  };
  const rp = {
    format_version: 2,
    header: {
      name: `${PACK_NAME} v${version} (Resources)`,
      description: 'pack.description',
      uuid: UUID.rpHeader,
      version: v,
      min_engine_version: MIN_ENGINE,
    },
    modules: [{ type: 'resources', uuid: UUID.rpResources, version: v }],
    dependencies: [{ uuid: UUID.bpHeader, version: v }],
    metadata: { authors: ['Safari Animals contributors'], license: 'MIT' },
  };
  return { bp, rp };
}

export async function build({ quiet = false } = {}) {
  const pkg = JSON.parse(await readFile(join(ROOT, 'package.json'), 'utf8'));
  await rm(BP, { recursive: true, force: true });
  await rm(RP, { recursive: true, force: true });

  // Hand-written files first; generated files may add to the same folders.
  await cp(join(ROOT, 'src', 'packs', 'behavior_pack'), BP, { recursive: true });
  await cp(join(ROOT, 'src', 'packs', 'resource_pack'), RP, { recursive: true });

  const { bp, rp } = manifests(pkg.version);
  await write(join(BP, 'manifest.json'), bp);
  await write(join(RP, 'manifest.json'), rp);
  const icon = packIcon();
  await write(join(BP, 'pack_icon.png'), icon);
  await write(join(RP, 'pack_icon.png'), icon);

  const animals = await loadAnimals();
  const entitySounds = {};
  const report = [];

  for (const a of animals) {
    // Behavior
    await write(join(BP, 'entities', `${a.id}.json`), buildEntity(a));
    await write(join(BP, 'spawn_rules', `${a.id}.json`), buildSpawnRules(a));
    await write(join(BP, 'loot_tables', 'entities', `${NS}_${a.id}.json`), buildLoot(a));

    // Model + texture
    const geo = buildGeometry(`geometry.safari.${a.id}`, a.model);
    await write(join(RP, 'models', 'entity', `${a.id}.geo.json`), geo.geometry);
    await write(join(RP, 'textures', 'entity', NS, `${a.id}.png`), await paintTextureCached(geo, a));
    for (const v of a.variants ?? []) {
      if (v.texture) {
        await write(join(RP, 'textures', 'entity', NS, `${a.id}_${v.texture}.png`), paintTexture(geo, { ...a.materials, ...v.materials }));
      }
    }

    // Animation
    const animNames = Object.keys(a.anims);
    await write(join(RP, 'animations', `${a.id}.animation.json`), animationFile(a.id, a.anims));
    await write(join(RP, 'animation_controllers', `${a.id}.animation_controllers.json`), buildAnimationControllers(a, animNames));
    await write(join(RP, 'entity', `${a.id}.entity.json`), buildClientEntity(a, animNames, a.egg));
    const boneNames = a.model.bones.map((b) => b.name);
    await write(join(RP, 'render_controllers', `${a.id}.render_controllers.json`), buildRenderController(a, boneNames));

    // Portrait for the Field Guide.
    const hidden = new Set(['saddle', 'chest']);
    await write(join(RP, 'textures', 'ui', NS, `${a.id}.png`), render(geo.geometry, await paintTextureCached(geo, a), { yaw: 35, size: 64, hidden }));

    entitySounds[`${NS}:${a.id}`] = buildEntitySounds(a);
    report.push(`${a.id} (${geo.width}x${geo.height})`);
  }

  // Projectiles
  for (const p of projectiles) {
    const geo = buildGeometry(`geometry.safari.${p.id}`, p.model);
    await write(join(BP, 'entities', `${p.id}.json`), buildProjectile(p));
    await write(join(RP, 'entity', `${p.id}.entity.json`), buildProjectileClient(p));
    await write(join(RP, 'models', 'entity', `${p.id}.geo.json`), geo.geometry);
    await write(join(RP, 'textures', 'entity', NS, `${p.id}.png`), paintTexture(geo, p.materials));
    await write(join(RP, 'render_controllers', `${p.id}.render_controllers.json`), {
      format_version: '1.8.0',
      render_controllers: { [`controller.render.safari.${p.id}`]: { geometry: 'Geometry.default', materials: [{ '*': 'Material.default' }], textures: ['Texture.default'] } },
    });
  }

  for (const h of helpers) {
    const geo = buildGeometry(`geometry.safari.${h.id}`, { bones: [{ name: 'root', pivot: [0, 0, 0], cubes: [{ origin: [0, 0, 0], size: [0, 0, 0], mat: 'none' }] }] });
    await write(join(BP, 'entities', `${h.id}.json`), buildHelper(h));
    await write(join(RP, 'entity', `${h.id}.entity.json`), buildHelperClient(h));
    await write(join(RP, 'models', 'entity', `${h.id}.geo.json`), geo.geometry);
    await write(join(RP, 'textures', 'entity', NS, `${h.id}.png`), paintTexture(geo, { none: '#00000000' }));
    await write(join(RP, 'render_controllers', `${h.id}.render_controllers.json`), {
      format_version: '1.8.0',
      render_controllers: { [`controller.render.safari.${h.id}`]: { geometry: 'Geometry.default', materials: [{ '*': 'Material.default' }], textures: ['Texture.default'] } },
    });
  }

  // Animal data for the scripts (Field Guide, behaviours).
  const data = animals.map(guideEntry);
  await write(join(BP, 'scripts', 'data.js'), `// Generated by tools/build.mjs\nexport const ANIMALS = ${JSON.stringify(data, null, 2)};\n`);

  // Items
  const itemTextures = {};
  for (const item of items) {
    await write(join(BP, 'items', `${item.id}.json`), buildItem(item));
    await write(join(RP, 'textures', 'items', NS, `${item.id}.png`), item.icon);
    itemTextures[`${NS}_${item.id}`] = { textures: `textures/items/${NS}/${item.id}` };
    if (item.attachable) {
      // Worn items: a 3D model attached to the player.
      const geo = buildGeometry(`geometry.safari.${item.id}`, item.attachable.model);
      await write(join(RP, 'models', 'entity', `${item.id}.geo.json`), geo.geometry);
      await write(join(RP, 'textures', 'models', 'armor', `${NS}_${item.id}.png`), paintTexture(geo, item.attachable.materials));
      await write(join(RP, 'attachables', `${item.id}.json`), {
        format_version: '1.10.0',
        'minecraft:attachable': {
          description: {
            identifier: `${NS}:${item.id}`,
            materials: { default: 'armor', enchanted: 'armor_enchanted' },
            textures: { default: `textures/models/armor/${NS}_${item.id}`, enchanted: 'textures/misc/enchanted_item_glint' },
            geometry: { default: `geometry.safari.${item.id}` },
            scripts: { parent_setup: 'variable.helmet_layer_visible = 0.0;' },
            render_controllers: ['controller.render.armor'],
          },
        },
      });
    }
  }
  // Blocks
  const terrain = {};
  const blockSounds = { format_version: [1, 1, 0] };
  for (const block of blocks) {
    await write(join(BP, 'blocks', `${block.id}.json`), block.definition);
    await write(join(RP, 'models', 'blocks', `${block.id}.geo.json`), block.geometry);
    await write(join(RP, 'textures', 'blocks', NS, `${block.id}.png`), block.texture);
    terrain[`${NS}_${block.id}`] = { textures: `textures/blocks/${NS}/${block.id}` };
    blockSounds[`${NS}:${block.id}`] = { sound: block.sound ?? 'stone' };
  }
  await write(join(RP, 'textures', 'terrain_texture.json'), {
    resource_pack_name: 'safari', texture_name: 'atlas.terrain', padding: 8, num_mip_levels: 4, texture_data: terrain,
  });
  await write(join(RP, 'blocks.json'), blockSounds);
  for (const [path, body] of Object.entries(features)) await write(join(BP, path), body);

  for (const recipe of [...recipes, ...blockRecipes]) {
    const body = Object.values(recipe)[0];
    const name = body.description.identifier.split(':')[1];
    await write(join(BP, 'recipes', `${name}.json`), { format_version: '1.12', ...recipe });
  }
  await write(join(RP, 'textures', 'item_texture.json'), {
    resource_pack_name: 'safari',
    texture_name: 'atlas.items',
    texture_data: itemTextures,
  });

  // Sounds: entity events point at vanilla sound definitions.
  await write(join(RP, 'sounds.json'), { entity_sounds: { entities: entitySounds } });

  // Language
  const missing = missingFoods(animals);
  if (missing.length) throw new Error(`Add translations for these foods in src/lang.mjs: ${missing.join(', ')}`);
  for (const locale of LOCALES) {
    const entries = langEntries(locale, {
      animals, items, blocks, extraEntities: [...projectiles, ...helpers], description: pkg.description, version: pkg.version,
    });
    const text = entries.map(([k, v]) => `${k}=${v}`).join('\n') + '\n';
    for (const pack of [BP, RP]) await write(join(pack, 'texts', `${locale}.lang`), text);
  }
  for (const pack of [BP, RP]) await write(join(pack, 'texts', 'languages.json'), LOCALES);

  if (!quiet) console.log(`Built ${animals.length} animals: ${report.join(', ')}\nItems: ${items.map((i) => i.id).join(', ')}`);
  return { animals, version: pkg.version };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  build().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
