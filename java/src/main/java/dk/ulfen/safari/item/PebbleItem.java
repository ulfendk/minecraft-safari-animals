package dk.ulfen.safari.item;

import dk.ulfen.safari.entity.Pebble;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.sounds.SoundSource;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.InteractionResult;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.entity.projectile.Projectile;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.Level;

/** Pebbles can be thrown by hand (weaker than with a sling). */
public class PebbleItem extends Item {
	public PebbleItem(Item.Properties properties) {
		super(properties);
	}

	@Override
	public InteractionResult use(Level level, Player player, InteractionHand hand) {
		ItemStack stack = player.getItemInHand(hand);
		level.playSound(null, player.getX(), player.getY(), player.getZ(), SoundEvents.SNOWBALL_THROW, SoundSource.NEUTRAL, 0.5F, 0.6F);
		if (level instanceof ServerLevel server) {
			Projectile.spawnProjectileFromRotation((lvl, owner, s) -> new Pebble(lvl, owner, s, 2.0F), server, stack, player, 0.0F, 1.2F, 1.0F);
		}
		stack.consume(1, player);
		return InteractionResult.SUCCESS;
	}
}
