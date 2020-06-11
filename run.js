let { TestServer } = require('@logux/server')
let chalk = require('chalk')
let ora = require('ora')

let local = require('./local')
let tests = require('./tests')

async function runTest (data) {
  let prefix = chalk.gray((data.index + ' ').padStart(3, ' '))
  let spinner = ora(prefix + tests[data.index].title).start()
  let server = new TestServer({
    controlSecret: data.controlSecret,
    backend: data.backend === 'local' ? undefined : data.backend
  })
  if (data.backend === 'local') {
    local(server)
  }
  await server.listen()
  try {
    await tests[data.index].test({ ...data, server })
    spinner.succeed()
  } catch (e) {
    spinner.fail()
    process.stderr.write('\n')
    if (e.assert) {
      let file = e.stack.split('\n')[1].match(/\((.*)\)$/)[1]
      process.stderr.write(
        '  ' +
          chalk.bold.red(e.message) +
          '\n\nTest:      ' +
          chalk.yellow(file) +
          '\nRe-run it: ' +
          chalk.yellow(
            'npx @logux/backend-test ' +
              data.backend +
              ' ' +
              chalk.bold(data.index)
          ) +
          '\n'
      )
      process.exit(1)
    } else {
      process.stderr.write(
        'Re-run test: ' +
          chalk.yellow(
            'npx @logux/backend-test ' +
              data.backend +
              ' ' +
              chalk.bold(data.index)
          ) +
          '\n\n'
      )
      throw e
    }
  } finally {
    server.destroy()
    for (let client of server.connected.values()) {
      client.destroy()
    }
  }
}

module.exports = async function run (backend, controlSecret, only) {
  if (only && !tests[only]) {
    throw new Error('Unknown test ' + only)
  }

  if (only) {
    await runTest({ controlSecret, backend, index: only })
  } else {
    for (let i = 0; i < tests.length; i++) {
      await runTest({ controlSecret, backend, index: i })
    }
  }
}
