package dk.ulfen.safari.item;

import dk.ulfen.safari.SafariRegistry;
import dk.ulfen.safari.entity.ThrownDart;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.sounds.SoundSource;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.InteractionResult;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.EquipmentSlot;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.entity.projectile.Projectile;
import net.minecraft.world.entity.projectile.arrow.AbstractArrow;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.ItemUseAnimation;
import net.minecraft.world.level.Level;

/** Blowgun: draw a breath, then release to fire a dart (poison darts first). */
public class BlowgunItem extends Item {
	public BlowgunItem(Item.Properties properties) {
		super(properties);
	}

	@Override
	public ItemUseAnimation getUseAnimation(ItemStack stack) {
		return ItemUseAnimation.SPYGLASS;
	}

	@Override
	public int getUseDuration(ItemStack stack, LivingEntity user) {
		return 72000;
	}

	private static ItemStack findDart(Player player) {
		for (Item wanted : new Item[] {SafariRegistry.POISON_DART, SafariRegistry.DART}) {
			if (player.getOffhandItem().is(wanted)) return player.getOffhandItem();
			for (int i = 0; i < player.getInventory().getContainerSize(); i++) {
				ItemStack s = player.getInventory().getItem(i);
				if (s.is(wanted)) return s;
			}
		}
		return ItemStack.EMPTY;
	}

	@Override
	public InteractionResult use(Level level, Player player, InteractionHand hand) {
		if (!player.hasInfiniteMaterials() && findDart(player).isEmpty()) return InteractionResult.FAIL;
		player.startUsingItem(hand);
		return InteractionResult.CONSUME;
	}

	@Override
	public boolean releaseUsing(ItemStack stack, Level level, LivingEntity entity, int remainingTime) {
		if (!(entity instanceof Player player)) return false;
		float power = Math.min(1.0F, (this.getUseDuration(stack, entity) - remainingTime) / 12.0F);
		if (power < 0.2F) return false;
		ItemStack ammo = findDart(player);
		if (ammo.isEmpty() && !player.hasInfiniteMaterials()) return false;
		ItemStack shot = ammo.isEmpty() ? new ItemStack(SafariRegistry.DART) : ammo.copyWithCount(1);
		EntityType<ThrownDart> type = shot.is(SafariRegistry.POISON_DART) ? SafariRegistry.THROWN_POISON_DART : SafariRegistry.THROWN_DART;
		if (level instanceof ServerLevel server) {
			ThrownDart dart = Projectile.spawnProjectileFromRotation((lvl, owner, s) -> new ThrownDart(type, lvl, owner, s), server, shot, player, 0.0F, power * 2.6F, 0.5F);
			if (player.hasInfiniteMaterials()) dart.pickup = AbstractArrow.Pickup.CREATIVE_ONLY;
			if (!player.hasInfiniteMaterials()) ammo.shrink(1);
			stack.hurtAndBreak(1, player, player.getUsedItemHand() == InteractionHand.OFF_HAND ? EquipmentSlot.OFFHAND : EquipmentSlot.MAINHAND);
		}
		level.playSound(null, player.getX(), player.getY(), player.getZ(), SoundEvents.ARROW_SHOOT, SoundSource.PLAYERS, 0.5F, 1.8F);
		return true;
	}
}
