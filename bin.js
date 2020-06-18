#!/usr/bin/env node

let { readFileSync } = require('fs')
let { join } = require('path')
let kleur = require('kleur')

let tests = require('./tests')
let run = require('./run')

let pkgFile = readFileSync(join(__dirname, 'package.json'))
let pkg = JSON.parse(pkgFile)

if (
  process.argv.length === 2 ||
  process.argv.includes('-h') ||
  process.argv.includes('--help')
) {
  process.stdout.write(
    kleur.bold('Usage: ') +
      'npx @logux/backend-test ' +
      kleur.yellow('URL [TEST]') +
      '\n'
  )
  process.stdout.write('       npx @logux/backend-test local\n')
  process.exit(0)
}

if (process.argv[3] && !tests[process.argv[3]]) {
  process.stderr.write(kleur.red('Unknown test ' + process.argv[3] + '\n'))
  process.exit(1)
}

let version = pkg.version.split('.')[0]

process.stdout.write(
  kleur.bold('Protocol version: ') +
    kleur.green(version) +
    '\n' +
    kleur.bold('Secret:           ') +
    kleur.green('parole') +
    '\n' +
    kleur.bold('Logux server:     ') +
    kleur.green('http://localhost:31337/') +
    '\n' +
    kleur.bold('Back-end server:  ') +
    kleur.green(process.argv[2]) +
    '\n'
)

if (process.argv[3]) {
  process.stdout.write(
    kleur.bold('Test:             ') + kleur.green(process.argv[3]) + '\n'
  )
}

process.stdout.write('\n')

run(process.argv[2], 'parole', process.argv[3]).catch(e => {
  process.stderr.write(kleur.red(e.stack) + '\n')
  process.exit(1)
})
