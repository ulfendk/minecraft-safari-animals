package dk.ulfen.safari.block;

import net.minecraft.core.BlockPos;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.world.effect.MobEffectInstance;
import net.minecraft.world.effect.MobEffects;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.InsideBlockEffectApplier;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.level.BlockGetter;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.phys.Vec3;
import net.minecraft.world.phys.shapes.CollisionContext;
import net.minecraft.world.phys.shapes.VoxelShape;

/**
 * A 1.5-block barrier. Land animals can't jump it and get scratched and pushed back when they
 * press against it; players are only slowed. The collision box is inset by a pixel so that
 * pushing against the bush counts as touching it.
 */
public class ThornBushBlock extends Block {
	private static final VoxelShape SHAPE = Block.box(0, 0, 0, 16, 16, 16);
	private static final VoxelShape COLLISION = Block.box(1, 0, 1, 15, 24, 15);

	public ThornBushBlock(Properties properties) {
		super(properties);
	}

	@Override
	protected VoxelShape getShape(BlockState state, BlockGetter level, BlockPos pos, CollisionContext context) {
		return SHAPE;
	}

	@Override
	protected VoxelShape getCollisionShape(BlockState state, BlockGetter level, BlockPos pos, CollisionContext context) {
		return COLLISION;
	}

	@Override
	protected void entityInside(BlockState state, Level level, BlockPos pos, Entity entity, InsideBlockEffectApplier effects, boolean precise) {
		if (!(entity instanceof LivingEntity living) || !(level instanceof ServerLevel server)) return;
		if (living instanceof Player player) {
			player.addEffect(new MobEffectInstance(MobEffects.SLOWNESS, 30, 1, false, false));
			return;
		}
		if (living.tickCount % 10 != 0) return;
		living.hurtServer(server, level.damageSources().sweetBerryBush(), 1.0F);
		Vec3 away = living.position().subtract(Vec3.atCenterOf(pos)).multiply(1, 0, 1).normalize().scale(0.35);
		living.push(away.x, 0.1, away.z);
	}
}
