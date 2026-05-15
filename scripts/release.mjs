#!/usr/bin/env node
// Usage: npm run release [patch|minor|major]
// Defaults to patch if no argument given.
// Bumps package.json version, creates a git tag, and pushes both.

import { execSync } from 'child_process'

const bump = process.argv[2] ?? 'patch'
if (!['patch', 'minor', 'major'].includes(bump)) {
  console.error(`Unknown bump type: ${bump}. Use patch, minor, or major.`)
  process.exit(1)
}

const run = (cmd) => execSync(cmd, { stdio: 'inherit' })

// Ensure working tree is clean
try {
  execSync('git diff --exit-code && git diff --cached --exit-code', { stdio: 'pipe' })
} catch {
  console.error('Working tree has uncommitted changes. Commit or stash before releasing.')
  process.exit(1)
}

// Bump version + create tag (npm version also commits the package.json change)
run(`npm version ${bump} --message "chore(release): v%s"`)

// Push commit and tag
run('git push origin main')
run('git push origin --tags')

const version = JSON.parse(execSync('cat package.json').toString()).version
console.log(`\nReleased v${version} -- deploy triggered.`)
