package dk.ulfen.safari.item;

import dk.ulfen.safari.Hatchery;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.network.chat.Component;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.sounds.SoundSource;
import net.minecraft.world.InteractionResult;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.context.UseOnContext;

/** Place an ostrich egg on the ground and it hatches into a chick. (It can also be fried.) */
public class OstrichEggItem extends Item {
	public OstrichEggItem(Item.Properties properties) {
		super(properties);
	}

	@Override
	public InteractionResult useOn(UseOnContext context) {
		if (context.getClickedFace() != Direction.UP) return InteractionResult.PASS;
		BlockPos above = context.getClickedPos().above();
		if (!context.getLevel().getBlockState(above).isAir()) return InteractionResult.PASS;
		if (context.getLevel() instanceof ServerLevel level) {
			Hatchery.add(level, above);
			level.playSound(null, above, SoundEvents.TURTLE_EGG_CRACK, SoundSource.BLOCKS, 1.0F, 0.8F);
			if (context.getPlayer() != null) context.getPlayer().sendOverlayMessage(Component.translatable("safari.egg.placed"));
		}
		context.getItemInHand().consume(1, context.getPlayer());
		return InteractionResult.SUCCESS;
	}
}
