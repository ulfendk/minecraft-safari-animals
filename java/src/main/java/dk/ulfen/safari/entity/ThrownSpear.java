package dk.ulfen.safari.entity;

import java.util.Collection;
import java.util.List;

import com.geckolib.animatable.GeoEntity;
import com.geckolib.animatable.instance.AnimatableInstanceCache;
import com.geckolib.animatable.manager.AnimatableManager;
import com.geckolib.util.GeckoLibUtil;

import dk.ulfen.safari.SafariRegistry;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.sounds.SoundEvent;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.world.damagesource.DamageSource;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.projectile.ProjectileDeflection;
import net.minecraft.world.entity.projectile.ProjectileUtil;
import net.minecraft.world.entity.projectile.arrow.AbstractArrow;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.enchantment.EnchantmentHelper;
import net.minecraft.world.level.Level;
import net.minecraft.world.phys.EntityHitResult;
import net.minecraft.world.phys.Vec3;
import org.jspecify.annotations.Nullable;

/** A thrown flint spear. Like a trident it sticks in the ground and can be picked up again. */
public class ThrownSpear extends AbstractArrow implements GeoEntity {
	private final AnimatableInstanceCache geoCache = GeckoLibUtil.createInstanceCache(this);
	private boolean dealtDamage;

	public ThrownSpear(EntityType<? extends ThrownSpear> type, Level level) {
		super(type, level);
	}

	public ThrownSpear(Level level, LivingEntity owner, ItemStack spear) {
		super(SafariRegistry.THROWN_SPEAR, owner, level, spear, null);
	}

	public ThrownSpear(Level level, double x, double y, double z, ItemStack spear) {
		super(SafariRegistry.THROWN_SPEAR, x, y, z, level, spear, spear);
	}

	@Override
	protected @Nullable EntityHitResult findHitEntity(Vec3 from, Vec3 to) {
		if (this.dealtDamage) return null;
		EntityHitResult hit = super.findHitEntity(from, to);
		// The vanilla search widens hitboxes by a margin; when the start point is already inside
		// that margin the ray test finds nothing, so try once more without it.
		return hit != null ? hit : ProjectileUtil.getEntityHitResult(this.level(), this, from, to,
			this.getBoundingBox().expandTowards(this.getDeltaMovement()).inflate(1.0), this::canHitEntity, 0.0F);
	}

	@Override
	protected Collection<EntityHitResult> findHitEntities(Vec3 from, Vec3 to) {
		EntityHitResult e = this.findHitEntity(from, to);
		return e != null ? List.of(e) : List.of();
	}

	@Override
	protected void onHitEntity(EntityHitResult hit) {
		Entity entity = hit.getEntity();
		float dmg = 8.0F;
		Entity owner = this.getOwner();
		DamageSource source = this.damageSources().trident(this, owner == null ? this : owner);
		if (this.level() instanceof ServerLevel level) dmg = EnchantmentHelper.modifyDamage(level, this.getWeaponItem(), entity, source, dmg);
		this.dealtDamage = true;
		if (entity.hurtOrSimulate(source, dmg) && entity instanceof LivingEntity living) {
			this.doKnockback(living, source);
			this.doPostHurtEffects(living);
		}
		this.playSound(SoundEvents.TRIDENT_HIT, 1.0F, 1.2F);
		this.deflect(ProjectileDeflection.REVERSE, entity, this.owner, false, new Vec3(0.02, 0.2, 0.02));
	}

	@Override
	public ItemStack getWeaponItem() {
		return this.getPickupItemStackOrigin();
	}

	@Override
	protected ItemStack getDefaultPickupItem() {
		return new ItemStack(SafariRegistry.FLINT_SPEAR);
	}

	@Override
	protected SoundEvent getDefaultHitGroundSoundEvent() {
		return SoundEvents.TRIDENT_HIT_GROUND;
	}

	@Override
	public void registerControllers(AnimatableManager.ControllerRegistrar controllers) {}

	@Override
	public AnimatableInstanceCache getAnimatableInstanceCache() {
		return this.geoCache;
	}
}
