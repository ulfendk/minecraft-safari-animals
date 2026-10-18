package dk.ulfen.safari.entity;

import dk.ulfen.safari.species.Species;
import net.minecraft.core.BlockPos;
import net.minecraft.core.particles.ParticleTypes;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.sounds.SoundSource;
import net.minecraft.tags.BlockTags;
import net.minecraft.world.damagesource.DamageSource;
import net.minecraft.world.effect.MobEffectInstance;
import net.minecraft.world.effect.MobEffects;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.Mob;
import net.minecraft.world.level.block.state.BlockState;

/** Touch defences, bite effects and camouflage shared by the safari entity classes. */
public final class SafariDefences {
	private SafariDefences() {}

	/** Called when the creature is hurt: poisonous skin and quills strike back at melee attackers. */
	public static void onHurt(Mob self, Species s, ServerLevel level, DamageSource source) {
		if (!source.isDirect() || !(source.getDirectEntity() instanceof LivingEntity attacker) || attacker == self) return;
		if (s.poisonous()) attacker.addEffect(new MobEffectInstance(MobEffects.POISON, 120, 1));
		if (s.quills()) {
			attacker.hurtServer(level, level.damageSources().thorns(self), 2.0F);
			level.playSound(null, self, SoundEvents.ARMADILLO_HURT, SoundSource.NEUTRAL, 1.0F, 1.4F);
		}
	}

	/** Called when the creature bites: venom, constriction or an electric shock. */
	public static void onBite(Mob self, Species s, ServerLevel level, Entity target) {
		if (!(target instanceof LivingEntity victim)) return;
		if ("poison".equals(s.attackEffect())) victim.addEffect(new MobEffectInstance(MobEffects.POISON, 100, 0));
		if ("slowness".equals(s.attackEffect())) victim.addEffect(new MobEffectInstance(MobEffects.SLOWNESS, 80, s.shocks() ? 3 : 2));
		if (s.shocks()) {
			level.playSound(null, victim, SoundEvents.FIRE_EXTINGUISH, SoundSource.HOSTILE, 1.0F, 1.6F);
			level.sendParticles(ParticleTypes.ELECTRIC_SPARK, victim.getX(), victim.getY() + victim.getBbHeight() / 2, victim.getZ(), 12, 0.3, 0.4, 0.3, 0.1);
		}
	}

	public static boolean immuneTo(Species s, MobEffectInstance effect) {
		return s.poisonImmune() && effect.getEffect().equals(MobEffects.POISON);
	}

	/** Chameleon colour for the block it stands on: 0 green, 1 brown, 2 sand; -1 keeps the current one. */
	public static int camouflageFor(BlockState below) {
		if (below.is(BlockTags.SAND) || below.is(BlockTags.TERRACOTTA)) return 2;
		if (below.is(BlockTags.LOGS) || below.is(BlockTags.DIRT) || below.is(BlockTags.PLANKS)) return below.is(net.minecraft.world.level.block.Blocks.GRASS_BLOCK) ? 0 : 1;
		if (below.is(BlockTags.LEAVES) || below.is(net.minecraft.world.level.block.Blocks.GRASS_BLOCK) || below.is(net.minecraft.world.level.block.Blocks.MOSS_BLOCK)) return 0;
		return -1;
	}

	public static BlockState blockBelow(Mob mob) {
		return mob.level().getBlockState(BlockPos.containing(mob.getX(), mob.getY() - 0.2, mob.getZ()));
	}
}
