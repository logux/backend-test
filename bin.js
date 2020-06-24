#!/usr/bin/env node

let { bold, green, red, yellow } = require('colorette')
let { readFileSync } = require('fs')
let { join } = require('path')

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
    bold('Usage: ') + 'npx @logux/backend-test ' + yellow('URL [TEST]') + '\n'
  )
  process.stdout.write('       npx @logux/backend-test local\n')
  process.exit(0)
}

if (process.argv[3] && !tests[process.argv[3]]) {
  process.stderr.write(red('Unknown test ' + process.argv[3] + '\n'))
  process.exit(1)
}

let version = pkg.version.split('.')[0]

process.stdout.write(
  bold('Protocol version: ') +
    green(version) +
    '\n' +
    bold('Secret:           ') +
    green('parole') +
    '\n' +
    bold('Logux server:     ') +
    green('http://localhost:31337/') +
    '\n' +
    bold('Back-end server:  ') +
    green(process.argv[2]) +
    '\n'
)

if (process.argv[3]) {
  process.stdout.write(
    bold('Test:             ') + green(process.argv[3]) + '\n'
  )
}

process.stdout.write('\n')

run(process.argv[2], 'parole', process.argv[3]).catch(e => {
  process.stderr.write(red(e.stack) + '\n')
  process.exit(1)
})
