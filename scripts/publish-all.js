#!/usr/bin/env node
/**
 * Publish all Gist Plus packages to npm in dependency order.
 *
 * Usage:
 *   node scripts/publish-all.js                  # build + publish for real
 *   node scripts/publish-all.js --dry-run        # build + `npm publish --dry-run`
 *   node scripts/publish-all.js --otp=123456     # pass 2FA code from authenticator
 *
 * Notes:
 *   - Packages are scoped (@gistplus/*) and configured with
 *     publishConfig.access = "public", so they publish publicly.
 *   - You must be logged in (`npm login`) and a member of the @gistplus org
 *     (or owner of the scope) before running for real.
 *   - core is published first because the others depend on it.
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const DRY = process.argv.includes('--dry-run')
const otpArg = process.argv.find((a) => a.startsWith('--otp='))
const OTP = otpArg ? ` ${otpArg}` : ''

// Dependency order: core has no internal deps; the rest depend on core.
const PACKAGES = [
  'packages/core/typescript',
  'packages/client/typescript',
  'packages/server/typescript',
  'packages/gateway/typescript',
  'packages/indexer/typescript',
]

function run(cmd, cwd) {
  console.log(`\n$ ${cmd}  (in ${path.relative(ROOT, cwd) || '.'})`)
  execSync(cmd, { cwd, stdio: 'inherit' })
}

function readPkg(dir) {
  return JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'))
}

console.log(DRY ? '== DRY RUN ==' : '== PUBLISHING FOR REAL ==')

for (const rel of PACKAGES) {
  const dir = path.join(ROOT, rel)
  const pkg = readPkg(dir)
  console.log(`\n──────────────────────────────────────────`)
  console.log(`Package: ${pkg.name}@${pkg.version}`)

  // 1. Clean + build so dist/ is fresh.
  run('npm run build', dir)

  // 2. Publish (scoped public). --dry-run just shows the tarball contents.
  const publishCmd = DRY
    ? 'npm publish --access public --dry-run'
    : `npm publish --access public${OTP}`
  run(publishCmd, dir)
}

console.log(
  DRY
    ? '\nDry run complete. Re-run without --dry-run to publish for real.'
    : '\nAll packages published.'
)
