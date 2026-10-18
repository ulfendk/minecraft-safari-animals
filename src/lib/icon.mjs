// Pack icon: savanna sunset with an acacia tree and a giraffe, drawn at 32x32 and scaled up.
import { PNG } from 'pngjs';
import { hex, mix } from './texture.mjs';

export function packIcon(scale = 8) {
  const N = 32;
  const px = Array.from({ length: N }, () => new Array(N));
  const sky = [hex('#2b1d4f'), hex('#b8436b'), hex('#f08a3c'), hex('#ffd36b')];
  for (let y = 0; y < N; y++) {
    const t = y / 22;
    const c = t < 0.4 ? mix(sky[0], sky[1], t / 0.4) : t < 0.75 ? mix(sky[1], sky[2], (t - 0.4) / 0.35) : mix(sky[2], sky[3], (t - 0.75) / 0.25);
    for (let x = 0; x < N; x++) px[y][x] = c;
  }
  // Sun
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const d = Math.hypot(x - 20, y - 19);
    if (d < 7) px[y][x] = mix(hex('#fff2b0'), hex('#ffc04d'), d / 7);
  }
  // Ground
  const ground = hex('#3a2414');
  for (let y = 23; y < N; y++) for (let x = 0; x < N; x++) px[y][x] = y === 23 ? hex('#5a3a1e') : ground;
  const dark = hex('#1f130b');
  const fill = (x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (y >= 0 && y < N && x >= 0 && x < N) px[y][x] = dark; };
  // Acacia: flat canopy, forked trunk
  fill(1, 9, 14, 10); fill(3, 8, 12, 8); fill(0, 11, 15, 11);
  fill(7, 12, 8, 22); fill(5, 12, 6, 14); fill(9, 13, 10, 15); fill(4, 12, 4, 12); fill(11, 12, 11, 12);
  // Giraffe (facing left)
  fill(19, 15, 26, 18); // body
  fill(19, 19, 19, 23); fill(21, 19, 21, 23); fill(24, 19, 24, 23); fill(26, 19, 26, 23); // legs
  fill(20, 6, 21, 15); fill(19, 9, 20, 15); fill(19, 5, 22, 6); fill(16, 6, 18, 7); // neck + head
  fill(20, 3, 20, 4); fill(22, 3, 22, 4); // ossicones
  fill(27, 15, 27, 18); // tail

  const png = new PNG({ width: N * scale, height: N * scale });
  for (let y = 0; y < N * scale; y++) for (let x = 0; x < N * scale; x++) {
    png.data.set(px[Math.floor(y / scale)][Math.floor(x / scale)], (y * N * scale + x) * 4);
  }
  return PNG.sync.write(png);
}
