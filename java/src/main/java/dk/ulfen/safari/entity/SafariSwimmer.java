package dk.ulfen.safari.entity;

import java.util.List;

import com.geckolib.animatable.instance.AnimatableInstanceCache;
import com.geckolib.animatable.manager.AnimatableManager;
import com.geckolib.util.GeckoLibUtil;

import dk.ulfen.safari.species.Species;
import dk.ulfen.safari.species.SpeciesRegistry;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.resources.Identifier;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.sounds.SoundEvent;
import net.minecraft.world.damagesource.DamageSource;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.ai.attributes.AttributeSupplier;
import net.minecraft.world.entity.ai.attributes.Attributes;
import net.minecraft.world.entity.ai.control.SmoothSwimmingLookControl;
import net.minecraft.world.entity.ai.control.SmoothSwimmingMoveControl;
import net.minecraft.world.entity.ai.goal.BreathAirGoal;
import net.minecraft.world.entity.ai.goal.Goal;
import net.minecraft.world.entity.ai.goal.PanicGoal;
import net.minecraft.world.entity.ai.goal.RandomSwimmingGoal;
import net.minecraft.world.entity.ai.navigation.PathNavigation;
import net.minecraft.world.entity.ai.navigation.WaterBoundPathNavigation;
import net.minecraft.world.entity.animal.fish.WaterAnimal;
import net.minecraft.world.level.Level;
import net.minecraft.world.phys.Vec3;
import org.jspecify.annotations.Nullable;

/** Fish, eels and river dolphins. Fish can't leave the water; dolphins must surface to breathe. */
public class SafariSwimmer extends WaterAnimal implements SafariCreature {
	private final AnimatableInstanceCache geoCache = GeckoLibUtil.createInstanceCache(this);

	public SafariSwimmer(EntityType<? extends SafariSwimmer> type, Level level) {
		super(type, level);
		this.moveControl = new SmoothSwimmingMoveControl(this, 85, 10, 0.02F, 0.1F, true);
		this.lookControl = new SmoothSwimmingLookControl(this, 10);
		this.refreshDimensions(); // apply the species' size multiplier (scale attribute) to the hitbox
	}

	public static AttributeSupplier.Builder createAttributes(Species s) {
		AttributeSupplier.Builder b = WaterAnimal.createMobAttributes()
			.add(Attributes.MAX_HEALTH, s.health())
			.add(Attributes.MOVEMENT_SPEED, s.swimSpeed() * 8)
			.add(Attributes.FOLLOW_RANGE, Math.max(16, s.huntRange() + 6))
			.add(Attributes.SCALE, s.scale());
		if (s.attacks()) b.add(Attributes.ATTACK_DAMAGE, s.attackDamage());
		return b;
	}

	@Override
	public Species species() {
		return SpeciesRegistry.of(this.getType());
	}

	@Override
	protected PathNavigation createNavigation(Level level) {
		return new WaterBoundPathNavigation(this, level);
	}

	@Override
	protected void registerGoals() {
		Species s = species();
		if (s.breathesAir()) this.goalSelector.addGoal(0, new BreathAirGoal(this));
		if (!s.attacks()) this.goalSelector.addGoal(1, new PanicGoal(this, 1.3));
		if (s.school()) this.goalSelector.addGoal(5, new SchoolGoal(this));
		this.goalSelector.addGoal(6, new RandomSwimmingGoal(this, 1.0, 10));
		SafariGoals.addCombat(this, s, this.goalSelector, this.targetSelector);
	}

	/** Air for river dolphins: used up underwater, refilled at the surface. */
	@Override
	protected void handleAirSupply(ServerLevel level, int preTickAirSupply) {
		if (!species().breathesAir()) {
			super.handleAirSupply(level, preTickAirSupply);
			return;
		}
		if (this.isInWater() && this.isEyeInFluid(net.minecraft.tags.FluidTags.WATER)) {
			this.setAirSupply(preTickAirSupply - 1);
			if (this.getAirSupply() <= -20) {
				this.setAirSupply(0);
				this.hurtServer(level, this.damageSources().drown(), 2.0F);
			}
		} else {
			this.setAirSupply(this.getMaxAirSupply());
		}
	}

	@Override
	public int getMaxAirSupply() {
		return species().breathesAir() ? 4800 : super.getMaxAirSupply();
	}

	@Override
	public boolean hurtServer(ServerLevel level, DamageSource source, float damage) {
		boolean hurt = super.hurtServer(level, source, damage);
		if (hurt) SafariDefences.onHurt(this, species(), level, source);
		return hurt;
	}

	@Override
	public boolean doHurtTarget(ServerLevel level, Entity target) {
		playAction("attack");
		boolean hit = super.doHurtTarget(level, target);
		if (hit) SafariDefences.onBite(this, species(), level, target);
		return hit;
	}

	// ---------------------------------------------------------------- state (swimmers don't sleep or graze)

	@Override
	public boolean isResting() {
		return false;
	}

	@Override
	public void setResting(boolean resting) {}

	@Override
	public int getVariant() {
		return 0;
	}

	@Override
	public int eatTicks() {
		return 0;
	}

	private static @Nullable SoundEvent sound(@Nullable String id) {
		return id == null ? null : BuiltInRegistries.SOUND_EVENT.getValue(Identifier.parse(id));
	}

	@Override
	protected @Nullable SoundEvent getAmbientSound() {
		return sound(species().sounds().ambient());
	}

	@Override
	protected @Nullable SoundEvent getHurtSound(DamageSource source) {
		return sound(species().sounds().hurt());
	}

	@Override
	protected @Nullable SoundEvent getDeathSound() {
		return sound(species().sounds().death());
	}

	@Override
	public void registerControllers(AnimatableManager.ControllerRegistrar controllers) {
		SafariCreature.registerControllers(this, controllers);
	}

	@Override
	public AnimatableInstanceCache getAnimatableInstanceCache() {
		return this.geoCache;
	}

	/** Keeps a school of fish together: drift towards the others when straying. */
	static class SchoolGoal extends Goal {
		private final SafariSwimmer fish;
		private int cooldown;

		SchoolGoal(SafariSwimmer fish) {
			this.fish = fish;
		}

		@Override
		public boolean canUse() {
			if (--this.cooldown > 0 || this.fish.getTarget() != null) return false;
			this.cooldown = reducedTickDelay(40);
			return true;
		}

		@Override
		public void start() {
			List<SafariSwimmer> school = this.fish.level().getEntitiesOfClass(SafariSwimmer.class, this.fish.getBoundingBox().inflate(10),
				o -> o != this.fish && o.getType() == this.fish.getType());
			if (school.isEmpty()) return;
			Vec3 centre = school.stream().map(Entity::position).reduce(Vec3.ZERO, Vec3::add).scale(1.0 / school.size());
			if (centre.distanceTo(this.fish.position()) > 3) this.fish.getNavigation().moveTo(centre.x, centre.y, centre.z, 1.1);
		}

		@Override
		public boolean canContinueToUse() {
			return false;
		}
	}
}
