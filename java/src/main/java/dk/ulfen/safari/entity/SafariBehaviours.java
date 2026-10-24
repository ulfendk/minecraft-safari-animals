package dk.ulfen.safari.entity;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import dk.ulfen.safari.SafariRegistry;
import net.minecraft.core.BlockPos;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.network.chat.Component;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.sounds.SoundSource;
import net.minecraft.tags.BlockTags;
import net.minecraft.world.damagesource.DamageSource;
import net.minecraft.world.effect.MobEffectInstance;
import net.minecraft.world.effect.MobEffects;
import net.minecraft.world.entity.EquipmentSlot;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.levelgen.Heightmap;
import net.minecraft.world.phys.Vec3;

/** Species-specific behaviours that go beyond the standard goals. Server side only. */
public final class SafariBehaviours {
	private static final Set<String> MEAT = Set.of(
		"safari:raw_game_meat", "minecraft:beef", "minecraft:porkchop", "minecraft:mutton", "minecraft:chicken",
		"minecraft:rabbit", "minecraft:rotten_flesh", "minecraft:bone");
	private static final Set<String> SNACKS = Set.of(
		"minecraft:apple", "minecraft:bread", "minecraft:cookie", "minecraft:melon_slice", "minecraft:sweet_berries",
		"minecraft:glow_berries", "minecraft:carrot", "minecraft:baked_potato", "minecraft:pumpkin_pie", "minecraft:golden_apple",
		"minecraft:golden_carrot", "minecraft:beetroot", "minecraft:cooked_beef", "minecraft:cooked_porkchop",
		"minecraft:cooked_chicken", "minecraft:cooked_mutton", "safari:cooked_game_meat", "safari:fried_ostrich_egg");
	private static final Set<String> MEERKAT_DANGER = Set.of(
		"safari:lion", "safari:leopard", "safari:hyena", "safari:cheetah", "safari:wild_dog", "minecraft:player");
	/** Chimps angry with a player: chimp -> (player, until tick). */
	/** How close a player can come before a bear rears up (blocks), and the pitch of its roar. */
	private static final Map<String, Map.Entry<Integer, Float>> BEAR_WARNINGS = Map.of(
		"grizzly_bear", Map.entry(8, 0.7F), "sloth_bear", Map.entry(6, 0.95F),
		"spectacled_bear", Map.entry(5, 1.0F), "sun_bear", Map.entry(4, 1.3F));
	private static final Map<UUID, Map.Entry<UUID, Long>> ANGRY_CHIMPS = new HashMap<>();

	private SafariBehaviours() {}

	public static boolean isMeat(ItemStack stack) {
		return MEAT.contains(id(stack));
	}

	private static String id(ItemStack stack) {
		return BuiltInRegistries.ITEM.getKey(stack.getItem()).toString();
	}

	private static boolean chance(SafariAnimal a, float p) {
		return a.getRandom().nextFloat() < p;
	}

	private static List<Player> playersNear(SafariAnimal a, double r) {
		return a.level().getEntitiesOfClass(Player.class, a.getBoundingBox().inflate(r), p -> !p.isSpectator());
	}

	public static void tick(SafariAnimal a, ServerLevel level) {
		if (a.stolen != null && a.tickCount >= a.stolenUntil) dropStolen(a, level);
		if (a.isBaby() || --a.behaviourCooldown > 0) return;
		a.behaviourCooldown = 40;

		switch (a.species().id()) {
			case "lion" -> {
				if (!playersNear(a, 12).isEmpty() && chance(a, 0.3F)) roar(a, level, "roar", 0.5F);
				else if (chance(a, 0.02F)) roar(a, level, "roar", 0.55F);
			}
			case "tiger" -> { if (chance(a, 0.01F)) roar(a, level, "roar", 0.65F); }
			case "elephant" -> { if (chance(a, 0.015F)) roar(a, level, "trumpet", 1.6F); }
			case "gorilla" -> {
				if (!playersNear(a, 6).isEmpty() && chance(a, 0.25F)) {
					a.playAction("chest_beat");
					level.playSound(null, a, SoundEvents.PANDA_AGGRESSIVE_AMBIENT, SoundSource.NEUTRAL, 2.0F, 0.6F);
				}
			}
			case "hippo" -> {
				if (playersNear(a, 10).stream().anyMatch(Player::isInWater) && chance(a, 0.2F)) {
					a.playAction("yawn");
					level.playSound(null, a, SoundEvents.HOGLIN_ANGRY, SoundSource.NEUTRAL, 2.0F, 0.5F);
				}
			}
			case "king_cobra", "black_mamba" -> {
				// Rears up when a player comes close: the cobra spreads its hood, the mamba gapes.
				boolean cobra = a.species().id().equals("king_cobra");
				if (!playersNear(a, cobra ? 5 : 4).isEmpty() && chance(a, 0.4F)) {
					a.playAction("threat");
					level.playSound(null, a, BuiltInRegistries.SOUND_EVENT.getValue(net.minecraft.resources.Identifier.withDefaultNamespace("entity.cat.hiss")), SoundSource.NEUTRAL, 1.5F, cobra ? 0.4F : 0.8F);
				}
			}
			case "grizzly_bear", "sloth_bear", "spectacled_bear", "sun_bear" -> {
				// Rears up on its hind legs and roars when a player comes close.
				Map.Entry<Integer, Float> warn = BEAR_WARNINGS.get(a.species().id());
				if (!playersNear(a, warn.getKey()).isEmpty() && chance(a, 0.3F)) {
					a.playAction("rear");
					level.playSound(null, a, SoundEvents.POLAR_BEAR_WARNING, SoundSource.NEUTRAL, 2.0F, warn.getValue());
				}
			}
			case "gazelle" -> { if (a.getDeltaMovement().horizontalDistance() > 0.25 && chance(a, 0.25F)) a.playAction("pronk"); }
			case "meerkat" -> sentry(a, level);
			case "baboon" -> steal(a, level);
			case "chimpanzee" -> throwFruit(a, level);
			case "hyena" -> eatCarried(a);
			case "leopard" -> climbTree(a, level);
			case "wildebeest" -> migrate(a, level);
			default -> {}
		}
	}

	private static void roar(SafariAnimal a, ServerLevel level, String anim, float pitch) {
		a.playAction(anim);
		level.playSound(null, a, SoundEvents.RAVAGER_ROAR, SoundSource.NEUTRAL, 3.0F, pitch);
	}

	public static void onHurt(SafariAnimal a, ServerLevel level, DamageSource source) {
		if (a.species().id().equals("chimpanzee") && source.getEntity() instanceof Player player) {
			long until = level.getGameTime() + 300;
			for (SafariAnimal c : level.getEntitiesOfClass(SafariAnimal.class, a.getBoundingBox().inflate(12), c -> c.getType() == a.getType())) {
				ANGRY_CHIMPS.put(c.getUUID(), Map.entry(player.getUUID(), until));
			}
		}
	}

	/** One meerkat in each group stands guard and squeaks when danger comes close. */
	private static void sentry(SafariAnimal a, ServerLevel level) {
		List<SafariAnimal> group = level.getEntitiesOfClass(SafariAnimal.class, a.getBoundingBox().inflate(10), m -> m.getType() == a.getType());
		boolean guarded = group.stream().anyMatch(SafariAnimal::isSentry);
		if (a.isSentry()) {
			boolean danger = !level.getEntitiesOfClass(LivingEntity.class, a.getBoundingBox().inflate(8),
				e -> MEERKAT_DANGER.contains(BuiltInRegistries.ENTITY_TYPE.getKey(e.getType()).toString())).isEmpty();
			if (danger) {
				level.playSound(null, a, SoundEvents.FOX_SCREECH, SoundSource.NEUTRAL, 1.0F, 2.0F);
				a.setSentry(false);
				hideInMound(a, level, group);
			} else if (chance(a, 0.05F)) {
				a.setSentry(false);
			}
		} else if (!guarded && !a.isResting() && chance(a, 0.3F)) {
			a.setSentry(true);
		}
	}

	private static void hideInMound(SafariAnimal a, ServerLevel level, List<SafariAnimal> group) {
		BlockPos origin = a.blockPosition();
		for (BlockPos pos : BlockPos.betweenClosed(origin.offset(-8, -2, -8), origin.offset(8, 2, 8))) {
			if (level.getBlockState(pos).is(SafariRegistry.TERMITE_MOUND)) {
				for (SafariAnimal m : group) {
					m.teleportTo(pos.getX() + 0.5, pos.getY(), pos.getZ() + 1.3);
					m.addEffect(new MobEffectInstance(MobEffects.INVISIBILITY, 200, 0, false, false));
					m.addEffect(new MobEffectInstance(MobEffects.SLOWNESS, 200, 5, false, false));
				}
				return;
			}
		}
	}

	/** Baboons snatch a snack from a player's hand and drop it again a little later. */
	private static void steal(SafariAnimal a, ServerLevel level) {
		if (a.stolen != null || !chance(a, 0.15F)) return;
		for (Player p : playersNear(a, 2.5)) {
			ItemStack held = p.getMainHandItem();
			if (held.isEmpty() || !SNACKS.contains(id(held))) continue;
			a.stolen = held.split(1);
			a.stolenUntil = a.tickCount + 200 + a.getRandom().nextInt(200);
			Vec3 away = a.position().subtract(p.position()).normalize();
			a.push(away.x * 0.8, 0.4, away.z * 0.8);
			level.playSound(null, a, SoundEvents.FOX_SCREECH, SoundSource.NEUTRAL, 1.0F, 1.4F);
			p.sendOverlayMessage(Component.translatable("safari.baboon.stole"));
			return;
		}
	}

	public static void dropStolen(SafariAnimal a, ServerLevel level) {
		if (a.stolen == null) return;
		a.spawnAtLocation(level, a.stolen);
		a.stolen = null;
	}

	private static void throwFruit(SafariAnimal a, ServerLevel level) {
		Map.Entry<UUID, Long> anger = ANGRY_CHIMPS.get(a.getUUID());
		if (anger == null) return;
		if (level.getGameTime() > anger.getValue()) {
			ANGRY_CHIMPS.remove(a.getUUID());
			return;
		}
		Player target = level.getPlayerByUUID(anger.getKey());
		if (target == null || target.distanceTo(a) > 14 || !chance(a, 0.6F)) return;
		ThrownFruit fruit = new ThrownFruit(level, a);
		Vec3 d = target.getEyePosition().subtract(a.getEyePosition());
		fruit.shoot(d.x, d.y + d.horizontalDistance() * 0.15, d.z, 1.0F, 4.0F);
		level.addFreshEntity(fruit);
		a.playAction("throw");
		level.playSound(null, a, SoundEvents.PANDA_AMBIENT, SoundSource.NEUTRAL, 1.0F, 1.6F);
	}

	private static void eatCarried(SafariAnimal a) {
		ItemStack held = a.getMainHandItem();
		if (!held.isEmpty() && chance(a, 0.2F)) {
			a.setItemSlot(EquipmentSlot.MAINHAND, ItemStack.EMPTY);
			a.heal(4.0F);
			a.playSound(SoundEvents.GENERIC_EAT.value(), 1.0F, 0.8F);
		}
	}

	/** By day, leopards leap up into a nearby tree and rest in the canopy. */
	private static void climbTree(SafariAnimal a, ServerLevel level) {
		if (!level.isBrightOutside() || a.getTarget() != null || !chance(a, 0.1F)) return;
		if (level.getBlockState(a.blockPosition().below()).is(BlockTags.LEAVES)) return;
		for (int i = 0; i < 12; i++) {
			int x = a.getBlockX() + a.getRandom().nextInt(13) - 6;
			int z = a.getBlockZ() + a.getRandom().nextInt(13) - 6;
			BlockPos top = level.getHeightmapPos(Heightmap.Types.MOTION_BLOCKING, new BlockPos(x, 0, z)).below();
			int rise = top.getY() - a.getBlockY();
			if (rise >= 2 && rise <= 10 && level.getBlockState(top).is(BlockTags.LEAVES)) {
				a.playAction("pounce");
				a.teleportTo(x + 0.5, top.getY() + 1, z + 0.5);
				level.playSound(null, a, BuiltInRegistries.SOUND_EVENT.getValue(net.minecraft.resources.Identifier.withDefaultNamespace("entity.cat.hiss")), SoundSource.NEUTRAL, 1.0F, 0.6F);
				return;
			}
		}
	}

	/** By day the herd sets off together in that day's migration direction. */
	private static void migrate(SafariAnimal a, ServerLevel level) {
		if (!level.isBrightOutside() || !a.getNavigation().isDone() || !chance(a, 0.02F)) return;
		long day = level.getGameTime() / 24000L;
		double angle = Math.toRadians((day * 2654435761L) % 360);
		BlockPos goal = BlockPos.containing(a.getX() + Math.cos(angle) * 32, a.getY(), a.getZ() + Math.sin(angle) * 32);
		goal = level.getHeightmapPos(Heightmap.Types.MOTION_BLOCKING_NO_LEAVES, goal);
		for (SafariAnimal w : level.getEntitiesOfClass(SafariAnimal.class, a.getBoundingBox().inflate(16), m -> m.getType() == a.getType())) {
			if (!w.isResting()) w.getNavigation().moveTo(goal.getX() + 0.5, goal.getY(), goal.getZ() + 0.5, 0.9);
		}
	}
}
