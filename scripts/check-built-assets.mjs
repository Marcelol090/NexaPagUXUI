import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const assetDir = 'dist/assets';
if (!existsSync(assetDir)) throw new Error('Vite assets absent: dist/assets');
const styles = readdirSync(assetDir)
  .filter(name => name.endsWith('.css'))
  .map(name => readFileSync(join(assetDir, name), 'utf8'))
  .join('\n');

for (const selector of ['data-live-glass', 'data-ds-radius', 'live-glass-hero', 'ds-radius']) {
  if (!styles.includes(selector)) {
    throw new Error('Critical NexaPag material/geometry selector absent from built CSS: ' + selector);
  }
}
const html = readFileSync('dist/lab.html', 'utf8');
const newHome = readFileSync('dist/index.html', 'utf8');
if(!newHome.includes('Visualize 9.38') || !newHome.includes('orb-fluid-canvas') || !newHome.includes('gradientStrengthRange')) throw new Error('Root website does not serve complete Visualize 9.38');
if (!html.includes('src="./assets/') && !html.includes('href="./assets/')) {
  throw new Error('Vite did not emit relative asset paths for GitHub Pages');
}
for (const file of ['dist/materials.html','dist/colorimetria.html']) {
  if (!existsSync(file)) throw new Error('Missing Pages route: ' + file);
}
console.log('Compiled CSS contract OK: Visualize 9.37 root, legacy lab and relative assets.');
