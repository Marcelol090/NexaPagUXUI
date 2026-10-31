import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const files = readdirSync('src')
  .filter(name => name.endsWith('.css'))
  .map(name => join('src', name));

// Catch unclosed @media blocks that used to absorb the entire Sage Glass
// cascade. CSS parsing still belongs to Vite; this guards structural braces.
function inspect(source, filename) {
  let depth = 0;
  let quote = '';
  let comment = false;
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];
    if (comment) {
      if (ch === '*' && next === '/') { comment = false; i++; }
      continue;
    }
    if (quote) {
      if (ch === '\\') { i++; continue; }
      if (ch === quote) quote = '';
      continue;
    }
    if (ch === '/' && next === '*') { comment = true; i++; continue; }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth < 0) throw new Error(filename + ': unmatched closing brace at ' + i);
    }
  }
  if (comment || quote || depth !== 0) {
    throw new Error(filename + ': malformed stylesheet (open blocks=' + depth +
      ', quote=' + JSON.stringify(quote) + ', comment=' + comment + ')');
  }
}

for (const path of files) inspect(readFileSync(path, 'utf8'), path);
const html = readFileSync('index.html', 'utf8');
for (const match of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
  inspect(match[1], 'index.html <style>');
}
console.log('CSS integrity OK: ' + files.length + ' source stylesheets and inline styles closed.');
