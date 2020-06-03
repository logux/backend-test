#!/usr/bin/env node

let { readFileSync } = require('fs')
let { join } = require('path')
let chalk = require('chalk')

let run = require('./run')

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
  process.exit(0)
}

let version = pkg.version.split('.')[0]

process.stdout.write(
  'Protocol version: ' +
    chalk.bold(version) +
    '\n' +
    'Secret:           ' +
    chalk.bold('parole') +
    '\n' +
    'Logux server:     ' +
    chalk.bold('http://localhost:31337/') +
    '\n' +
    'Back-end server:  ' +
    chalk.bold(process.argv[2]) +
    '\n\n'
)

run(process.argv[2], 'parole').catch(e => {
  process.stderr.write(chalk.red(e.stack))
  process.exit(1)
})
