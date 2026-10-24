package dk.ulfen.safari.test;

import java.util.List;

import dk.ulfen.safari.SafariRegistry;
import net.fabricmc.fabric.api.client.gametest.v1.FabricClientGameTest;
import net.fabricmc.fabric.api.client.gametest.v1.context.ClientGameTestContext;
import net.fabricmc.fabric.api.client.gametest.v1.context.TestSingleplayerContext;

/**
 * Starts a real client, lines up the animals in front of the camera and takes screenshots
 * (run with `./gradlew runClientGameTest`; images land in build/run/clientGameTest/screenshots).
 */
public class SafariClientGameTest implements FabricClientGameTest {
	@Override
	public void runTest(ClientGameTestContext context) {
		try (TestSingleplayerContext world = context.worldBuilder().create()) {
			world.getServer().runCommand("gamerule doDaylightCycle false");
			world.getServer().runCommand("gamerule doMobSpawning false");
			world.getServer().runCommand("time set noon");
			world.getServer().runCommand("weather clear");
			context.waitTicks(20);

			List<String> only = System.getProperty("safari.screenshot") == null ? List.of() : List.of(System.getProperty("safari.screenshot").split(","));
			List<String> ids = SafariRegistry.ANIMALS.keySet().stream().filter(id -> only.isEmpty() || only.contains(id)).toList();
			for (int group = 0; group * 3 < ids.size(); group++) {
				world.getServer().runCommand("kill @e[type=!player]");
				world.getServer().runCommand("fill -8 -62 " + (group * 40 - 4) + " 8 -58 " + (group * 40 + 4) + " air replace water");
				int z = group * 40;
				for (int i = 0; i < 3 && group * 3 + i < ids.size(); i++) {
					int x = (i - 1) * 4;
					String id = ids.get(group * 3 + i);
					boolean water = SafariRegistry.ANIMALS.get(id).getCategory() == net.minecraft.world.entity.MobCategory.WATER_CREATURE;
					if (water) {
						// A glass tank so the water doesn't spread over the flat world.
						world.getServer().runCommand("fill " + (x - 2) + " -62 " + (z - 2) + " " + (x + 2) + " -59 " + (z + 2) + " glass");
						world.getServer().runCommand("fill " + (x - 1) + " -61 " + (z - 1) + " " + (x + 1) + " -59 " + (z + 1) + " water");
					}
					world.getServer().runCommand("summon safari:" + id + " " + x + (water ? " -60.5 " : " -60 ") + z + " {NoAI:1b,Rotation:[150f,0f]}");
				}
				world.getServer().runCommand("tp @p 0 -58 " + (z - 6) + " 0 22");
				context.waitTicks(40);
				context.takeScreenshot("safari_group_" + group);
			}

			// An anaconda wrapped around a pig.
			world.getServer().runCommand("kill @e[type=!player]");
			world.getServer().runCommand("summon safari:anaconda 0 -60 0 {Rotation:[150f,0f]}");
			world.getServer().runCommand("summon minecraft:pig 0 -60 0.5 {NoAI:1b,Rotation:[150f,0f]}");
			world.getServer().runCommand("effect give @e[type=minecraft:pig] resistance 60 3 true");
			world.getServer().runCommand("tp @p 0 -58.5 -3.5 0 25");
			context.waitTicks(10);
			world.getServer().runOnServer(server -> {
				var level = server.overworld();
				var snake = level.getEntitiesOfClass(dk.ulfen.safari.entity.SafariAnimal.class, new net.minecraft.world.phys.AABB(-5, -64, -5, 5, -55, 5), e -> e.isAlive() && e.species().id().equals("anaconda")).getFirst();
				var pig = level.getEntitiesOfClass(net.minecraft.world.entity.Mob.class, new net.minecraft.world.phys.AABB(-5, -64, -5, 5, -55, 5), e -> e.getType() == net.minecraft.world.entity.EntityTypes.PIG).getFirst();
				snake.doHurtTarget(level, pig);
			});
			context.waitTicks(30);
			context.takeScreenshot("safari_coil");
			world.getServer().runCommand("tp @p -3.5 -59 0.5 -90 10");
			context.waitTicks(5);
			context.takeScreenshot("safari_coil_side");
			world.getServer().runCommand("tp @p 0.5 -56 0.5 0 90");
			context.waitTicks(5);
			context.takeScreenshot("safari_coil_top");

			// The snakes' threat display: the cobra spreads its hood, the mamba gapes.
			world.getServer().runCommand("kill @e[type=!player]");
			world.getServer().runCommand("summon safari:king_cobra -1 -60 0 {NoAI:1b,Rotation:[180f,0f]}");
			world.getServer().runCommand("summon safari:black_mamba 1.5 -60 0 {NoAI:1b,Rotation:[180f,0f]}");
			world.getServer().runCommand("tp @p 0.25 -59.4 -2.4 0 8");
			context.waitTicks(60);
			world.getServer().runOnServer(server -> {
				for (var snake : server.overworld().getEntitiesOfClass(dk.ulfen.safari.entity.SafariAnimal.class, new net.minecraft.world.phys.AABB(-5, -64, -5, 5, -55, 5), e -> e.isAlive())) {
					snake.playAction("threat");
				}
			});
			context.waitTicks(12);
			context.takeScreenshot("safari_threat");

			// Bears rear up on their hind legs.
			world.getServer().runCommand("kill @e[type=!player]");
			world.getServer().runCommand("summon safari:grizzly_bear -2.5 -60 0 {NoAI:1b,Rotation:[90f,0f]}");
			world.getServer().runCommand("summon safari:sun_bear 1.5 -60 0 {NoAI:1b,Rotation:[90f,0f]}");
			world.getServer().runCommand("tp @p -0.5 -58.5 -6 0 10");
			context.waitTicks(60);
			world.getServer().runOnServer(server -> {
				for (var bear : server.overworld().getEntitiesOfClass(dk.ulfen.safari.entity.SafariAnimal.class, new net.minecraft.world.phys.AABB(-5, -64, -5, 5, -55, 5), e -> e.isAlive())) {
					bear.playAction("rear");
				}
			});
			context.waitTicks(20);
			context.takeScreenshot("safari_rear");

			// A thrown spear in flight, seen from the side.
			world.getServer().runCommand("kill @e[type=!player]");
			world.getServer().runCommand("tp @p 0 -57.5 -4 0 18");
			context.waitTicks(60); // let the chunks around the camera load again
			world.getServer().runCommand("summon safari:thrown_spear -1.5 -58.6 0 {Motion:[0.04d,0.0d,0.0d],NoGravity:1b}");
			context.waitTicks(3);
			context.takeScreenshot("safari_spear");
		}
	}
}
