package dk.ulfen.safari.entity;

import dk.ulfen.safari.SafariRegistry;
import net.minecraft.core.particles.ItemParticleOption;
import net.minecraft.core.particles.ParticleTypes;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.projectile.throwableitemprojectile.ThrowableItemProjectile;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.ItemStackTemplate;
import net.minecraft.world.level.Level;
import net.minecraft.world.phys.EntityHitResult;
import net.minecraft.world.phys.HitResult;

/** A pebble thrown by hand or shot from a sling. */
public class Pebble extends ThrowableItemProjectile {
	private float damage = 3.0F;

	public Pebble(EntityType<? extends Pebble> type, Level level) {
		super(type, level);
	}

	public Pebble(Level level, LivingEntity owner, ItemStack stack, float damage) {
		super(SafariRegistry.PEBBLE_ENTITY, owner, level, stack);
		this.damage = damage;
	}

	@Override
	protected Item getDefaultItem() {
		return SafariRegistry.PEBBLE;
	}

	@Override
	public void handleEntityEvent(byte id) {
		if (id == 3) {
			for (int i = 0; i < 6; i++) {
				this.level().addParticle(new ItemParticleOption(ParticleTypes.ITEM, ItemStackTemplate.fromNonEmptyStack(new ItemStack(getDefaultItem()))),
					this.getX(), this.getY(), this.getZ(), 0.0, 0.0, 0.0);
			}
		}
	}

	@Override
	protected void onHitEntity(EntityHitResult hit) {
		super.onHitEntity(hit);
		hit.getEntity().hurt(this.damageSources().thrown(this, this.getOwner()), this.damage);
	}

	@Override
	protected void onHit(HitResult hit) {
		super.onHit(hit);
		if (!this.level().isClientSide()) {
			this.level().broadcastEntityEvent(this, (byte) 3);
			this.discard();
		}
	}
}
