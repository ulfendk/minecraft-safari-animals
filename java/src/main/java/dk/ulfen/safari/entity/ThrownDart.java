package dk.ulfen.safari.entity;

import com.geckolib.animatable.GeoEntity;
import com.geckolib.animatable.instance.AnimatableInstanceCache;
import com.geckolib.animatable.manager.AnimatableManager;
import com.geckolib.util.GeckoLibUtil;

import dk.ulfen.safari.SafariRegistry;
import net.minecraft.sounds.SoundEvent;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.world.effect.MobEffectInstance;
import net.minecraft.world.effect.MobEffects;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.projectile.arrow.AbstractArrow;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.Level;

/** A blowgun dart. Poison darts poison what they hit. Darts can be picked up again. */
public class ThrownDart extends AbstractArrow implements GeoEntity {
	private final AnimatableInstanceCache geoCache = GeckoLibUtil.createInstanceCache(this);

	public ThrownDart(EntityType<? extends ThrownDart> type, Level level) {
		super(type, level);
		this.setBaseDamage(isPoison() ? 0.5 : 1.0);
	}

	public ThrownDart(EntityType<? extends ThrownDart> type, Level level, LivingEntity owner, ItemStack dart) {
		super(type, owner, level, dart, null);
		this.setBaseDamage(isPoison() ? 0.5 : 1.0);
	}

	public boolean isPoison() {
		return this.getType() == SafariRegistry.THROWN_POISON_DART;
	}

	@Override
	protected void doPostHurtEffects(LivingEntity target) {
		super.doPostHurtEffects(target);
		if (isPoison()) target.addEffect(new MobEffectInstance(MobEffects.POISON, 140, 1), this.getEffectSource());
	}

	@Override
	protected ItemStack getDefaultPickupItem() {
		return new ItemStack(isPoison() ? SafariRegistry.POISON_DART : SafariRegistry.DART);
	}

	@Override
	protected SoundEvent getDefaultHitGroundSoundEvent() {
		return SoundEvents.ARROW_HIT;
	}

	@Override
	public void registerControllers(AnimatableManager.ControllerRegistrar controllers) {}

	@Override
	public AnimatableInstanceCache getAnimatableInstanceCache() {
		return this.geoCache;
	}
}
