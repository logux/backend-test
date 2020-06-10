#!/usr/bin/env node

let { readFileSync } = require('fs')
let { join } = require('path')
let chalk = require('chalk')

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
    chalk.bold('Usage: ') +
      'npx @logux/backend-test ' +
      chalk.yellow('URL [TEST]') +
      '\n'
  )
  process.stdout.write('       npx @logux/backend-test local\n')
  process.exit(0)
}

if (process.argv[3] && !tests[process.argv[3]]) {
  process.stderr.write(chalk.red('Unknown test ' + process.argv[3] + '\n'))
  process.exit(1)
}

let version = pkg.version.split('.')[0]

process.stdout.write(
  chalk.bold('Protocol version: ') +
    chalk.green(version) +
    '\n' +
    chalk.bold('Secret:           ') +
    chalk.green('parole') +
    '\n' +
    chalk.bold('Logux server:     ') +
    chalk.green('http://localhost:31337/') +
    '\n' +
    chalk.bold('Back-end server:  ') +
    chalk.green(process.argv[2]) +
    '\n'
)

if (process.argv[3]) {
  process.stdout.write(
    chalk.bold('Test:             ') + chalk.green(process.argv[3]) + '\n'
  )
}

process.stdout.write('\n')

run(process.argv[2], 'parole', process.argv[3]).catch(e => {
  process.stderr.write(chalk.red(e.stack) + '\n')
  process.exit(1)
})
