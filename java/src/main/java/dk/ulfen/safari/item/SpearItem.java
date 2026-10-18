package dk.ulfen.safari.item;

import dk.ulfen.safari.entity.ThrownSpear;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.sounds.SoundSource;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.InteractionResult;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.entity.projectile.Projectile;
import net.minecraft.world.entity.projectile.arrow.AbstractArrow;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.ItemUseAnimation;
import net.minecraft.world.level.Level;

/** Flint spear: a melee weapon you can also hold to charge and throw, like a trident. */
public class SpearItem extends Item {
	public SpearItem(Item.Properties properties) {
		super(properties);
	}

	@Override
	public ItemUseAnimation getUseAnimation(ItemStack stack) {
		return ItemUseAnimation.TRIDENT;
	}

	@Override
	public int getUseDuration(ItemStack stack, LivingEntity user) {
		return 72000;
	}

	@Override
	public InteractionResult use(Level level, Player player, InteractionHand hand) {
		if (player.getItemInHand(hand).nextDamageWillBreak()) return InteractionResult.FAIL;
		player.startUsingItem(hand);
		return InteractionResult.CONSUME;
	}

	@Override
	public boolean releaseUsing(ItemStack stack, Level level, LivingEntity entity, int remainingTime) {
		if (!(entity instanceof Player player)) return false;
		int held = this.getUseDuration(stack, entity) - remainingTime;
		if (held < 8 || stack.nextDamageWillBreak()) return false;
		float power = Math.min(1.0F, held / 20.0F) * 2.2F;
		if (level instanceof ServerLevel server) {
			stack.hurtWithoutBreaking(1, player);
			ItemStack thrown = stack.consumeAndReturn(1, player);
			ThrownSpear spear = Projectile.spawnProjectileFromRotation(ThrownSpear::new, server, thrown, player, 0.0F, power, 1.0F);
			if (player.hasInfiniteMaterials()) spear.pickup = AbstractArrow.Pickup.CREATIVE_ONLY;
			level.playSound(null, spear, SoundEvents.TRIDENT_THROW.value(), SoundSource.PLAYERS, 1.0F, 1.2F);
		}
		return true;
	}
}
