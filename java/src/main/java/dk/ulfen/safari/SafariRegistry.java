package dk.ulfen.safari;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.function.Function;

import dk.ulfen.safari.block.TermiteMoundBlock;
import dk.ulfen.safari.block.ThornBushBlock;
import dk.ulfen.safari.entity.Pebble;
import dk.ulfen.safari.entity.SafariAnimal;
import dk.ulfen.safari.entity.SafariMount;
import dk.ulfen.safari.entity.ThrownFruit;
import dk.ulfen.safari.entity.ThrownSpear;
import dk.ulfen.safari.item.FieldGuideItem;
import dk.ulfen.safari.item.OstrichEggItem;
import dk.ulfen.safari.item.PebbleItem;
import dk.ulfen.safari.item.SlingItem;
import dk.ulfen.safari.item.SpearItem;
import dk.ulfen.safari.species.Species;
import dk.ulfen.safari.species.SpeciesRegistry;
import net.fabricmc.fabric.api.creativetab.v1.FabricCreativeModeTab;
import net.fabricmc.fabric.api.object.builder.v1.entity.FabricDefaultAttributeRegistry;
import net.minecraft.core.Registry;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.core.registries.Registries;
import net.minecraft.network.chat.Component;
import net.minecraft.resources.Identifier;
import net.minecraft.resources.ResourceKey;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.tags.ItemTags;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.Mob;
import net.minecraft.world.entity.MobCategory;
import net.minecraft.world.entity.SpawnPlacementTypes;
import net.minecraft.world.entity.SpawnPlacements;
import net.minecraft.world.food.FoodProperties;
import net.minecraft.world.item.BlockItem;
import net.minecraft.world.item.CreativeModeTab;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.Items;
import net.minecraft.world.item.ToolMaterial;
import net.minecraft.world.item.equipment.ArmorMaterial;
import net.minecraft.world.item.equipment.ArmorType;
import net.minecraft.world.item.equipment.EquipmentAsset;
import net.minecraft.world.item.equipment.EquipmentAssets;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.SoundType;
import net.minecraft.world.level.block.state.BlockBehaviour;
import net.minecraft.world.level.levelgen.Heightmap;
import net.minecraft.world.level.material.MapColor;

/** Everything the mod adds to the game registries. */
public final class SafariRegistry {
	public static final Map<String, EntityType<? extends Mob>> ANIMALS = new LinkedHashMap<>();
	public static final Map<String, Item> SPAWN_EGGS = new LinkedHashMap<>();

	public static EntityType<ThrownSpear> THROWN_SPEAR;
	public static EntityType<Pebble> PEBBLE_ENTITY;
	public static EntityType<ThrownFruit> THROWN_FRUIT;

	public static Block THORN_BUSH;
	public static Block TERMITE_MOUND;

	public static Item FIELD_GUIDE;
	public static Item SAFARI_HAT;
	public static Item RAW_GAME_MEAT;
	public static Item COOKED_GAME_MEAT;
	public static Item OSTRICH_EGG;
	public static Item FRIED_OSTRICH_EGG;
	public static Item ZEBRA_HIDE;
	public static Item FLINT_SPEAR;
	public static Item STONE_CLUB;
	public static Item FLINT_KNIFE;
	public static Item SLING;
	public static Item PEBBLE;

	private SafariRegistry() {}

	public static Identifier id(String path) {
		return Identifier.fromNamespaceAndPath(SafariAnimals.MOD_ID, path);
	}

	static void register() {
		registerEntities();
		registerBlocks();
		registerItems();
		registerCreativeTab();
	}

	// ---------------------------------------------------------------- entities

	private static <T extends net.minecraft.world.entity.Entity> EntityType<T> entity(String name, EntityType.Builder<T> builder) {
		ResourceKey<EntityType<?>> key = ResourceKey.create(Registries.ENTITY_TYPE, id(name));
		return Registry.register(BuiltInRegistries.ENTITY_TYPE, key, builder.build(key));
	}

	private static void registerEntities() {
		for (Species s : SpeciesRegistry.all()) {
			EntityType<? extends Mob> type;
			if (s.isMount()) {
				EntityType<SafariMount> t = entity(s.id(), EntityType.Builder.<SafariMount>of(SafariMount::new, MobCategory.CREATURE).sized(s.width(), s.height()).clientTrackingRange(10));
				FabricDefaultAttributeRegistry.register(t, SafariMount.createAttributes(s));
				SpawnPlacements.register(t, SpawnPlacementTypes.ON_GROUND, Heightmap.Types.MOTION_BLOCKING_NO_LEAVES, SafariAnimal::checkSpawn);
				type = t;
			} else {
				EntityType<SafariAnimal> t = entity(s.id(), EntityType.Builder.<SafariAnimal>of(SafariAnimal::new, MobCategory.CREATURE).sized(s.width(), s.height()).clientTrackingRange(10));
				FabricDefaultAttributeRegistry.register(t, SafariAnimal.createAttributes(s));
				SpawnPlacements.register(t, s.flies() ? SpawnPlacementTypes.NO_RESTRICTIONS : SpawnPlacementTypes.ON_GROUND,
					Heightmap.Types.MOTION_BLOCKING_NO_LEAVES, SafariAnimal::checkSpawn);
				type = t;
			}
			ANIMALS.put(s.id(), type);
		}
		THROWN_SPEAR = entity("thrown_spear", EntityType.Builder.<ThrownSpear>of(ThrownSpear::new, MobCategory.MISC).noLootTable().sized(0.5F, 0.5F).clientTrackingRange(4).updateInterval(20));
		PEBBLE_ENTITY = entity("thrown_pebble", EntityType.Builder.<Pebble>of(Pebble::new, MobCategory.MISC).noLootTable().sized(0.25F, 0.25F).clientTrackingRange(4).updateInterval(10));
		THROWN_FRUIT = entity("thrown_fruit", EntityType.Builder.<ThrownFruit>of(ThrownFruit::new, MobCategory.MISC).noLootTable().sized(0.25F, 0.25F).clientTrackingRange(4).updateInterval(10));
	}

	// ---------------------------------------------------------------- blocks

	private static Block block(String name, Function<BlockBehaviour.Properties, Block> factory, BlockBehaviour.Properties props) {
		ResourceKey<Block> key = ResourceKey.create(Registries.BLOCK, id(name));
		Block block = Registry.register(BuiltInRegistries.BLOCK, key, factory.apply(props.setId(key)));
		item(name, p -> new BlockItem(block, p), new Item.Properties().useBlockDescriptionPrefix());
		return block;
	}

	private static void registerBlocks() {
		THORN_BUSH = block("thorn_bush", ThornBushBlock::new, BlockBehaviour.Properties.of()
			.mapColor(MapColor.COLOR_BROWN).strength(0.6F).sound(SoundType.SWEET_BERRY_BUSH).noOcclusion().ignitedByLava());
		TERMITE_MOUND = block("termite_mound", TermiteMoundBlock::new, BlockBehaviour.Properties.of()
			.mapColor(MapColor.TERRACOTTA_ORANGE).strength(1.2F).sound(SoundType.GRAVEL).noOcclusion());
	}

	// ---------------------------------------------------------------- items

	private static <T extends Item> T item(String name, Function<Item.Properties, T> factory, Item.Properties props) {
		ResourceKey<Item> key = ResourceKey.create(Registries.ITEM, id(name));
		return Registry.register(BuiltInRegistries.ITEM, key, factory.apply(props.setId(key)));
	}

	private static Item food(String name, int nutrition, float saturation) {
		return item(name, Item::new, new Item.Properties().food(new FoodProperties.Builder().nutrition(nutrition).saturationModifier(saturation).build()));
	}

	private static final ResourceKey<EquipmentAsset> HAT_ASSET = ResourceKey.create(EquipmentAssets.ROOT_ID, id("safari_hat"));
	private static final ArmorMaterial HAT_MATERIAL = new ArmorMaterial(8, Map.of(ArmorType.HELMET, 1), 10,
		SoundEvents.ARMOR_EQUIP_LEATHER, 0.0F, 0.0F, ItemTags.REPAIRS_LEATHER_ARMOR, HAT_ASSET);

	private static void registerItems() {
		for (Species s : SpeciesRegistry.all()) {
			EntityType<? extends Mob> type = ANIMALS.get(s.id());
			SPAWN_EGGS.put(s.id(), item(s.id() + "_spawn_egg", net.minecraft.world.item.SpawnEggItem::new, new Item.Properties().spawnEgg(type)));
		}
		FIELD_GUIDE = item("field_guide", FieldGuideItem::new, new Item.Properties().stacksTo(1));
		SAFARI_HAT = item("safari_hat", Item::new, new Item.Properties().humanoidArmor(HAT_MATERIAL, ArmorType.HELMET));
		RAW_GAME_MEAT = food("raw_game_meat", 3, 0.3F);
		COOKED_GAME_MEAT = food("cooked_game_meat", 8, 0.8F);
		OSTRICH_EGG = item("ostrich_egg", OstrichEggItem::new, new Item.Properties().stacksTo(16));
		FRIED_OSTRICH_EGG = food("fried_ostrich_egg", 10, 0.8F);
		ZEBRA_HIDE = item("zebra_hide", Item::new, new Item.Properties());
		// Damage = baseline + 1 (stone) + 1 (hand). Attack speed: club slow, knife fast.
		FLINT_SPEAR = item("flint_spear", SpearItem::new, new Item.Properties().sword(ToolMaterial.STONE, 3.0F, -2.9F).durability(150).repairable(Items.FLINT));
		STONE_CLUB = item("stone_club", Item::new, new Item.Properties().sword(ToolMaterial.STONE, 5.0F, -3.3F).durability(180).repairable(Items.COBBLESTONE));
		FLINT_KNIFE = item("flint_knife", Item::new, new Item.Properties().sword(ToolMaterial.STONE, 2.0F, -1.6F).durability(120).repairable(Items.FLINT));
		SLING = item("sling", SlingItem::new, new Item.Properties().durability(200));
		PEBBLE = item("pebble", PebbleItem::new, new Item.Properties().stacksTo(64));
	}

	private static void registerCreativeTab() {
		CreativeModeTab tab = FabricCreativeModeTab.builder()
			.title(Component.translatable("itemGroup.safari"))
			.icon(() -> new ItemStack(SPAWN_EGGS.get("lion")))
			.displayItems((params, out) -> {
				SPAWN_EGGS.values().forEach(out::accept);
				for (Item i : new Item[] {FIELD_GUIDE, SAFARI_HAT, FLINT_SPEAR, STONE_CLUB, FLINT_KNIFE, SLING, PEBBLE,
					RAW_GAME_MEAT, COOKED_GAME_MEAT, OSTRICH_EGG, FRIED_OSTRICH_EGG, ZEBRA_HIDE}) out.accept(i);
				out.accept(THORN_BUSH);
				out.accept(TERMITE_MOUND);
			})
			.build();
		Registry.register(BuiltInRegistries.CREATIVE_MODE_TAB, id("safari"), tab);
	}
}
