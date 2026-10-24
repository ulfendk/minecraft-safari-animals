package dk.ulfen.safari.entity;

import com.geckolib.animatable.GeoEntity;
import com.geckolib.animatable.manager.AnimatableManager;
import com.geckolib.animation.AnimationController;
import com.geckolib.animation.object.PlayState;
import com.geckolib.animation.RawAnimation;
import com.geckolib.constant.DataTickets;

import dk.ulfen.safari.species.Species;
import net.minecraft.world.entity.Mob;
import net.minecraft.world.phys.Vec3;

/** Shared by every safari animal, whether it's a plain animal or a rideable mount. */
public interface SafariCreature extends GeoEntity {
	/** One-shot animations the server can trigger. */
	String[] ACTIONS = {"attack", "roar", "trumpet", "chest_beat", "yawn", "pronk", "throw", "pounce", "threat", "rear"};

	/**
	 * Entity tag Realistic Hunting puts on an animal it has brought down (a carcass that
	 * lies still until it's field dressed). The animal then lies on its side and its
	 * behaviours stop; see {@link #isCarcass()}.
	 */
	String HUNTING_CARCASS = "hunting.carcass";

	Species species();

	boolean isResting();

	void setResting(boolean resting);

	int getVariant();

	/** Client-side countdown while grazing. */
	int eatTicks();

	/** Synced from the {@link #HUNTING_CARCASS} tag (tags aren't sent to clients). */
	boolean isCarcass();

	default boolean isSentry() {
		return false;
	}

	default boolean isHiding() {
		return false;
	}

	default boolean isCoiling() {
		return false;
	}

	/** Play a one-shot animation on all clients, if this species has it. */
	default void playAction(String name) {
		if (species().hasAnimation(name)) triggerAnim("action", name);
	}

	/** Movement/posture animations plus a channel for triggered one-shots. */
	static <T extends Mob & SafariCreature> void registerControllers(T creature, AnimatableManager.ControllerRegistrar controllers) {
		Species s = creature.species();
		controllers.add(new AnimationController<T>("move", 4, state -> {
			T e = state.animatable();
			Vec3 v = state.getDataOrDefault(DataTickets.VELOCITY, Vec3.ZERO);
			double speed = Math.sqrt(v.x * v.x + v.z * v.z) * 20;
			String anim = pickMove(e, s, speed);
			if (anim == null) return PlayState.STOP;
			if (anim.equals("dead")) return state.setAndContinue(RawAnimation.begin().thenPlayAndHold(s.animation(anim)));
			return state.setAndContinue(RawAnimation.begin().thenLoop(s.animation(anim)));
		}));
		// A second idle layer (e.g. the elephant's swaying trunk).
		if (s.idle().size() > 1) {
			String extra = s.idle().get(1);
			controllers.add(new AnimationController<T>("ambient", 4, state ->
				state.animatable().isResting() || state.animatable().isCarcass() ? PlayState.STOP : state.setAndContinue(RawAnimation.begin().thenLoop(s.animation(extra)))));
		}
		AnimationController<T> action = new AnimationController<>("action", 2, state -> PlayState.STOP);
		for (String name : ACTIONS) {
			if (s.hasAnimation(name)) action.triggerableAnim(name, RawAnimation.begin().thenPlay(s.animation(name)));
		}
		controllers.add(action);
	}

	private static String pickMove(Mob e, Species s, double speed) {
		SafariCreature c = (SafariCreature) e;
		if (c.isCarcass() && s.hasAnimation("dead")) return "dead";
		if (c.isResting() && s.hasAnimation("sleep")) return "sleep";
		if (c.isCoiling() && s.hasAnimation("coil")) return "coil";
		if (c.isHiding() && s.hasAnimation("hide")) return "hide";
		if (s.flies() && !e.onGround() && !e.isInWater() && s.hasAnimation("fly")) return "fly";
		if (e.isInWater() && !e.onGround() && s.hasAnimation("swim")) return "swim";
		if (c.isSentry() && s.hasAnimation("stand")) return "stand";
		if (c.eatTicks() > 0 && s.hasAnimation("eat")) return "eat";
		if (speed > s.runSpeed() && s.hasAnimation("run")) return "run";
		if (speed > 0.4 && s.hasAnimation("walk")) return "walk";
		String idle = s.idle().isEmpty() ? "idle" : s.idle().get(0);
		return s.hasAnimation(idle) ? idle : null;
	}
}
