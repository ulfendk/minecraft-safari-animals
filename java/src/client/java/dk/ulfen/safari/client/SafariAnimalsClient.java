package dk.ulfen.safari.client;

import dk.ulfen.safari.SafariRegistry;
import dk.ulfen.safari.entity.SafariCreature;
import net.fabricmc.api.ClientModInitializer;
import net.minecraft.client.renderer.entity.EntityRenderers;
import net.minecraft.client.renderer.entity.ThrownItemRenderer;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.Mob;

public class SafariAnimalsClient implements ClientModInitializer {
	@Override
	@SuppressWarnings("unchecked")
	public void onInitializeClient() {
		for (EntityType<? extends Mob> type : SafariRegistry.ANIMALS.values()) {
			registerAnimal((EntityType<SafariAnimalType>) (EntityType<?>) type);
		}
		EntityRenderers.register(SafariRegistry.THROWN_SPEAR, ctx -> new SpearRenderer<>(ctx, "thrown_spear"));
		EntityRenderers.register(SafariRegistry.THROWN_DART, ctx -> new SpearRenderer<>(ctx, "thrown_dart"));
		EntityRenderers.register(SafariRegistry.THROWN_POISON_DART, ctx -> new SpearRenderer<>(ctx, "thrown_poison_dart"));
		EntityRenderers.register(SafariRegistry.PEBBLE_ENTITY, ThrownItemRenderer::new);
		EntityRenderers.register(SafariRegistry.THROWN_FRUIT, ThrownItemRenderer::new);
	}

	private static <T extends Mob & SafariCreature> void registerAnimal(EntityType<T> type) {
		EntityRenderers.register(type, context -> new SafariRenderer<>(context, type));
	}

	/** Type-only helper so the raw entity types can be passed to the generic registration. */
	private abstract static class SafariAnimalType extends Mob implements SafariCreature {
		private SafariAnimalType() {
			super(null, null);
		}
	}
}
