let { TestServer } = require('@logux/server')
let chalk = require('chalk')
let ora = require('ora')

let local = require('./local')
let tests = require('./tests')

async function runTest (data) {
  let spinner = ora(tests[data.index].title).start()
  try {
    await tests[data.index].test(data)
    spinner.succeed()
    for (let client of data.server.connected.values()) {
      client.destroy()
    }
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
      throw e
    }
  }
}

module.exports = async function run (controlSecret, backend, only) {
  if (only && !tests[only]) {
    throw new Error('Unknown test ' + only)
  }

  let spinner = ora('Starting Logux server').start()
  let server
  if (backend === 'local') {
    server = new TestServer()
    local(server)
  } else {
    server = new TestServer({
      controlSecret,
      backend
    })
  }
  await server.listen()
  spinner.succeed()

  if (only) {
    await runTest({ controlSecret, backend, server, index: only })
  } else {
    for (let i = 0; i < tests.length; i++) {
      await runTest({ controlSecret, backend, server, index: i })
    }
  }

  await server.destroy()
}
