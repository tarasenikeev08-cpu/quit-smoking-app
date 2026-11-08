#!/usr/bin/env node
/**
 * Runs before `npm run web` / `npm run web:build` (npm's pre-script hook).
 *
 * Pulling new commits never runs `npm install`, so after a dependency is
 * added (react-native-reanimated, for example) an existing checkout fails
 * with "Module not found: Can't resolve '...'". This checks every declared
 * dependency is actually present in node_modules and, if any are missing,
 * runs `npm install` once so the web command just works.
 *
 * Plain Node only — it must run even when node_modules is incomplete.
 */
const fs = require('fs');
const path = require('path');
const {spawnSync} = require('child_process');

const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const declared = Object.keys({...pkg.dependencies, ...pkg.devDependencies});

const missing = () =>
  declared.filter(name => !fs.existsSync(path.join(root, 'node_modules', name, 'package.json')));

let gone = missing();
if (gone.length === 0) process.exit(0);

console.log(
  `\n[ensure-deps] ${gone.length} package(s) missing from node_modules: ${gone.join(', ')}` +
    '\n[ensure-deps] Running "npm install" to sync with package.json…\n',
);

const result = spawnSync('npm', ['install'], {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

gone = missing();
if (result.status !== 0 || gone.length > 0) {
  console.error(
    `\n[ensure-deps] Still missing after install: ${gone.join(', ') || '(install failed)'}` +
      '\n[ensure-deps] Run "npm install" manually and check its output.\n',
  );
  process.exit(1);
}
console.log('\n[ensure-deps] Dependencies installed — continuing.\n');
