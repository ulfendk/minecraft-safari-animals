package dk.ulfen.safari.client;

import com.geckolib.constant.dataticket.DataTicket;
import com.geckolib.model.DefaultedEntityGeoModel;
import com.geckolib.renderer.GeoEntityRenderer;
import com.geckolib.renderer.base.BoneSnapshots;
import com.geckolib.renderer.base.RenderPassInfo;

import dk.ulfen.safari.entity.SafariCreature;
import dk.ulfen.safari.entity.SafariMount;
import dk.ulfen.safari.species.Species;
import dk.ulfen.safari.species.SpeciesRegistry;
import net.minecraft.client.renderer.entity.EntityRendererProvider;
import net.minecraft.client.renderer.entity.state.LivingEntityRenderState;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.Mob;
import org.jspecify.annotations.Nullable;

/** Renders any safari animal from its GeckoLib model, showing or hiding situational bones. */
public class SafariRenderer<T extends Mob & SafariCreature> extends GeoEntityRenderer<T, LivingEntityRenderState> {
	private static final DataTicket<Boolean> SADDLED = DataTicket.create("safari_saddled", Boolean.class);
	private static final DataTicket<Boolean> CHESTED = DataTicket.create("safari_chested", Boolean.class);
	private static final DataTicket<Boolean> BABY = DataTicket.create("safari_baby", Boolean.class);
	private static final DataTicket<Integer> VARIANT = DataTicket.create("safari_variant", Integer.class);

	private final Species species;

	public SafariRenderer(EntityRendererProvider.Context context, EntityType<? extends T> type) {
		super(context, new VariantModel<>(BuiltInRegistries.ENTITY_TYPE.getKey(type), SpeciesRegistry.of(type)));
		this.species = SpeciesRegistry.of(type);
		this.shadowRadius = Math.min(1.2F, this.species.width() * 0.5F);
	}

	@Override
	public void captureDefaultRenderState(T animatable, @Nullable Void relatedObject, LivingEntityRenderState state, float partialTick) {
		super.captureDefaultRenderState(animatable, relatedObject, state, partialTick);
		state.addGeckolibData(SADDLED, animatable.isSaddled());
		state.addGeckolibData(CHESTED, animatable instanceof SafariMount mount && mount.hasChest());
		state.addGeckolibData(BABY, animatable.isBaby());
		state.addGeckolibData(VARIANT, animatable.getVariant());
	}

	@Override
	public void adjustModelBonesForRender(RenderPassInfo<LivingEntityRenderState> info, BoneSnapshots snapshots) {
		boolean saddled = info.getOrDefaultGeckolibData(SADDLED, false);
		boolean chested = info.getOrDefaultGeckolibData(CHESTED, false);
		boolean baby = info.getOrDefaultGeckolibData(BABY, false);
		int variant = info.getOrDefaultGeckolibData(VARIANT, 0);
		hide(snapshots, "saddle", !saddled);
		hide(snapshots, "chest", !chested);
		// Lions: only adult males (variant 0) have a mane.
		if ("variant0_adult".equals(this.species.maneRule())) hide(snapshots, "mane", variant != 0 || baby);
	}

	/** Picks the texture for the animal's colour variant (chameleons, poison dart frogs). */
	private static class VariantModel<T extends com.geckolib.animatable.GeoAnimatable> extends DefaultedEntityGeoModel<T> {
		private final net.minecraft.resources.Identifier[] textures;

		VariantModel(net.minecraft.resources.Identifier id, Species species) {
			super(id);
			java.util.List<String> names = species.variantTextures() == null ? java.util.List.of() : species.variantTextures();
			this.textures = new net.minecraft.resources.Identifier[names.size()];
			for (int i = 0; i < names.size(); i++) {
				String suffix = names.get(i) == null ? "" : "_" + names.get(i);
				this.textures[i] = id.withPath("textures/entity/" + id.getPath() + suffix + ".png");
			}
		}

		@Override
		public net.minecraft.resources.Identifier getTextureResource(com.geckolib.renderer.base.GeoRenderState renderState) {
			Integer variant = renderState.getGeckolibData(VARIANT);
			if (variant != null && variant > 0 && variant < this.textures.length) return this.textures[variant];
			return super.getTextureResource(renderState);
		}
	}

	private static void hide(BoneSnapshots snapshots, String bone, boolean hidden) {
		snapshots.get(bone).ifPresent(b -> b.skipRender(hidden).skipChildrenRender(hidden));
	}
}
