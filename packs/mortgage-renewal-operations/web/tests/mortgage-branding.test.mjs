import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const overlay = resolve(__dirname, '..', 'overlay');
const manifest = JSON.parse(readFileSync(resolve(__dirname, '..', 'manifest.json'), 'utf8'));
const theme = readFileSync(resolve(overlay, 'lib', 'pack', 'theme.ts'), 'utf8');
const experience = readFileSync(resolve(overlay, 'lib', 'pack', 'experience.tsx'), 'utf8');
const readme = readFileSync(resolve(__dirname, '..', 'README.md'), 'utf8');

test('manifest follows the shared web overlay shape', () => {
  assert.equal(manifest.story, 'story/default.json');
  assert.deepEqual(manifest.overlay, [
    'app/page.tsx',
    'app/analyst',
    'components/nav/DashboardNav.tsx',
    'lib/pack',
    'lib/mortgage-dashboard.server.ts',
    'public/brand',
  ]);
});

test('the mortgage theme names the product and deployment organization token', () => {
  assert.match(theme, /productName:\s*'Mortgage Renewal IQ'/);
  assert.match(theme, /brandAlt:\s*'\{\{ organization_name \}\}'/);
  assert.match(theme, /brandMark:\s*'\/brand\/mortgage-renewal-mark\.svg'/);
  assert.match(theme, /exitHref:\s*'\/analyst'/);
});

test('the pack owns a public brand mark and no artifact adapter', () => {
  assert.ok(existsSync(resolve(overlay, 'public', 'brand', 'mortgage-renewal-mark.svg')));
  assert.match(experience, /packId:\s*'mortgage-renewal-operations'/);
  assert.doesNotMatch(experience, /artifact\s*:/);
});

test('the readme documents the shared-runtime boundary', () => {
  assert.match(readme, /not a standalone Vite or Next\.js application/i);
  assert.match(readme, /shared web runtime/i);
  assert.match(readme, /does not copy the legacy deployment, BFF/i);
});
