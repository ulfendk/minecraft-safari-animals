package dk.ulfen.safari.world;

import java.util.function.Predicate;

import dk.ulfen.safari.SafariRegistry;
import dk.ulfen.safari.species.Species;
import dk.ulfen.safari.species.SpeciesRegistry;
import net.fabricmc.fabric.api.biome.v1.BiomeModifications;
import net.fabricmc.fabric.api.biome.v1.BiomeSelectionContext;
import net.fabricmc.fabric.api.biome.v1.BiomeSelectors;
import net.fabricmc.fabric.api.tag.convention.v2.ConventionalBiomeTags;
import net.minecraft.core.registries.Registries;
import net.minecraft.resources.ResourceKey;
import net.minecraft.tags.BiomeTags;
import net.minecraft.world.entity.MobCategory;
import net.minecraft.world.level.biome.Biomes;
import net.minecraft.world.level.levelgen.GenerationStep;
import net.minecraft.world.level.levelgen.placement.PlacedFeature;

/** Natural spawns and savanna features (thorn bushes, termite mounds, watering holes). */
public final class SafariWorldgen {
	private SafariWorldgen() {}

	/** Biome names used in the shared specs -> biome selectors. */
	private static Predicate<BiomeSelectionContext> biomes(String name) {
		return switch (name) {
			case "savanna" -> BiomeSelectors.tag(BiomeTags.IS_SAVANNA);
			case "jungle" -> BiomeSelectors.tag(BiomeTags.IS_JUNGLE);
			case "desert" -> BiomeSelectors.tag(ConventionalBiomeTags.IS_DESERT);
			case "swamp" -> BiomeSelectors.tag(ConventionalBiomeTags.IS_SWAMP);
			case "mangrove" -> BiomeSelectors.includeByKey(Biomes.MANGROVE_SWAMP);
			case "river" -> BiomeSelectors.tag(BiomeTags.IS_RIVER);
			case "beach" -> BiomeSelectors.tag(BiomeTags.IS_BEACH);
			case "mesa" -> BiomeSelectors.tag(BiomeTags.IS_BADLANDS);
			case "plains" -> BiomeSelectors.tag(ConventionalBiomeTags.IS_PLAINS);
			case "forest" -> BiomeSelectors.tag(BiomeTags.IS_FOREST);
			default -> throw new IllegalArgumentException("Unknown biome group " + name);
		};
	}

	public static void register() {
		for (Species s : SpeciesRegistry.all()) {
			for (Species.Spawn spawn : s.spawns()) {
				Predicate<BiomeSelectionContext> selector = spawn.biomes().stream().map(SafariWorldgen::biomes).reduce(Predicate::or).orElse(c -> false);
				MobCategory category = spawn.water() ? MobCategory.WATER_CREATURE : MobCategory.CREATURE;
				BiomeModifications.addSpawn(selector, category, SafariRegistry.ANIMALS.get(s.id()), spawn.weight(), spawn.min(), spawn.max());
			}
		}
		Predicate<BiomeSelectionContext> savanna = BiomeSelectors.tag(BiomeTags.IS_SAVANNA);
		BiomeModifications.addFeature(savanna, GenerationStep.Decoration.VEGETAL_DECORATION, placed("thorn_bush"));
		BiomeModifications.addFeature(savanna.or(BiomeSelectors.tag(BiomeTags.IS_BADLANDS)), GenerationStep.Decoration.VEGETAL_DECORATION, placed("termite_mound"));
		BiomeModifications.addFeature(savanna, GenerationStep.Decoration.LAKES, placed("watering_hole"));
	}

	private static ResourceKey<PlacedFeature> placed(String name) {
		return ResourceKey.create(Registries.PLACED_FEATURE, SafariRegistry.id(name));
	}

}
