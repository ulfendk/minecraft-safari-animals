package dk.ulfen.safari.block;

import net.minecraft.core.BlockPos;
import net.minecraft.world.level.BlockGetter;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.phys.shapes.CollisionContext;
import net.minecraft.world.phys.shapes.Shapes;
import net.minecraft.world.phys.shapes.VoxelShape;

/** A tall clay termite mound. Meerkats hide in them. */
public class TermiteMoundBlock extends Block {
	private static final VoxelShape SHAPE = Shapes.or(Block.box(1, 0, 1, 15, 9, 15), Block.box(3, 9, 3, 13, 16, 13));
	private static final VoxelShape COLLISION = Shapes.or(Block.box(1, 0, 1, 15, 9, 15), Block.box(3, 9, 3, 13, 24, 13));

	public TermiteMoundBlock(Properties properties) {
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
}
