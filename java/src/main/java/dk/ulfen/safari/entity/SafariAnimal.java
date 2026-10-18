package dk.ulfen.safari.entity;

import com.geckolib.animatable.instance.AnimatableInstanceCache;
import com.geckolib.animatable.manager.AnimatableManager;
import com.geckolib.util.GeckoLibUtil;

import dk.ulfen.safari.species.Species;
import dk.ulfen.safari.species.SpeciesRegistry;
import net.minecraft.core.BlockPos;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.network.syncher.EntityDataAccessor;
import net.minecraft.network.syncher.EntityDataSerializers;
import net.minecraft.network.syncher.SynchedEntityData;
import net.minecraft.resources.Identifier;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.sounds.SoundEvent;
import net.minecraft.util.RandomSource;
import net.minecraft.world.DifficultyInstance;
import net.minecraft.world.damagesource.DamageSource;
import net.minecraft.world.entity.AgeableMob;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.EntitySpawnReason;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.Mob;
import net.minecraft.world.entity.SpawnGroupData;
import net.minecraft.world.entity.ai.attributes.AttributeSupplier;
import net.minecraft.world.entity.ai.attributes.Attributes;
import net.minecraft.world.entity.ai.control.FlyingMoveControl;
import net.minecraft.world.entity.ai.goal.BreedGoal;
import net.minecraft.world.entity.ai.goal.EatBlockGoal;
import net.minecraft.world.entity.ai.goal.FloatGoal;
import net.minecraft.world.entity.ai.goal.FollowParentGoal;
import net.minecraft.world.entity.ai.goal.LookAtPlayerGoal;
import net.minecraft.world.entity.ai.goal.PanicGoal;
import net.minecraft.world.entity.ai.goal.RandomLookAroundGoal;
import net.minecraft.world.entity.ai.goal.RandomSwimmingGoal;
import net.minecraft.world.entity.ai.goal.TemptGoal;
import net.minecraft.world.entity.ai.goal.WaterAvoidingRandomFlyingGoal;
import net.minecraft.world.entity.ai.goal.WaterAvoidingRandomStrollGoal;
import net.minecraft.world.entity.ai.navigation.AmphibiousPathNavigation;
import net.minecraft.world.entity.ai.navigation.FlyingPathNavigation;
import net.minecraft.world.entity.ai.navigation.PathNavigation;
import net.minecraft.world.entity.animal.Animal;
import net.minecraft.world.entity.item.ItemEntity;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.ServerLevelAccessor;
import net.minecraft.world.level.storage.ValueInput;
import net.minecraft.world.level.storage.ValueOutput;
import org.jspecify.annotations.Nullable;

/** Every non-rideable safari animal. Behaviour comes from its {@link Species}. */
public class SafariAnimal extends Animal implements SafariCreature {
	private static final EntityDataAccessor<Boolean> RESTING = SynchedEntityData.defineId(SafariAnimal.class, EntityDataSerializers.BOOLEAN);
	private static final EntityDataAccessor<Integer> VARIANT = SynchedEntityData.defineId(SafariAnimal.class, EntityDataSerializers.INT);
	private static final EntityDataAccessor<Boolean> SENTRY = SynchedEntityData.defineId(SafariAnimal.class, EntityDataSerializers.BOOLEAN);
	private static final EntityDataAccessor<Boolean> HIDING = SynchedEntityData.defineId(SafariAnimal.class, EntityDataSerializers.BOOLEAN);
	private int hidingTicks;

	private final AnimatableInstanceCache geoCache = GeckoLibUtil.createInstanceCache(this);
	private int eatTicks;
	private int eggTime;
	int behaviourCooldown;
	@Nullable ItemStack stolen;
	int stolenUntil;

	public SafariAnimal(EntityType<? extends SafariAnimal> type, Level level) {
		super(type, level);
		Species s = species();
		if (s.flies()) this.moveControl = new FlyingMoveControl(this, 20, true);
		if (s.scavenger()) this.setCanPickUpLoot(true);
		this.eggTime = this.random.nextInt(6000) + 6000;
	}

	public static AttributeSupplier.Builder createAttributes(Species s) {
		AttributeSupplier.Builder b = Animal.createAnimalAttributes()
			.add(Attributes.MAX_HEALTH, s.health())
			.add(Attributes.MOVEMENT_SPEED, s.speed())
			.add(Attributes.FOLLOW_RANGE, Math.max(24, s.huntRange() + 8))
			.add(Attributes.KNOCKBACK_RESISTANCE, s.knockbackResistance());
		if (s.attacks()) b.add(Attributes.ATTACK_DAMAGE, s.attackDamage());
		if (s.flies()) b.add(Attributes.FLYING_SPEED, s.flySpeed() * 2.5);
		return b;
	}

	@Override
	public Species species() {
		return SpeciesRegistry.of(this.getType());
	}

	@Override
	protected void defineSynchedData(SynchedEntityData.Builder builder) {
		super.defineSynchedData(builder);
		builder.define(RESTING, false);
		builder.define(VARIANT, 0);
		builder.define(SENTRY, false);
		builder.define(HIDING, false);
	}

	@Override
	protected PathNavigation createNavigation(Level level) {
		Species s = SpeciesRegistry.of(this.getType());
		if (s.flies()) {
			FlyingPathNavigation nav = new FlyingPathNavigation(this, level);
			nav.setCanOpenDoors(false);
			nav.setCanFloat(true);
			return nav;
		}
		if (s.amphibious()) return new AmphibiousPathNavigation(this, level);
		if (s.climbsWalls()) return new net.minecraft.world.entity.ai.navigation.WallClimberNavigation(this, level);
		return super.createNavigation(level);
	}

	@Override
	protected void registerGoals() {
		Species s = species();
		if (!s.amphibious()) this.goalSelector.addGoal(0, new FloatGoal(this));
		if (!s.attacks()) this.goalSelector.addGoal(1, new PanicGoal(this, s.panicSpeed()));
		this.goalSelector.addGoal(2, new BreedGoal(this, 1.0));
		this.goalSelector.addGoal(4, new TemptGoal(this, 1.1, this::isTemptItem, false));
		this.goalSelector.addGoal(5, new FollowParentGoal(this, 1.1));
		this.goalSelector.addGoal(6, new SleepGoal<>(this));
		if (s.grazes()) this.goalSelector.addGoal(7, new EatBlockGoal(this));
		if (s.flies()) this.goalSelector.addGoal(8, new WaterAvoidingRandomFlyingGoal(this, 1.0));
		else if (s.amphibious()) {
			this.goalSelector.addGoal(8, new RandomSwimmingGoal(this, 1.0, 80));
			this.goalSelector.addGoal(8, new WaterAvoidingRandomStrollGoal(this, 0.8));
		} else this.goalSelector.addGoal(8, new WaterAvoidingRandomStrollGoal(this, 0.8));
		this.goalSelector.addGoal(9, new LookAtPlayerGoal(this, Player.class, 8.0F));
		this.goalSelector.addGoal(10, new RandomLookAroundGoal(this));
		SafariGoals.addCombat(this, s, this.goalSelector, this.targetSelector);
	}

	private boolean isTemptItem(ItemStack stack) {
		return matches(stack, species().tempt());
	}

	static boolean matches(ItemStack stack, Iterable<String> ids) {
		String id = BuiltInRegistries.ITEM.getKey(stack.getItem()).toString();
		for (String s : ids) if (s.equals(id)) return true;
		return false;
	}

	@Override
	public boolean isFood(ItemStack stack) {
		return matches(stack, species().breed());
	}

	@Override
	public @Nullable AgeableMob getBreedOffspring(ServerLevel level, AgeableMob partner) {
		SafariAnimal baby = (SafariAnimal) this.getType().create(level, EntitySpawnReason.BREEDING);
		if (baby != null) baby.setVariant(this.random.nextBoolean() ? this.getVariant() : ((SafariCreature) partner).getVariant());
		return baby;
	}

	@Override
	public @Nullable SpawnGroupData finalizeSpawn(ServerLevelAccessor level, DifficultyInstance difficulty, EntitySpawnReason reason, @Nullable SpawnGroupData groupData) {
		int variants = species().variants();
		if (variants > 1) setVariant(this.random.nextFloat() < 1.0F / (variants + 1) ? 0 : 1 + this.random.nextInt(variants - 1));
		return super.finalizeSpawn(level, difficulty, reason, groupData);
	}

	// ---------------------------------------------------------------- state

	@Override
	public boolean isResting() {
		return this.entityData.get(RESTING);
	}

	@Override
	public void setResting(boolean resting) {
		this.entityData.set(RESTING, resting);
	}

	@Override
	public int getVariant() {
		return this.entityData.get(VARIANT);
	}

	public void setVariant(int variant) {
		this.entityData.set(VARIANT, variant);
	}

	@Override
	public boolean isSentry() {
		return this.entityData.get(SENTRY);
	}

	public void setSentry(boolean sentry) {
		this.entityData.set(SENTRY, sentry);
	}

	@Override
	public boolean isHiding() {
		return this.entityData.get(HIDING);
	}

	@Override
	public int eatTicks() {
		return this.eatTicks;
	}

	@Override
	public void handleEntityEvent(byte id) {
		if (id == 10) this.eatTicks = 40; // grazing (EatBlockGoal)
		else super.handleEntityEvent(id);
	}

	@Override
	public void aiStep() {
		super.aiStep();
		if (this.eatTicks > 0) this.eatTicks--;
		if (this.isResting()) this.getNavigation().stop();
		if (this.level() instanceof ServerLevel level) {
			// Shell animals stay tucked in for a while after being hurt.
			if (this.hidingTicks > 0) {
				this.getNavigation().stop();
				if (--this.hidingTicks == 0) this.entityData.set(HIDING, false);
			}
			// Chameleons take on the colour of what they stand on.
			if (species().colourChange() && this.tickCount % 20 == 0) {
				int colour = SafariDefences.camouflageFor(SafariDefences.blockBelow(this));
				if (colour >= 0 && colour != getVariant()) setVariant(colour);
			}
			SafariBehaviours.tick(this, level);
			layEggs(level);
		}
	}

	private void layEggs(ServerLevel level) {
		String egg = species().layEgg();
		if (egg == null || this.isBaby() || --this.eggTime > 0) return;
		Item item = BuiltInRegistries.ITEM.getValue(Identifier.parse(egg));
		this.spawnAtLocation(level, item);
		this.playSound(net.minecraft.sounds.SoundEvents.CHICKEN_EGG, 1.0F, 0.6F);
		this.eggTime = this.random.nextInt(12000) + 12000;
	}

	@Override
	public boolean hurtServer(ServerLevel level, DamageSource source, float damage) {
		setResting(false);
		Species s = species();
		if (s.hidesInShell()) {
			if (isHiding()) damage *= 0.2F;
			this.hidingTicks = 120;
			this.entityData.set(HIDING, true);
		}
		boolean hurt = super.hurtServer(level, source, damage);
		if (hurt) {
			SafariBehaviours.onHurt(this, level, source);
			SafariDefences.onHurt(this, s, level, source);
		}
		return hurt;
	}

	@Override
	public boolean canBeAffected(net.minecraft.world.effect.MobEffectInstance effect) {
		return !SafariDefences.immuneTo(species(), effect) && super.canBeAffected(effect);
	}

	@Override
	public boolean doHurtTarget(ServerLevel level, Entity target) {
		playAction("attack");
		boolean hit = super.doHurtTarget(level, target);
		if (hit) SafariDefences.onBite(this, species(), level, target);
		return hit;
	}

	/** Wiping a dart along a poison dart frog's skin coats it with poison. */
	@Override
	public net.minecraft.world.InteractionResult mobInteract(Player player, net.minecraft.world.InteractionHand hand) {
		ItemStack held = player.getItemInHand(hand);
		if (species().poisonous() && held.is(dk.ulfen.safari.SafariRegistry.DART)) {
			if (!this.level().isClientSide()) {
				held.consume(1, player);
				ItemStack coated = new ItemStack(dk.ulfen.safari.SafariRegistry.POISON_DART);
				if (!player.getInventory().add(coated)) this.spawnAtLocation((ServerLevel) this.level(), coated);
				this.playSound(net.minecraft.sounds.SoundEvents.FROG_EAT, 1.0F, 1.4F);
				player.sendOverlayMessage(net.minecraft.network.chat.Component.translatable("safari.dart.coated"));
			}
			return net.minecraft.world.InteractionResult.SUCCESS;
		}
		return super.mobInteract(player, hand);
	}

	@Override
	public boolean causeFallDamage(double fallDistance, float damageModifier, DamageSource source) {
		return !species().fallImmune() && super.causeFallDamage(fallDistance, damageModifier, source);
	}

	@Override
	public boolean onClimbable() {
		return (species().climbs() || species().climbsWalls()) && this.horizontalCollision || super.onClimbable();
	}

	@Override
	public boolean canBreatheUnderwater() {
		return species().amphibious();
	}

	@Override
	public boolean isPushedByFluid() {
		return !species().amphibious();
	}

	// ---------------------------------------------------------------- scavenging

	@Override
	public boolean wantsToPickUp(ServerLevel level, ItemStack stack) {
		return species().scavenger() && this.getMainHandItem().isEmpty() && SafariBehaviours.isMeat(stack);
	}

	@Override
	protected void pickUpItem(ServerLevel level, ItemEntity entity) {
		ItemStack stack = entity.getItem();
		if (wantsToPickUp(level, stack)) {
			this.onItemPickup(entity);
			this.setItemSlot(net.minecraft.world.entity.EquipmentSlot.MAINHAND, stack.split(1));
			this.take(entity, 1);
			if (stack.isEmpty()) entity.discard();
		}
	}

	// ---------------------------------------------------------------- sounds

	private static @Nullable SoundEvent sound(@Nullable String id) {
		return id == null ? null : BuiltInRegistries.SOUND_EVENT.getValue(Identifier.parse(id));
	}

	@Override
	protected @Nullable SoundEvent getAmbientSound() {
		return isResting() ? null : sound(species().sounds().ambient());
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
	public int getAmbientSoundInterval() {
		return species().sounds().interval() * 20;
	}

	@Override
	public float getVoicePitch() {
		Species.Sounds s = species().sounds();
		float pitch = s.pitchMin() + this.random.nextFloat() * (s.pitchMax() - s.pitchMin());
		return this.isBaby() ? pitch * 1.4F : pitch;
	}

	// ---------------------------------------------------------------- saving

	@Override
	protected void addAdditionalSaveData(ValueOutput output) {
		super.addAdditionalSaveData(output);
		output.putInt("Variant", getVariant());
		output.putInt("EggLayTime", this.eggTime);
	}

	@Override
	protected void readAdditionalSaveData(ValueInput input) {
		super.readAdditionalSaveData(input);
		setVariant(input.getIntOr("Variant", 0));
		this.eggTime = input.getIntOr("EggLayTime", 6000);
	}

	// ---------------------------------------------------------------- GeckoLib

	@Override
	public void registerControllers(AnimatableManager.ControllerRegistrar controllers) {
		SafariCreature.registerControllers(this, controllers);
	}

	@Override
	public AnimatableInstanceCache getAnimatableInstanceCache() {
		return this.geoCache;
	}

	/** Spawn rule: on solid ground (or by water for swimmers) with some daylight. */
	public static boolean checkSpawn(EntityType<? extends Mob> type, ServerLevelAccessor level, EntitySpawnReason reason, BlockPos pos, RandomSource random) {
		BlockPos below = pos.below();
		boolean solid = level.getBlockState(below).isFaceSturdy(level, below, net.minecraft.core.Direction.UP);
		return (solid || level.getFluidState(below).isSource()) && level.getRawBrightness(pos, 0) > 8;
	}
}
