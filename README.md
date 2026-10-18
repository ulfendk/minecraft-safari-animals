# Safari Animals

A Minecraft **Bedrock Edition** add-on with 24 safari and exotic animals: lions, elephants, zebras, giraffes, rhinos, hippos, cheetahs, African wild dogs, kangaroos and more.

**Download and info: https://ulfendk.github.io/minecraft-safari-animals/**

![All animals](https://ulfendk.github.io/minecraft-safari-animals/img/animals/lion.png)

## Features
- 24 animals, each with its own model, texture, animations and sounds, plus babies.
- A food web: lions, cheetahs, hyenas, wild dogs and crocodiles hunt, and herds flee when they see them.
- Day and night routines: lions and hyenas nap by day, grazers sleep at night, wild dogs hunt by day.
- Ride tamed zebras, ostriches and elephants. Elephants carry a chest and a second rider.
- Special behaviours: lions roar, gorillas beat their chest, meerkats post a sentry, baboons steal snacks, and vultures gather at carcasses.
- Thorn bushes: a 1.5-block barrier that hurts land animals that push against it.
- A Field Guide book that records every species you spot.

## Install
1. Download `SafariAnimals.mcaddon` from the [latest release](https://github.com/ulfendk/minecraft-safari-animals/releases/latest).
2. Open it on Windows, Android or iOS. Minecraft imports both packs.
3. In your world settings, turn on **Safari Animals** under *Behavior Packs*.

Requires Minecraft Bedrock 1.21.90 or newer.

## Development
Everything is generated from code. Models, textures and animations come from the specs in `src/animals/`.

```sh
npm ci
npm run build      # writes build/behavior_pack and build/resource_pack
npm run validate   # static checks, mostly for the resource pack
npm run preview    # renders every animal to build/preview/*.png
npm run package    # dist/*.mcaddon and *.mcpack
npm run site       # the website, in build/site/
npm run test:server  # loads the packs in a Bedrock Dedicated Server (needs Docker)
```

| Path | What it is |
| --- | --- |
| `src/animals/*.mjs` | One file per animal: stats, behaviour, model, texture recipe and animations |
| `src/lib/` | Generators: model + UV packing, procedural textures, animations, entity JSON |
| `src/packs/` | Hand-written pack files, including the Script API code in `behavior_pack/scripts/` |
| `src/items.mjs`, `src/blocks.mjs` | Custom items, blocks, recipes and world generation |
| `tools/` | Build, validation, preview renderer, packaging, website, server test |

### Adding an animal
Copy a similar spec in `src/animals/` (the body builders in `src/lib/bodies.mjs` help). Run `npm run preview <id>` and look at `build/preview/<id>.png`, then add a line to `src/guide.mjs`.

### Releases
Bump `version` in `package.json`, add a section to `CHANGELOG.md`, then push a tag such as `v0.2.0`. The release workflow builds and tests the packs, publishes a GitHub Release with the files, and updates the website.

## License
MIT. Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft.
