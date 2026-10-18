package dk.ulfen.safari;

import dk.ulfen.safari.entity.SafariAnimal;
import dk.ulfen.safari.species.SpeciesRegistry;
import dk.ulfen.safari.world.SafariWorldgen;
import net.fabricmc.api.ModInitializer;
import net.fabricmc.fabric.api.entity.event.v1.ServerLivingEntityEvents;
import net.fabricmc.fabric.api.event.lifecycle.v1.ServerTickEvents;
import net.fabricmc.fabric.api.networking.v1.ServerPlayConnectionEvents;
import net.minecraft.core.BlockPos;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.world.entity.EntitySpawnReason;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.Mob;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.levelgen.Heightmap;

import java.util.Set;

public class SafariAnimals implements ModInitializer {
	public static final String MOD_ID = "safari";

	/** Big animals whose carcasses attract vultures. */
	private static final Set<String> CARCASSES = Set.of(
		"safari:zebra", "safari:gazelle", "safari:wildebeest", "safari:warthog", "safari:giraffe", "safari:elephant",
		"safari:rhino", "safari:hippo", "safari:kangaroo", "minecraft:cow", "minecraft:horse", "minecraft:sheep");

	@Override
	public void onInitialize() {
		SpeciesRegistry.load();
		SafariRegistry.register();
		SafariWorldgen.register();
		FieldGuide.init();

		ServerTickEvents.END_SERVER_TICK.register(server -> {
			Hatchery.tick();
			FieldGuide.tick(server);
		});
		ServerPlayConnectionEvents.JOIN.register((handler, sender, server) -> FieldGuide.onJoin(handler.getPlayer()));
		ServerLivingEntityEvents.AFTER_DEATH.register((entity, source) -> {
			if (entity instanceof SafariAnimal animal && entity.level() instanceof ServerLevel level) {
				dk.ulfen.safari.entity.SafariBehaviours.dropStolen(animal, level);
			}
			vulturesArrive(entity);
		});
	}

	/** Vultures arrive when a big animal dies out in the open. */
	private static void vulturesArrive(LivingEntity dead) {
		if (!(dead.level() instanceof ServerLevel level) || level.dimension() != Level.OVERWORLD) return;
		if (!CARCASSES.contains(BuiltInRegistries.ENTITY_TYPE.getKey(dead.getType()).toString()) || level.getRandom().nextFloat() > 0.35F) return;
		BlockPos at = dead.blockPosition();
		if (level.getHeightmapPos(Heightmap.Types.MOTION_BLOCKING, at).getY() > at.getY() + 1) return;
		int nearby = level.getEntitiesOfClass(Mob.class, dead.getBoundingBox().inflate(48), m -> m.getType() == SafariRegistry.ANIMALS.get("vulture")).size();
		for (int i = 0; i < Math.max(0, Math.min(2, 3 - nearby)); i++) {
			Mob vulture = SafariRegistry.ANIMALS.get("vulture").create(level, EntitySpawnReason.EVENT);
			if (vulture == null) continue;
			vulture.snapTo(at.getX() + level.getRandom().nextFloat() * 6 - 3, at.getY() + 14, at.getZ() + level.getRandom().nextFloat() * 6 - 3, 0, 0);
			level.addFreshEntity(vulture);
		}
	}
}
