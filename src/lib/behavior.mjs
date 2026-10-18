// Animal spec -> Bedrock behavior-pack files (entity, spawn rules, loot table).
import { NS } from './constants.mjs';

const fam = (value) => ({ test: 'is_family', subject: 'other', value });
const anyFamily = (list) => (list.length === 1 ? fam(list[0]) : { any_of: list.map(fam) });

const BIOME_TAGS = {
  savanna: 'savanna',
  jungle: 'jungle',
  desert: 'desert',
  swamp: 'swamp',
  mangrove: 'mangrove_swamp',
  river: 'river',
  beach: 'beach',
  mesa: 'mesa',
  plains: 'plains',
};

/** Prefix vanilla items with minecraft: and our own with the namespace. */
export const itemId = (name) => (name.includes(':') ? name : `minecraft:${name}`);

function baseComponents(a) {
  const c = {
    'minecraft:is_hidden_when_invisible': {},
    'minecraft:type_family': { family: [a.id, 'safari', a.role, ...(a.family ?? []), 'mob'] },
    'minecraft:collision_box': { width: a.size[0], height: a.size[1] },
    'minecraft:health': { value: a.health, max: a.health },
    'minecraft:movement': { value: a.speed },
    'minecraft:jump.static': {},
    'minecraft:nameable': {},
    'minecraft:physics': {},
    'minecraft:pushable': { is_pushable: true, is_pushable_by_piston: true },
    'minecraft:leashable': {},
    'minecraft:balloonable': { mass: Math.min(2, a.size[0] * a.size[1]) },
    'minecraft:despawn': { despawn_from_distance: {} },
    'minecraft:conditional_bandwidth_optimization': {},
    'minecraft:hurt_on_condition': {
      damage_conditions: [{ filters: { test: 'in_lava', subject: 'self' }, cause: 'lava', damage_per_tick: 4 }],
    },
    'minecraft:behavior.random_look_around': { priority: 10 },
    'minecraft:behavior.look_at_player': { priority: 9, look_distance: 8, probability: 0.02 },
  };

  if (a.sounds?.ambient) {
    c['minecraft:ambient_sound_interval'] = { event_name: 'ambient', range: 16, value: a.sounds.interval ?? 10 };
  }
  if (a.fallImmune) {
    c['minecraft:damage_sensor'] = { triggers: [{ cause: 'fall', deals_damage: 'no' }] };
  }
  if (a.knockbackResistance) {
    c['minecraft:knockback_resistance'] = { value: a.knockbackResistance };
  }

  // Movement type
  switch (a.movement ?? 'walk') {
    case 'fly':
      // Parrot-style flight: flies around, lands on the ground and in trees.
      Object.assign(c, {
        'minecraft:movement.fly': {},
        'minecraft:flying_speed': { value: a.flySpeed ?? 0.15 },
        'minecraft:can_fly': {},
        'minecraft:navigation.fly': { can_path_from_air: true, can_path_over_water: true, avoid_damage_blocks: true },
        'minecraft:damage_sensor': { triggers: [{ cause: 'fall', deals_damage: 'no' }] },
        'minecraft:breathable': { total_supply: 15, suffocate_time: 0 },
        'minecraft:behavior.float': { priority: 0 },
        'minecraft:behavior.random_fly': { priority: 8, can_land_on_trees: true, avoid_damage_blocks: true, xz_dist: 24, y_dist: 8, y_offset: 2, speed_multiplier: 1.0 },
      });
      break;
    case 'amphibious':
      Object.assign(c, {
        'minecraft:movement.amphibious': { max_turn: 10 },
        'minecraft:navigation.generic': { is_amphibious: true, can_path_over_water: false, can_swim: true, can_walk: true, can_breach: true, can_sink: false, avoid_damage_blocks: true },
        'minecraft:underwater_movement': { value: a.swimSpeed ?? 0.15 },
        'minecraft:breathable': { total_supply: 300, suffocate_time: 0, breathes_air: true, breathes_water: true },
        'minecraft:buoyant': { base_buoyancy: 1.0, apply_gravity: true, simulate_waves: false, liquid_blocks: ['minecraft:water', 'minecraft:flowing_water'] },
        'minecraft:behavior.random_stroll': { priority: 8, speed_multiplier: 0.8 },
        'minecraft:behavior.random_swim': { priority: 8, speed_multiplier: 1.0, xz_dist: 10, y_dist: 3, interval: 80 },
        'minecraft:behavior.move_to_water': { priority: 7, search_range: 16, search_height: 5, search_count: 1, goal_radius: 0.1 },
      });
      break;
    default:
      Object.assign(c, {
        'minecraft:movement.basic': {},
        'minecraft:navigation.walk': {
          can_path_over_water: true, avoid_water: !a.wades, avoid_damage_blocks: true, can_walk_in_lava: false,
        },
        'minecraft:breathable': { total_supply: 15, suffocate_time: 0 },
        'minecraft:behavior.float': { priority: 0 },
        'minecraft:behavior.random_stroll': { priority: 8, speed_multiplier: 0.8, xz_dist: a.strollRange ?? 10 },
      });
      if (a.climbs) c['minecraft:can_climb'] = {};
      if (a.movement === 'hop') {
        // Rabbit-style hopping.
        delete c['minecraft:movement.basic'];
        delete c['minecraft:jump.static'];
        c['minecraft:movement.skip'] = {};
        c['minecraft:jump.dynamic'] = {
          regular_skip_data: { distance_scale: 1.2, height: 0.35, jump_delay: 8, animation_duration: 12 },
          fast_skip_data: { distance_scale: 2.4, height: 0.3, jump_delay: 1, animation_duration: 10 },
        };
      }
  }

  // Prey runs from the animals that hunt it.
  if (a.fleesFrom?.length) {
    c['minecraft:behavior.avoid_mob_type'] = {
      priority: 3,
      remove_target: true,
      entity_types: [{
        filters: anyFamily(a.fleesFrom),
        max_dist: a.fleeDistance ?? 12,
        walk_speed_multiplier: 1.3,
        sprint_speed_multiplier: a.fleeSpeed ?? 1.6,
      }],
    };
  }

  // How it reacts when hurt.
  if (a.attack) {
    c['minecraft:attack'] = { damage: a.attack.damage, ...(a.attack.effect ? { effect_name: a.attack.effect, effect_duration: 4 } : {}) };
    c['minecraft:behavior.melee_box_attack'] = {
      priority: 3,
      speed_multiplier: a.attack.speed ?? 1.3,
      track_target: true,
      cooldown_time: a.attack.cooldown ?? 1.0,
    };
    c['minecraft:behavior.hurt_by_target'] = { priority: 1, alert_same_type: !!a.alertsPack, hurt_owner: false };
    if (a.attack.leap) c['minecraft:behavior.leap_at_target'] = { priority: 2, yd: 0.4, must_be_on_ground: true, target_dist: 0.4 };
  } else {
    c['minecraft:behavior.panic'] = { priority: 1, speed_multiplier: a.panicSpeed ?? 1.5 };
  }

  if (a.tempt?.length) {
    c['minecraft:behavior.tempt'] = { priority: 4, speed_multiplier: 1.1, items: a.tempt.map(itemId), can_tempt_vertically: true };
  }
  if (a.grazes) {
    c['minecraft:behavior.eat_block'] = {
      priority: 7,
      success_chance: 'query.is_baby ? 0.02 : 0.001',
      time_until_eat: 1.8,
      eat_and_replace_block_pairs: [
        { eat_block: 'minecraft:short_grass', replace_block: 'minecraft:air' },
        { eat_block: 'minecraft:grass_block', replace_block: 'minecraft:dirt' },
      ],
      on_eat: { event: `${NS}:on_eat`, target: 'self' },
    };
  }
  if (a.heal?.length) {
    c['minecraft:healable'] = { items: a.heal.map(([item, amount]) => ({ item: itemId(item), heal_amount: amount })) };
  }

  return c;
}

/** Component groups shared by every species: baby/adult and the day/night schedule. */
function lifeGroups(a) {
  const breedItems = (a.breed ?? []).map(itemId);
  const groups = {
    [`${NS}:baby`]: {
      'minecraft:is_baby': {},
      'minecraft:scale': { value: a.babyScale ?? 0.5 },
      'minecraft:ageable': {
        duration: 1200,
        feed_items: breedItems.map((item) => ({ item, growth: 0.1 })),
        grow_up: { event: `${NS}:grow_up`, target: 'self' },
      },
      'minecraft:behavior.follow_parent': { priority: 5, speed_multiplier: 1.1 },
    },
    [`${NS}:adult`]: {
      'minecraft:experience_reward': { on_bred: 'Math.Random(1,7)', on_death: `query.last_hit_by_player ? Math.Random(1,${a.xp ?? 3}) : 0` },
      'minecraft:loot': { table: `loot_tables/entities/${NS}_${a.id}.json` },
    },
  };
  if (breedItems.length && !a.ride) {
    Object.assign(groups[`${NS}:adult`], {
      'minecraft:breedable': {
        require_tame: false,
        breeds_with: { mate_type: `${NS}:${a.id}`, baby_type: `${NS}:${a.id}`, breed_event: { event: `${NS}:entity_born`, target: 'baby' } },
        breed_items: breedItems,
      },
      'minecraft:behavior.breed': { priority: 2, speed_multiplier: 1.0 },
    });
  }

  // Active hours: hunting and roaming. Resting hours: napping (shown with the sleep animation).
  const active = {};
  const resting = {};
  if (a.hunts?.length) {
    active['minecraft:behavior.nearest_attackable_target'] = {
      priority: 5,
      must_see: true,
      reselect_targets: true,
      attack_interval: a.huntInterval ?? 30,
      entity_types: [{
        filters: anyFamily(a.hunts),
        max_dist: a.huntRange ?? 16,
      }],
    };
  }
  if (a.hostile) {
    // Hostile to players (optionally only at night or near water), never in peaceful.
    const playerTarget = {
      filters: { all_of: [fam('player'), ...(a.hostile.filters ?? [])] },
      max_dist: a.hostile.range ?? 10,
    };
    const tgt = active['minecraft:behavior.nearest_attackable_target'];
    if (tgt) tgt.entity_types.push(playerTarget);
    else active['minecraft:behavior.nearest_attackable_target'] = { priority: 5, must_see: true, reselect_targets: true, entity_types: [playerTarget] };
  }

  const sleeps = a.sleeps ?? 'night';
  if (sleeps !== 'never') {
    resting['minecraft:behavior.nap'] = {
      priority: 6,
      cooldown_min: 4,
      cooldown_max: 12,
      mob_detect_dist: 10,
      mob_detect_height: 4,
      can_nap_filters: {
        all_of: [
          { test: 'in_water', subject: 'self', operator: '==', value: false },
          { test: 'on_ground', subject: 'self', operator: '==', value: true },
          { test: 'is_riding', subject: 'self', operator: '==', value: false },
          { test: 'has_target', subject: 'self', operator: '==', value: false },
        ],
      },
      wake_mob_exceptions: { any_of: [fam(a.id), { test: 'is_sneaking', subject: 'other', operator: '==', value: true }] },
    };
  }
  groups[`${NS}:active`] = active;
  groups[`${NS}:resting`] = resting;
  return groups;
}

/** Horse-style taming and riding (zebra, ostrich, elephant). */
function rideGroups(a) {
  const r = a.ride;
  const seats = (r.seats ?? [r.seat]).map((position) => ({
    position,
    min_rider_count: 0,
    max_rider_count: (r.seats ?? [r.seat]).length,
  }));
  const feed = (r.tameItems ?? a.tempt ?? []).map((item) => ({ item: itemId(item), temper_mod: 4 }));
  const breedItems = (a.breed ?? []).map(itemId);
  return {
    [`${NS}:wild`]: {
      'minecraft:rideable': {
        seat_count: 1,
        family_types: ['player'],
        interact_text: 'action.interact.mount',
        seats: { position: seats[0].position },
      },
      'minecraft:behavior.mount_pathing': { priority: 2, speed_multiplier: 1.5, target_dist: 0, track_target: true },
      'minecraft:tamemount': {
        min_temper: 0,
        max_temper: r.temper ?? 100,
        feed_text: 'action.interact.feed',
        ride_text: 'action.interact.mount',
        feed_items: feed,
        auto_reject_items: [{ item: 'minecraft:saddle' }],
        tame_event: { event: `${NS}:on_tame`, target: 'self' },
      },
    },
    [`${NS}:tamed`]: {
      'minecraft:is_tamed': {},
      'minecraft:rideable': {
        seat_count: seats.length,
        crouching_skip_interact: true,
        family_types: ['player'],
        interact_text: 'action.interact.ride.horse',
        seats,
      },
      'minecraft:interact': {
        interactions: [
          {
            on_interact: {
              filters: { all_of: [
                { test: 'has_equipment', subject: 'self', domain: 'inventory', operator: 'not', value: 'saddle' },
                { test: 'has_equipment', subject: 'other', domain: 'hand', value: 'saddle' },
                { test: 'is_sneak_held', subject: 'other', value: false },
              ] },
              target: 'self',
            },
            equip_item_slot: '0',
            interact_text: 'action.interact.saddle',
          },
          ...(r.chest ? [{
            on_interact: {
              filters: { all_of: [
                { test: 'has_component', subject: 'self', operator: '!=', value: 'minecraft:is_chested' },
                { test: 'has_equipment', subject: 'other', domain: 'hand', value: 'chest' },
                { test: 'is_sneak_held', subject: 'other', value: false },
              ] },
              event: `${NS}:on_chest`,
              target: 'self',
            },
            use_item: true,
            play_sounds: 'armor.equip_generic',
            interact_text: 'action.interact.attachchest',
          }] : []),
        ],
      },
      'minecraft:inventory': { inventory_size: 2, container_type: 'horse' },
      ...(breedItems.length ? {
        'minecraft:breedable': {
          require_tame: true,
          breeds_with: { mate_type: `${NS}:${a.id}`, baby_type: `${NS}:${a.id}`, breed_event: { event: `${NS}:entity_born`, target: 'baby' } },
          breed_items: breedItems,
        },
        'minecraft:behavior.breed': { priority: 2, speed_multiplier: 1.0 },
      } : {}),
    },
    [`${NS}:saddled`]: {
      'minecraft:is_saddled': {},
      'minecraft:input_ground_controlled': {},
      ...(r.jump === false ? {} : { 'minecraft:can_power_jump': {} }),
      'minecraft:behavior.player_ride_tamed': {},
    },
    ...(r.chest ? {
      [`${NS}:chested`]: {
        'minecraft:is_chested': {},
        'minecraft:inventory': { inventory_size: 16, container_type: 'horse' },
      },
    } : {}),
  };
}

export function buildEntity(a) {
  const components = baseComponents(a);
  const groups = { ...lifeGroups(a), ...(a.ride ? rideGroups(a) : {}), ...(a.extraGroups ?? {}) };

  if (a.ride) {
    components['minecraft:equippable'] = {
      slots: [{
        slot: 0, item: 'saddle', accepted_items: ['saddle'],
        on_equip: { event: `${NS}:saddled` }, on_unequip: { event: `${NS}:unsaddled` },
      }],
    };
    if (a.ride.jumpStrength) components['minecraft:horse.jump_strength'] = { value: a.ride.jumpStrength };
  }

  // Swap between active and resting at dawn/dusk.
  const sleeps = a.sleeps ?? 'night';
  const activeByDay = sleeps !== 'day';
  components['minecraft:environment_sensor'] = {
    triggers: [
      { filters: { test: 'is_daytime', value: activeByDay }, event: `${NS}:become_active` },
      { filters: { test: 'is_daytime', value: !activeByDay }, event: `${NS}:become_resting` },
    ],
  };

  Object.assign(components, a.extraComponents ?? {});

  const adult = [`${NS}:adult`, ...(a.ride ? [`${NS}:wild`] : [])];
  const events = {
    'minecraft:entity_spawned': {
      sequence: [
        {
          randomize: [
            { weight: 85, add: { component_groups: adult } },
            { weight: 15, add: { component_groups: [`${NS}:baby`] } },
          ],
        },
        { add: { component_groups: [`${NS}:active`] } },
        ...(a.variants ? [{ randomize: a.variants.map((v, i) => ({ weight: v.weight ?? 1, add: { component_groups: [`${NS}:variant_${i}`] } })) }] : []),
      ],
    },
    [`${NS}:entity_born`]: { add: { component_groups: [`${NS}:baby`, `${NS}:active`] } },
    [`${NS}:spawn_adult`]: { add: { component_groups: [...adult, `${NS}:active`] } },
    [`${NS}:grow_up`]: { remove: { component_groups: [`${NS}:baby`] }, add: { component_groups: adult } },
    [`${NS}:become_active`]: { remove: { component_groups: [`${NS}:resting`] }, add: { component_groups: [`${NS}:active`] } },
    [`${NS}:become_resting`]: { remove: { component_groups: [`${NS}:active`] }, add: { component_groups: [`${NS}:resting`] } },
    [`${NS}:on_eat`]: {},
  };
  if (a.ride) {
    Object.assign(events, {
      [`${NS}:on_tame`]: { remove: { component_groups: [`${NS}:wild`] }, add: { component_groups: [`${NS}:tamed`] } },
      [`${NS}:saddled`]: { add: { component_groups: [`${NS}:saddled`] } },
      [`${NS}:unsaddled`]: { remove: { component_groups: [`${NS}:saddled`] } },
      [`${NS}:spawn_tame`]: { add: { component_groups: [`${NS}:adult`, `${NS}:tamed`, `${NS}:active`] } },
    });
    if (a.ride.chest) events[`${NS}:on_chest`] = { add: { component_groups: [`${NS}:chested`] } };
  }
  if (a.variants) {
    a.variants.forEach((v, i) => {
      groups[`${NS}:variant_${i}`] = { 'minecraft:variant': { value: i } };
      events[`${NS}:make_variant_${i}`] = { add: { component_groups: [`${NS}:variant_${i}`] } };
    });
  }
  Object.assign(events, a.extraEvents ?? {});

  return {
    format_version: '1.21.90',
    'minecraft:entity': {
      description: {
        identifier: `${NS}:${a.id}`,
        spawn_category: 'creature',
        is_spawnable: true,
        is_summonable: true,
        ...(a.properties ? { properties: a.properties } : {}),
      },
      component_groups: groups,
      components,
      events,
    },
  };
}

/** Herd spawning. Variant species spawn single-variant herds unless `herdEvent` says otherwise. */
function herd(a, s) {
  const size = { min_size: s.group?.[0] ?? 1, max_size: s.group?.[1] ?? 1 };
  if (s.herdEvent) return { ...size, event: s.herdEvent.event, event_skip_count: s.herdEvent.skip ?? 0 };
  if (a.variants && !a.variantsMixed) return a.variants.map((v, i) => ({ ...size, event: `${NS}:make_variant_${i}` }));
  return size;
}

export function buildSpawnRules(a) {
  const conditions = (a.spawn ?? []).map((s) => {
    const biomes = s.biomes.map((b) => ({ test: 'has_biome_tag', operator: '==', value: BIOME_TAGS[b] ?? b }));
    const cond = {
      'minecraft:spawns_on_surface': {},
      ...(s.blocks ? { 'minecraft:spawns_on_block_filter': s.blocks.map(itemId) } : {}),
      'minecraft:brightness_filter': { min: 7, max: 15, adjust_for_weather: false },
      'minecraft:weight': { default: s.weight ?? 5 },
      'minecraft:herd': herd(a, s),
      'minecraft:density_limit': { surface: s.density ?? 6 },
      'minecraft:biome_filter': biomes.length === 1 ? biomes[0] : { any_of: biomes },
    };
    if (s.water) {
      delete cond['minecraft:spawns_on_surface'];
      cond['minecraft:spawns_underwater'] = {};
      cond['minecraft:height_filter'] = { min: 50, max: 70 };
    }
    return cond;
  });
  return {
    format_version: '1.8.0',
    'minecraft:spawn_rules': {
      description: { identifier: `${NS}:${a.id}`, population_control: 'animal' },
      conditions,
    },
  };
}

export function buildLoot(a) {
  const pools = (a.loot ?? []).map((l) => {
    const functions = [{ function: 'set_count', count: { min: l.min ?? 0, max: l.max ?? 1 } }];
    if (l.smelts) functions.push({ function: 'furnace_smelt', conditions: [{ condition: 'entity_properties', entity: 'this', properties: { on_fire: true } }] });
    functions.push({ function: 'looting_enchant', count: { min: 0, max: 1 } });
    return {
      rolls: 1,
      ...(l.chance ? { conditions: [{ condition: 'random_chance_with_looting', chance: l.chance, looting_multiplier: 0.05 }] } : {}),
      entries: [{ type: 'item', name: itemId(l.item), weight: 1, functions }],
    };
  });
  return { pools };
}
