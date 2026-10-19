package dk.ulfen.safari.species;

import java.util.List;
import java.util.Set;

/**
 * One animal's settings, generated from the shared specs into data/safari/species.json
 * by tools/java.mjs. Field names match the JSON.
 */
public record Species(
	String id,
	String kind,
	float width,
	float height,
	double health,
	double speed,
	double attackDamage,
	double attackSpeed,
	boolean leap,
	double knockbackResistance,
	boolean alertsPack,
	List<String> hunts,
	int huntInterval,
	double huntRange,
	List<String> fleesFrom,
	float fleeDistance,
	double fleeSpeed,
	double panicSpeed,
	Hostile hostile,
	String sleeps,
	String movement,
	double flySpeed,
	double swimSpeed,
	boolean school,
	boolean hidesInShell,
	boolean poisonous,
	boolean quills,
	boolean poisonImmune,
	boolean colourChange,
	boolean shocks,
	boolean constricts,
	String attackEffect,
	List<String> variantTextures,
	boolean climbs,
	boolean fallImmune,
	boolean grazes,
	boolean wades,
	List<String> breed,
	List<String> tempt,
	List<Heal> heal,
	int variants,
	float babyScale,
	float scale,
	Ride ride,
	Sounds sounds,
	Set<String> animations,
	List<String> idle,
	double runSpeed,
	String maneRule,
	List<Spawn> spawns,
	String layEgg,
	boolean scavenger
) {
	public record Hostile(double range, String when) {}

	public record Heal(String item, float amount) {}

	public record Ride(int seats, double seatHeight, boolean chest, boolean jump, double jumpStrength, List<String> tameItems, int temper) {}

	public record Sounds(String ambient, String hurt, String death, float pitchMin, float pitchMax, int interval) {}

	public record Spawn(List<String> biomes, int weight, int min, int max, boolean water) {}

	public boolean isMount() {
		return "mount".equals(kind);
	}

	public boolean flies() {
		return "fly".equals(movement);
	}

	public boolean amphibious() {
		return "amphibious".equals(movement);
	}

	public boolean isSwimmer() {
		return "swimmer".equals(kind);
	}

	/** Air-breathing swimmers (river dolphins) have to surface. */
	public boolean breathesAir() {
		return "dolphin".equals(movement);
	}

	public boolean climbsWalls() {
		return "climb".equals(movement);
	}

	public boolean waterOnly() {
		return !spawns.isEmpty() && spawns.stream().allMatch(Spawn::water);
	}

	public boolean attacks() {
		return attackDamage > 0;
	}

	public boolean hasAnimation(String name) {
		return animations.contains(name);
	}

	/** Full GeckoLib animation name, e.g. animation.safari.lion.walk. */
	public String animation(String name) {
		return "animation.safari." + id + "." + name;
	}
}
