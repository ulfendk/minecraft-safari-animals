package dk.ulfen.safari.item;

import dk.ulfen.safari.SafariRegistry;
import dk.ulfen.safari.entity.Pebble;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.sounds.SoundSource;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.InteractionResult;
import net.minecraft.world.entity.EquipmentSlot;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.entity.projectile.Projectile;
import net.minecraft.world.item.BowItem;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.ItemUseAnimation;
import net.minecraft.world.level.Level;

/** Sling: hold to wind up, release to shoot a pebble from your inventory. */
public class SlingItem extends Item {
	public SlingItem(Item.Properties properties) {
		super(properties);
	}

	@Override
	public ItemUseAnimation getUseAnimation(ItemStack stack) {
		return ItemUseAnimation.BOW;
	}

	@Override
	public int getUseDuration(ItemStack stack, LivingEntity user) {
		return 72000;
	}

	private static ItemStack findPebble(Player player) {
		if (player.getOffhandItem().is(SafariRegistry.PEBBLE)) return player.getOffhandItem();
		for (int i = 0; i < player.getInventory().getContainerSize(); i++) {
			ItemStack s = player.getInventory().getItem(i);
			if (s.is(SafariRegistry.PEBBLE)) return s;
		}
		return ItemStack.EMPTY;
	}

	@Override
	public InteractionResult use(Level level, Player player, InteractionHand hand) {
		if (!player.hasInfiniteMaterials() && findPebble(player).isEmpty()) return InteractionResult.FAIL;
		player.startUsingItem(hand);
		return InteractionResult.CONSUME;
	}

	@Override
	public boolean releaseUsing(ItemStack stack, Level level, LivingEntity entity, int remainingTime) {
		if (!(entity instanceof Player player)) return false;
		float power = BowItem.getPowerForTime(this.getUseDuration(stack, entity) - remainingTime);
		if (power < 0.1F) return false;
		ItemStack ammo = findPebble(player);
		if (ammo.isEmpty() && !player.hasInfiniteMaterials()) return false;
		if (level instanceof ServerLevel server) {
			ItemStack shot = ammo.isEmpty() ? new ItemStack(SafariRegistry.PEBBLE) : ammo.copyWithCount(1);
			Projectile.spawnProjectileFromRotation((lvl, owner, s) -> new Pebble(lvl, owner, s, 1.0F + 3.0F * power), server, shot, player, 0.0F, power * 1.8F, 1.0F);
			if (!player.hasInfiniteMaterials()) ammo.shrink(1);
			stack.hurtAndBreak(1, player, player.getUsedItemHand() == InteractionHand.OFF_HAND ? EquipmentSlot.OFFHAND : EquipmentSlot.MAINHAND);
		}
		level.playSound(null, player.getX(), player.getY(), player.getZ(), SoundEvents.SNOWBALL_THROW, SoundSource.PLAYERS, 1.0F, 0.6F + power * 0.3F);
		return true;
	}
}
