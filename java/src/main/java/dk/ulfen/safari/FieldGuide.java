package dk.ulfen.safari;

import java.util.ArrayList;
import java.util.List;

import com.mojang.serialization.Codec;

import dk.ulfen.safari.entity.SafariCreature;
import dk.ulfen.safari.species.Species;
import dk.ulfen.safari.species.SpeciesRegistry;
import net.fabricmc.fabric.api.attachment.v1.AttachmentRegistry;
import net.fabricmc.fabric.api.attachment.v1.AttachmentType;
import net.minecraft.ChatFormatting;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.network.chat.Component;
import net.minecraft.network.chat.HoverEvent;
import net.minecraft.network.chat.MutableComponent;
import net.minecraft.server.MinecraftServer;
import net.minecraft.server.level.ServerPlayer;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.world.entity.Mob;
import net.minecraft.world.item.ItemStack;

/** Tracks which animals each player has spotted, and shows them in chat. */
public final class FieldGuide {
	private static final AttachmentType<List<String>> SEEN = AttachmentRegistry.<List<String>>builder()
		.persistent(Codec.STRING.listOf())
		.copyOnDeath()
		.initializer(ArrayList::new)
		.buildAndRegister(SafariRegistry.id("seen_animals"));
	private static final AttachmentType<Boolean> GIVEN = AttachmentRegistry.<Boolean>builder()
		.persistent(Codec.BOOL)
		.copyOnDeath()
		.initializer(() -> false)
		.buildAndRegister(SafariRegistry.id("field_guide_given"));

	private FieldGuide() {}

	static void init() {}

	/** Every 2 seconds: record animals within 12 blocks of each player. */
	static void tick(MinecraftServer server) {
		if (server.getTickCount() % 40 != 0) return;
		int total = SafariRegistry.ANIMALS.size();
		for (ServerPlayer player : server.getPlayerList().getPlayers()) {
			List<String> seen = new ArrayList<>(player.getAttachedOrCreate(SEEN));
			boolean changed = false;
			for (Mob mob : player.level().getEntitiesOfClass(Mob.class, player.getBoundingBox().inflate(12), m -> m instanceof SafariCreature)) {
				String id = BuiltInRegistries.ENTITY_TYPE.getKey(mob.getType()).getPath();
				if (seen.contains(id)) continue;
				seen.add(id);
				changed = true;
				player.sendOverlayMessage(Component.translatable("safari.guide.spotted", Component.translatable("entity.safari." + id)));
				player.level().playSound(null, player.blockPosition(), SoundEvents.EXPERIENCE_ORB_PICKUP, net.minecraft.sounds.SoundSource.PLAYERS, 0.6F, 1.4F);
				if (seen.size() == total) player.level().playSound(null, player.blockPosition(), SoundEvents.PLAYER_LEVELUP, net.minecraft.sounds.SoundSource.PLAYERS, 1.0F, 1.0F);
			}
			if (changed) player.setAttached(SEEN, seen);
		}
	}

	/** Everyone gets a Field Guide the first time they join. */
	static void onJoin(ServerPlayer player) {
		if (player.getAttachedOrCreate(GIVEN)) return;
		player.setAttached(GIVEN, true);
		player.getInventory().add(new ItemStack(SafariRegistry.FIELD_GUIDE));
		player.sendSystemMessage(Component.translatable("safari.guide.welcome"));
	}

	public static void show(ServerPlayer player) {
		List<String> seen = player.getAttachedOrCreate(SEEN);
		player.sendSystemMessage(Component.translatable("safari.guide.title").withStyle(ChatFormatting.GOLD, ChatFormatting.BOLD)
			.append(Component.literal(" (" + seen.size() + "/" + SafariRegistry.ANIMALS.size() + ")").withStyle(ChatFormatting.GRAY)));
		if (seen.isEmpty()) {
			player.sendSystemMessage(Component.translatable("safari.guide.intro").withStyle(ChatFormatting.GRAY));
			return;
		}
		MutableComponent line = Component.empty();
		boolean first = true;
		for (Species s : SpeciesRegistry.all()) {
			if (!seen.contains(s.id())) continue;
			if (!first) line.append(Component.literal(", ").withStyle(ChatFormatting.GRAY));
			first = false;
			line.append(Component.translatable("entity.safari." + s.id()).withStyle(style -> style
				.withColor(ChatFormatting.GREEN)
				.withHoverEvent(new HoverEvent.ShowText(entry(s)))));
		}
		player.sendSystemMessage(line);
	}

	private static Component entry(Species s) {
		MutableComponent c = Component.translatable("entity.safari." + s.id()).withStyle(ChatFormatting.GOLD)
			.append("\n").append(Component.translatable("safari.guide.entry." + s.id()).withStyle(ChatFormatting.WHITE));
		List<String> biomes = s.spawns().stream().flatMap(sp -> sp.biomes().stream()).distinct().toList();
		if (!biomes.isEmpty()) {
			c.append("\n").append(Component.translatable("safari.guide.lives_in").withStyle(ChatFormatting.DARK_GREEN)).append(" ");
			for (int i = 0; i < biomes.size(); i++) {
				if (i > 0) c.append(", ");
				c.append(Component.translatable("safari.habitat." + biomes.get(i)));
			}
		}
		return c;
	}
}
