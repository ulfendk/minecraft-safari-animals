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
