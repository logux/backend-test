#!/usr/bin/env node

let { readFileSync } = require('fs')
let { join } = require('path')

let pkgFile = readFileSync(join(__dirname, 'package.json'))
let pkg = JSON.parse(pkgFile)

if (
  process.argv.length === 2 ||
  process.argv.includes('-h') ||
  process.argv.includes('--help')
) {
  process.stdout.write(
    pkg.description + '\nUsage: npx @logux/backend-test URL\n'
  )
}
