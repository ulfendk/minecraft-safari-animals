package dk.ulfen.safari.entity;

import dk.ulfen.safari.SafariRegistry;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.projectile.throwableitemprojectile.ThrowableItemProjectile;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.Items;
import net.minecraft.world.level.Level;
import net.minecraft.world.phys.EntityHitResult;
import net.minecraft.world.phys.HitResult;

/** Fruit thrown by angry chimpanzees. */
public class ThrownFruit extends ThrowableItemProjectile {
	public ThrownFruit(EntityType<? extends ThrownFruit> type, Level level) {
		super(type, level);
	}

	public ThrownFruit(Level level, LivingEntity owner) {
		super(SafariRegistry.THROWN_FRUIT, owner, level, new ItemStack(Items.APPLE));
	}

	@Override
	protected Item getDefaultItem() {
		return Items.APPLE;
	}

	@Override
	protected void onHitEntity(EntityHitResult hit) {
		super.onHitEntity(hit);
		hit.getEntity().hurt(this.damageSources().thrown(this, this.getOwner()), 1.0F);
	}

	@Override
	protected void onHit(HitResult hit) {
		super.onHit(hit);
		if (!this.level().isClientSide()) this.discard();
	}
}
