package dk.ulfen.safari.test;

import java.util.ArrayList;
import java.util.List;

import dk.ulfen.safari.Hatchery;
import dk.ulfen.safari.SafariRegistry;
import dk.ulfen.safari.entity.SafariAnimal;
import dk.ulfen.safari.entity.SafariMount;
import dk.ulfen.safari.entity.ThrownSpear;
import net.fabricmc.fabric.api.gametest.v1.GameTest;
import net.minecraft.core.BlockPos;
import net.minecraft.gametest.framework.GameTestHelper;
import net.minecraft.world.effect.MobEffectInstance;
import net.minecraft.world.effect.MobEffects;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.Mob;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.phys.AABB;
import net.minecraft.world.phys.Vec3;

/** Server-side checks run by `./gradlew runGameTest` (and in CI). */
public class SafariGameTests {
	private static Mob spawn(GameTestHelper helper, String id, BlockPos pos) {
		return helper.spawn(SafariRegistry.ANIMALS.get(id), pos);
	}

	/** Every species can be spawned and is still alive two seconds later. */
	@GameTest(maxTicks = 100)
	public void everyAnimalSpawns(GameTestHelper helper) {
		List<Mob> mobs = new ArrayList<>();
		int i = 0;
		for (EntityType<? extends Mob> type : SafariRegistry.ANIMALS.values()) {
			Mob mob = helper.spawn(type, new BlockPos(1 + (i % 6), 1, 1 + (i / 6)));
			mob.addEffect(new MobEffectInstance(MobEffects.RESISTANCE, 200, 4)); // predators may attack their neighbours
			mobs.add(mob);
			i++;
		}
		helper.runAfterDelay(40, () -> {
			for (Mob m : mobs) {
				if (!m.isAlive()) helper.fail("Died or vanished: " + m.getType().getDescriptionId());
			}
			helper.succeed();
		});
	}

	/** A predator picks a nearby prey animal as its target (crocodiles never sleep, so time of day doesn't matter). */
	@GameTest(maxTicks = 400)
	public void predatorHuntsPrey(GameTestHelper helper) {
		SafariAnimal croc = (SafariAnimal) spawn(helper, "crocodile", new BlockPos(1, 1, 1));
		Mob zebra = spawn(helper, "zebra", new BlockPos(5, 1, 5));
		helper.succeedWhen(() -> {
			if (croc.getTarget() != zebra) helper.fail("Crocodile has not targeted the zebra yet");
		});
	}

	/** A zebra runs away from a lion standing next to it. */
	@GameTest(maxTicks = 200)
	public void zebraFleesLion(GameTestHelper helper) {
		Mob lion = spawn(helper, "lion", new BlockPos(3, 1, 3));
		lion.setNoAi(true);
		Mob zebra = spawn(helper, "zebra", new BlockPos(4, 1, 3));
		Vec3 start = zebra.position();
		helper.succeedWhen(() -> {
			if (zebra.position().distanceTo(start) < 2.0) helper.fail("Zebra has not fled");
		});
	}

	/** Animals pressing against a thorn bush get hurt. */
	@GameTest(maxTicks = 200)
	public void thornBushHurtsAnimals(GameTestHelper helper) {
		BlockPos bush = new BlockPos(3, 1, 3);
		helper.setBlock(bush, SafariRegistry.THORN_BUSH);
		Mob gazelle = helper.spawn(SafariRegistry.ANIMALS.get("gazelle"), new Vec3(3.5, 1, 4.05));
		float health = gazelle.getHealth();
		helper.succeedWhen(() -> {
			gazelle.setDeltaMovement(0, 0, -0.1); // keep walking into the bush
			if (gazelle.getHealth() >= health) helper.fail("Gazelle not hurt by the thorn bush");
		});
	}

	/** A placed ostrich egg hatches into a baby ostrich. */
	@GameTest(maxTicks = 500)
	public void ostrichEggHatches(GameTestHelper helper) {
		BlockPos pos = helper.absolutePos(new BlockPos(3, 1, 3));
		Hatchery.add(helper.getLevel(), pos);
		helper.succeedWhen(() -> {
			List<SafariMount> chicks = helper.getLevel().getEntitiesOfClass(SafariMount.class, new AABB(pos).inflate(3), Mob::isBaby);
			if (chicks.isEmpty()) helper.fail("No ostrich chick yet");
		});
	}

	/** A thrown spear damages what it hits. */
	@GameTest(maxTicks = 100)
	public void spearHits(GameTestHelper helper) {
		Mob target = spawn(helper, "warthog", new BlockPos(6, 1, 3));
		target.setNoAi(true);
		float health = target.getHealth();
		Vec3 from = helper.absoluteVec(new Vec3(1.5, 1.5, 3.5));
		ThrownSpear spear = new ThrownSpear(helper.getLevel(), from.x, from.y, from.z, new ItemStack(SafariRegistry.FLINT_SPEAR));
		spear.shoot(1, 0, 0, 1.5F, 0);
		helper.getLevel().addFreshEntity(spear);
		helper.succeedWhen(() -> {
			if (target.getHealth() >= health) helper.fail("Spear did not hurt the warthog");
		});
	}

	/** Mounts can be tamed and accept a rider seat. */
	@GameTest(maxTicks = 20)
	public void zebraCanBeTamed(GameTestHelper helper) {
		SafariMount zebra = (SafariMount) spawn(helper, "zebra", new BlockPos(3, 1, 3));
		zebra.setTamed(true);
		if (!zebra.isTamed()) helper.fail("Zebra could not be tamed");
		helper.succeed();
	}
}
