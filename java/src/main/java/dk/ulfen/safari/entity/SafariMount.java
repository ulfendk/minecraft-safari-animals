package dk.ulfen.safari.entity;

import com.geckolib.animatable.instance.AnimatableInstanceCache;
import com.geckolib.animatable.manager.AnimatableManager;
import com.geckolib.util.GeckoLibUtil;

import dk.ulfen.safari.species.Species;
import dk.ulfen.safari.species.SpeciesRegistry;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.network.syncher.EntityDataAccessor;
import net.minecraft.network.syncher.EntityDataSerializers;
import net.minecraft.network.syncher.SynchedEntityData;
import net.minecraft.resources.Identifier;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.sounds.SoundEvent;
import net.minecraft.util.RandomSource;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.InteractionResult;
import net.minecraft.world.damagesource.DamageSource;
import net.minecraft.world.entity.AgeableMob;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.EntityDimensions;
import net.minecraft.world.entity.EntitySpawnReason;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.ai.attributes.AttributeSupplier;
import net.minecraft.world.entity.ai.attributes.Attributes;
import net.minecraft.world.entity.animal.Animal;
import net.minecraft.world.entity.animal.equine.AbstractChestedHorse;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.Items;
import net.minecraft.world.level.Level;
import net.minecraft.world.phys.Vec3;
import org.jspecify.annotations.Nullable;

/** Tameable, rideable safari animals (zebra, ostrich, elephant), built on vanilla horse riding. */
public class SafariMount extends AbstractChestedHorse implements SafariCreature {
	private static final EntityDataAccessor<Boolean> RESTING = SynchedEntityData.defineId(SafariMount.class, EntityDataSerializers.BOOLEAN);

	private final AnimatableInstanceCache geoCache = GeckoLibUtil.createInstanceCache(this);
	private int eatTicks;

	public SafariMount(EntityType<? extends SafariMount> type, Level level) {
		super(type, level);
	}

	public static AttributeSupplier.Builder createAttributes(Species s) {
		AttributeSupplier.Builder b = AbstractChestedHorse.createBaseChestedHorseAttributes()
			.add(Attributes.MAX_HEALTH, s.health())
			.add(Attributes.MOVEMENT_SPEED, s.speed())
			.add(Attributes.JUMP_STRENGTH, s.ride().jump() ? s.ride().jumpStrength() : 0.0)
			.add(Attributes.KNOCKBACK_RESISTANCE, s.knockbackResistance());
		if (s.attacks()) b.add(Attributes.ATTACK_DAMAGE, s.attackDamage());
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
	}

	@Override
	protected void registerGoals() {
		super.registerGoals();
		Species s = species();
		this.goalSelector.addGoal(6, new SleepGoal<>(this));
		SafariGoals.addCombat(this, s, this.goalSelector, this.targetSelector);
	}

	/** Fixed stats from the species instead of random horse stats. */
	@Override
	protected void randomizeAttributes(RandomSource random) {
		Species s = species();
		this.getAttribute(Attributes.MAX_HEALTH).setBaseValue(s.health());
		this.getAttribute(Attributes.MOVEMENT_SPEED).setBaseValue(s.speed());
		this.getAttribute(Attributes.JUMP_STRENGTH).setBaseValue(s.ride().jump() ? s.ride().jumpStrength() : 0.0);
	}

	// ---------------------------------------------------------------- feeding and taming

	@Override
	public boolean isFood(ItemStack stack) {
		Species s = species();
		return SafariAnimal.matches(stack, s.breed()) || SafariAnimal.matches(stack, s.ride().tameItems())
			|| s.heal().stream().anyMatch(h -> SafariAnimal.matches(stack, java.util.List.of(h.item())));
	}

	@Override
	protected boolean handleEating(Player player, ItemStack stack) {
		Species s = species();
		boolean used = false;
		for (Species.Heal h : s.heal()) {
			if (SafariAnimal.matches(stack, java.util.List.of(h.item())) && this.getHealth() < this.getMaxHealth()) {
				this.heal(h.amount());
				used = true;
			}
		}
		if (this.isBaby()) {
			this.ageUp(20);
			used = true;
		}
		if (SafariAnimal.matches(stack, s.ride().tameItems()) && !this.isTamed() && this.getTemper() < this.getMaxTemper()) {
			this.modifyTemper(4);
			used = true;
		}
		if (SafariAnimal.matches(stack, s.breed()) && !this.level().isClientSide() && this.isTamed() && this.getAge() == 0 && !this.isInLove()) {
			this.setInLove(player);
			used = true;
		}
		if (used) this.eatTicks = 30;
		return used;
	}

	@Override
	public int getMaxTemper() {
		return species().ride().temper();
	}

	@Override
	public InteractionResult mobInteract(Player player, InteractionHand hand) {
		// Only some mounts can carry a chest.
		if (!species().ride().chest() && player.getItemInHand(hand).is(Items.CHEST)) return InteractionResult.PASS;
		return super.mobInteract(player, hand);
	}

	@Override
	public boolean canMate(Animal partner) {
		return partner != this && partner.getType() == this.getType() && partner instanceof SafariMount other
			&& this.isTamed() && other.isTamed() && this.isInLove() && other.isInLove();
	}

	@Override
	public @Nullable AgeableMob getBreedOffspring(ServerLevel level, AgeableMob partner) {
		SafariMount baby = (SafariMount) this.getType().create(level, EntitySpawnReason.BREEDING);
		if (baby != null) this.setOffspringAttributes(partner, baby);
		return baby;
	}

	// ---------------------------------------------------------------- riding

	@Override
	protected boolean canAddPassenger(Entity passenger) {
		return this.getPassengers().size() < species().ride().seats();
	}

	@Override
	protected Vec3 getPassengerAttachmentPoint(Entity passenger, EntityDimensions dimensions, float scale) {
		int seat = Math.max(0, this.getPassengers().indexOf(passenger));
		double z = species().ride().seats() > 1 ? (seat == 0 ? 0.3 : -0.7) : 0.0;
		return new Vec3(0.0, species().ride().seatHeight() * scale, z * scale);
	}

	@Override
	public boolean canJump() {
		return species().ride().jump() && super.canJump();
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
		return 0;
	}

	@Override
	public int eatTicks() {
		return this.eatTicks;
	}

	@Override
	public void aiStep() {
		super.aiStep();
		if (this.eatTicks > 0) this.eatTicks--;
		if (this.isResting()) this.getNavigation().stop();
	}

	@Override
	public boolean hurtServer(ServerLevel level, DamageSource source, float damage) {
		setResting(false);
		return super.hurtServer(level, source, damage);
	}

	@Override
	public boolean doHurtTarget(ServerLevel level, Entity target) {
		playAction("attack");
		return super.doHurtTarget(level, target);
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
	public float getVoicePitch() {
		Species.Sounds s = species().sounds();
		float pitch = s.pitchMin() + this.random.nextFloat() * (s.pitchMax() - s.pitchMin());
		return this.isBaby() ? pitch * 1.4F : pitch;
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
}
