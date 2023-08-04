#!/usr/bin/env node

import { readFileSync } from 'fs'
import { join } from 'path'
import pico from 'picocolors'
import { fileURLToPath } from 'url'

import { run } from './run.js'

let pkgFile = readFileSync(
  join(fileURLToPath(import.meta.url), '..', 'package.json')
)
let pkg = JSON.parse(pkgFile)

if (
  process.argv.length === 2 ||
  process.argv.includes('-h') ||
  process.argv.includes('--help')
) {
  process.stdout.write(
    pico.bold('Usage: ') +
      'npx @logux/backend-test ' +
      pico.yellow('URL [TEST]') +
      '\n'
  )
  process.stdout.write('       npx @logux/backend-test local\n')
  process.exit(0)
}

let ignore = []
let only
for (let i = 3; i < process.argv.length; i++) {
  let arg = process.argv[i]
  if (arg === '--ignore') {
    ignore = process.argv[i + 1].split(',').map(index => parseInt(index))
    i += 1
  } else if (/^\d+$/.test(arg)) {
    only = parseInt(arg)
  }
}

let version = pkg.version.split('.')[0]

process.stdout.write(
  pico.bold('Protocol version: ') +
    pico.green(version) +
    '\n' +
    pico.bold('Secret:           ') +
    pico.green('parole') +
    '\n' +
    pico.bold('Logux server:     ') +
    pico.green('http://localhost:31337/') +
    '\n' +
    pico.bold('Back-end server:  ') +
    pico.green(process.argv[2]) +
    '\n'
)

if (only) {
  process.stdout.write(
    pico.bold('Test:             ') + pico.green(only) + '\n'
  )
}

process.stdout.write('\n')

run(process.argv[2], 'parole', only, ignore).catch(e => {
  process.stderr.write(pico.red(e.stack) + '\n')
  process.exit(1)
})
