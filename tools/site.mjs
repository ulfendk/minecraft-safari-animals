// Builds the GitHub Pages site into build/site/.
// The latest release is looked up in the browser (GitHub API), with the version
// from package.json as the fallback, so the page stays current between deploys.
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PNG } from 'pngjs';
import { build } from './build.mjs';
import { render } from './render.mjs';
import { guide } from '../src/guide.mjs';
import { habitats as habitatsOf, tags } from '../src/lib/info.mjs';
import { items } from '../src/items.mjs';
import { blocks } from '../src/blocks.mjs';

const OUT = 'build/site';
const RP = 'build/resource_pack';
const repo = process.env.GITHUB_REPOSITORY ?? process.env.SITE_REPO ?? 'ulfendk/minecraft-safari-animals';
const [owner, name] = repo.split('/');

const GROUPS = {
  predator: ['lion', 'tiger', 'leopard', 'cheetah', 'hyena', 'wild_dog', 'crocodile'],
  grazer: ['zebra', 'gazelle', 'wildebeest', 'warthog', 'giraffe'],
  giant: ['elephant', 'rhino', 'hippo'],
  bird: ['ostrich', 'flamingo', 'vulture'],
  primate: ['gorilla', 'chimpanzee', 'baboon'],
  small: ['meerkat'],
  marsupial: ['kangaroo', 'koala'],
};
const groupOf = (id) => Object.entries(GROUPS).find(([, ids]) => ids.includes(id))?.[0] ?? 'other';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function upscale(buf, k) {
  const src = PNG.sync.read(buf);
  const out = new PNG({ width: src.width * k, height: src.height * k });
  for (let y = 0; y < out.height; y++)
    for (let x = 0; x < out.width; x++) {
      const s = ((Math.floor(y / k) * src.width) + Math.floor(x / k)) * 4;
      out.data.set(src.data.subarray(s, s + 4), (y * out.width + x) * 4);
    }
  return PNG.sync.write(out);
}

const { animals, version } = await build({ quiet: true });
await mkdir(join(OUT, 'img', 'animals'), { recursive: true });
await mkdir(join(OUT, 'img', 'items'), { recursive: true });

const cards = [];
for (const a of animals) {
  const geo = JSON.parse(await readFile(join(RP, 'models/entity', `${a.id}.geo.json`), 'utf8'));
  const tex = await readFile(join(RP, 'textures/entity/safari', `${a.id}.png`));
  await writeFile(join(OUT, 'img', 'animals', `${a.id}.png`), render(geo, tex, { yaw: 35, size: 320, hidden: new Set(['saddle', 'chest']) }));
  cards.push({ a, habitats: habitatsOf(a), group: groupOf(a.id) });
}
const order = ['lion', 'elephant', 'zebra', 'giraffe', 'rhino', 'hippo', 'cheetah', 'leopard', 'tiger', 'hyena', 'wild_dog', 'gazelle', 'wildebeest', 'warthog', 'ostrich', 'flamingo', 'vulture', 'crocodile', 'meerkat', 'gorilla', 'chimpanzee', 'baboon', 'kangaroo', 'koala'];
cards.sort((x, y) => order.indexOf(x.a.id) - order.indexOf(y.a.id));

for (const item of [...items, ...blocks.map((b) => ({ ...b, icon: b.texture }))]) {
  await writeFile(join(OUT, 'img', 'items', `${item.id}.png`), upscale(item.icon, 4));
}
await copyFile(join(RP, 'pack_icon.png'), join(OUT, 'img', 'icon.png'));
await writeFile(join(OUT, 'favicon.png'), upscale(PNG.sync.write(PNG.sync.read(await readFile(join(RP, 'pack_icon.png')))), 1));

const releases = `https://github.com/${repo}/releases`;
const dl = (file) => `${releases}/latest/download/${file}`;

const animalHtml = cards.map(({ a, habitats, group }) => `
      <article class="card" data-group="${group}"${a.ride ? ' data-ride="1"' : ''}>
        <div class="portrait"><img src="img/animals/${a.id}.png" alt="${esc(a.name)}" loading="lazy" width="320" height="320"></div>
        <div class="card-body">
          <h3>${esc(a.name)}</h3>
          <p class="where">${habitats.map(esc).join(' · ')}</p>
          <p>${esc(guide[a.id] ?? '')}</p>
          <ul class="tags">${tags(a).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
        </div>
      </article>`).join('');

const itemHtml = [...items, ...blocks].map((i) => `
        <li><img src="img/items/${i.id}.png" alt="" width="48" height="48"><span>${esc(i.name)}</span></li>`).join('');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Safari Animals – Minecraft Bedrock add-on</title>
<meta name="description" content="${animals.length} safari animals for Minecraft Bedrock Edition: lions, elephants, zebras, giraffes, rhinos and more. Free download.">
<link rel="icon" href="favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@500&display=swap" rel="stylesheet">
<style>
:root {
  --bg: #f6ecd6; --surface: #fffaf0; --ink: #2b2118; --muted: #6f5f4d; --line: #e4d3b1;
  --accent: #c8541e; --accent-ink: #fff; --accent-2: #3d7a3a; --chip: #f1e2c2; --hero-from: #2b1d4f; --hero-to: #f08a3c;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #19140f; --surface: #241d16; --ink: #f3e9d6; --muted: #bba98f; --line: #3a2f24;
    --accent: #f08a3c; --accent-ink: #1b130c; --accent-2: #8cc084; --chip: #33291f; --hero-from: #140e26; --hero-to: #8a3d1c;
  }
}
:root[data-theme="dark"] {
  --bg: #19140f; --surface: #241d16; --ink: #f3e9d6; --muted: #bba98f; --line: #3a2f24;
  --accent: #f08a3c; --accent-ink: #1b130c; --accent-2: #8cc084; --chip: #33291f; --hero-from: #140e26; --hero-to: #8a3d1c;
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--ink); font: 16px/1.55 system-ui, -apple-system, "Segoe UI", sans-serif; }
img { image-rendering: pixelated; max-width: 100%; }
a { color: var(--accent); }
h1, h2, h3 { font-family: "Pixelify Sans", system-ui, sans-serif; font-weight: 500; line-height: 1.15; letter-spacing: .01em; }
.wrap { max-width: 1100px; margin: 0 auto; padding: 0 16px; }
header.hero { color: #fff8ec; background: linear-gradient(180deg, var(--hero-from), var(--hero-to)); padding: 48px 0 56px; }
.hero .wrap { display: grid; grid-template-columns: auto 1fr; gap: 32px; align-items: center; }
.hero img.icon { width: 160px; height: 160px; border-radius: 12px; box-shadow: 0 8px 30px rgb(0 0 0 / .35); }
.hero h1 { font-size: clamp(2.2rem, 6vw, 3.6rem); margin: 0 0 8px; }
.hero p { margin: 0 0 20px; font-size: 1.15rem; max-width: 46ch; color: #fbe9cf; }
.actions { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
.btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 20px; border-radius: 10px; font-weight: 700; text-decoration: none; background: #ffd36b; color: #2b1d0e; box-shadow: 0 3px 0 #b8862c; }
.btn:hover { transform: translateY(-1px); }
.btn.ghost { background: transparent; color: #fff3df; box-shadow: inset 0 0 0 2px rgb(255 243 223 / .6); }
.version { font-size: .95rem; color: #fbe9cf; }
.version strong { color: #fff; }
main section { padding: 48px 0 8px; }
h2 { font-size: 2rem; margin: 0 0 8px; }
.lede { color: var(--muted); margin: 0 0 24px; max-width: 70ch; }
.steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; padding: 0; list-style: none; counter-reset: s; }
.steps li { background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 16px 16px 16px 56px; position: relative; }
.steps li::before { counter-increment: s; content: counter(s); position: absolute; left: 16px; top: 14px; width: 28px; height: 28px; border-radius: 50%; background: var(--accent); color: var(--accent-ink); display: grid; place-items: center; font-weight: 700; }
.note { color: var(--muted); font-size: .92rem; }
.filters { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 20px; }
.filters button { font: inherit; border: 1px solid var(--line); background: var(--surface); color: var(--ink); padding: 6px 14px; border-radius: 999px; cursor: pointer; }
.filters button[aria-pressed="true"] { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 18px; }
.card { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; }
.card[hidden] { display: none; }
.portrait { background: radial-gradient(circle at 50% 70%, #f7d99a 0, #e9b96a 55%, #c98a45 100%); aspect-ratio: 1; display: grid; place-items: center; }
.portrait img { width: 88%; height: auto; }
.card-body { padding: 14px 16px 16px; }
.card h3 { margin: 0; font: 700 1.3rem/1.2 system-ui, -apple-system, "Segoe UI", sans-serif; }
.where { margin: 2px 0 8px; color: var(--accent-2); font-weight: 600; font-size: .9rem; }
.card p { margin: 0 0 10px; }
.tags { display: flex; flex-wrap: wrap; gap: 6px; padding: 0; margin: 0; list-style: none; }
.tags li { background: var(--chip); border-radius: 6px; padding: 2px 8px; font-size: .82rem; }
.features { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
.feature { background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 18px; }
.feature h3 { margin: 0 0 6px; font: 700 1.1rem/1.2 system-ui, -apple-system, "Segoe UI", sans-serif; }
.feature p { margin: 0; color: var(--muted); }
.items { display: flex; flex-wrap: wrap; gap: 12px; list-style: none; padding: 0; }
.items li { display: flex; align-items: center; gap: 10px; background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 8px 14px 8px 8px; }
footer { margin-top: 56px; padding: 28px 0 40px; border-top: 1px solid var(--line); color: var(--muted); font-size: .9rem; }
@media (max-width: 640px) {
  .hero .wrap { grid-template-columns: 1fr; text-align: center; justify-items: center; }
  .hero img.icon { width: 112px; height: 112px; }
  .actions { justify-content: center; }
}
</style>
</head>
<body>
<header class="hero">
  <div class="wrap">
    <img class="icon" src="img/icon.png" alt="" width="160" height="160">
    <div>
      <h1>Safari Animals</h1>
      <p>${animals.length} safari animals for Minecraft Bedrock Edition. Lions hunt zebras, elephants carry your stuff, and meerkats keep watch.</p>
      <div class="actions">
        <a class="btn" id="download" href="${dl(`SafariAnimals.mcaddon`)}">⬇ Download .mcaddon</a>
        <a class="btn ghost" href="${releases}">All versions</a>
      </div>
      <p class="version" id="version">Latest version: <strong>${esc(version)}</strong></p>
    </div>
  </div>
</header>
<main class="wrap">
  <section id="install">
    <h2>Install</h2>
    <ol class="steps">
      <li><strong>Download</strong> <a href="${dl('SafariAnimals.mcaddon')}">SafariAnimals.mcaddon</a> on your Windows PC, Android phone or tablet, or iPhone or iPad.</li>
      <li><strong>Open the file.</strong> Minecraft starts and imports both packs.</li>
      <li><strong>Create or edit a world.</strong> Under <em>Behavior Packs</em>, turn on <em>Safari Animals</em>. The resource pack is added automatically.</li>
      <li><strong>Explore</strong> a savanna, jungle, river or swamp, or use spawn eggs from the creative inventory.</li>
    </ol>
    <p class="note">Running a server? Use the separate <a href="${dl('SafariAnimals_BP.mcpack')}">behavior pack</a> and <a href="${dl('SafariAnimals_RP.mcpack')}">resource pack</a>. Xbox, PlayStation and Switch can’t import add-ons from files, but you can join a world or Realm that has the add-on.</p>
  </section>

  <section id="animals">
    <h2>The animals</h2>
    <p class="lede">Every animal has its own model, animations and sounds. They have babies, react to each other, and follow a day and night routine.</p>
    <div class="filters" role="group" aria-label="Filter animals">
      <button aria-pressed="true" data-filter="all">All</button>
      <button aria-pressed="false" data-filter="predator">Predators</button>
      <button aria-pressed="false" data-filter="grazer">Grazers</button>
      <button aria-pressed="false" data-filter="giant">Giants</button>
      <button aria-pressed="false" data-filter="bird">Birds</button>
      <button aria-pressed="false" data-filter="primate">Primates</button>
      <button aria-pressed="false" data-filter="marsupial">Marsupials</button>
      <button aria-pressed="false" data-filter="ride">Rideable</button>
    </div>
    <div class="grid" id="grid">${animalHtml}
    </div>
  </section>

  <section id="features">
    <h2>A living savanna</h2>
    <div class="features">
      <div class="feature"><h3>Predators and prey</h3><p>Lions, cheetahs, hyenas and crocodiles hunt. Zebras, gazelles and wildebeest flee in herds when they spot one.</p></div>
      <div class="feature"><h3>Day and night</h3><p>Lions and hyenas nap through the day and hunt after dark. Grazers sleep at night.</p></div>
      <div class="feature"><h3>Ride them</h3><p>Tame and saddle zebras and ostriches, or an elephant that carries a chest and a passenger.</p></div>
      <div class="feature"><h3>Thorn hedges</h3><p>Plant thorn bushes to fence in your camp. Land animals can’t jump them and get scratched if they push through.</p></div>
      <div class="feature"><h3>Field Guide</h3><p>Every player gets a Field Guide that fills in as you spot new animals.</p></div>
      <div class="feature"><h3>Families</h3><p>Every animal can be bred with its favourite food. Babies follow their parents around.</p></div>
    </div>
  </section>

  <section id="items">
    <h2>New items and blocks</h2>
    <ul class="items">${itemHtml}
    </ul>
  </section>
</main>
<footer>
  <div class="wrap">
    <p>Safari Animals is free and open source. <a href="https://github.com/${repo}">Source code on GitHub</a> · <a href="https://github.com/${repo}/issues">Report a problem</a></p>
    <p>Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft.</p>
  </div>
</footer>
<script>
// Animal filters
const buttons = document.querySelectorAll('.filters button');
buttons.forEach((b) => b.addEventListener('click', () => {
  buttons.forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
  const f = b.dataset.filter;
  document.querySelectorAll('.card').forEach((c) => {
    c.hidden = !(f === 'all' || c.dataset.group === f || (f === 'ride' && c.dataset.ride));
  });
}));
// Latest release from GitHub
fetch('https://api.github.com/repos/${owner}/${name}/releases/latest')
  .then((r) => (r.ok ? r.json() : null))
  .then((rel) => {
    if (!rel || !rel.tag_name) return;
    const date = new Date(rel.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('version').innerHTML = 'Latest version: <strong>' + rel.tag_name.replace(/^v/, '') + '</strong> · released ' + date;
  })
  .catch(() => {});
</script>
</body>
</html>
`;
await writeFile(join(OUT, 'index.html'), html);
await writeFile(join(OUT, '.nojekyll'), '');
console.log(`Site written to ${OUT}/ (${animals.length} animals, repo ${repo})`);
