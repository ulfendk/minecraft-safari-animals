package dk.ulfen.safari;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import net.minecraft.core.BlockPos;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.sounds.SoundSource;
import net.minecraft.world.entity.EntitySpawnReason;
import net.minecraft.world.entity.Mob;

/** Placed ostrich eggs crack a few times and hatch into a chick after about 20 seconds. */
public final class Hatchery {
	private static final int HATCH_TICKS = 400;
	private static final List<Egg> EGGS = new ArrayList<>();

	private record Egg(ServerLevel level, BlockPos pos, long hatchAt) {}

	private Hatchery() {}

	public static void add(ServerLevel level, BlockPos pos) {
		EGGS.add(new Egg(level, pos.immutable(), level.getGameTime() + HATCH_TICKS));
	}

	static void tick() {
		for (Iterator<Egg> it = EGGS.iterator(); it.hasNext(); ) {
			Egg egg = it.next();
			long left = egg.hatchAt - egg.level.getGameTime();
			if (left == HATCH_TICKS / 3 || left == 2 * HATCH_TICKS / 3) {
				egg.level.playSound(null, egg.pos, SoundEvents.TURTLE_EGG_CRACK, SoundSource.BLOCKS, 1.0F, 0.8F);
			}
			if (left > 0) continue;
			it.remove();
			egg.level.playSound(null, egg.pos, SoundEvents.TURTLE_EGG_HATCH, SoundSource.BLOCKS, 1.0F, 0.8F);
			Mob chick = SafariRegistry.ANIMALS.get("ostrich").create(egg.level, EntitySpawnReason.BREEDING);
			if (chick instanceof net.minecraft.world.entity.AgeableMob baby) {
				baby.setAge(-24000);
				baby.snapTo(egg.pos.getX() + 0.5, egg.pos.getY(), egg.pos.getZ() + 0.5, egg.level.getRandom().nextFloat() * 360, 0);
				egg.level.addFreshEntity(baby);
			}
		}
	}
}
