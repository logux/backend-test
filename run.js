let { bold, red, yellow, gray } = require('colorette')
let { TestServer } = require('@logux/server')
let ora = require('ora')

let local = require('./local')
let tests = require('./tests')

async function runTest (data) {
  let prefix = gray((data.index + ' ').padStart(3, ' '))
  let spinner = ora(prefix + tests[data.index].title).start()
  let server = new TestServer({
    controlSecret: data.controlSecret,
    supports: data.backend === 'local' ? '^1.0.0' : undefined,
    backend: data.backend === 'local' ? undefined : data.backend,
    auth: false
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
      let files = e.stack.split('\n').map(i => {
        let match = i.match(/\((.*)\)$/)
        return match ? match[1] : ''
      })
      let file = files.find(i => {
        return /[/\\]tests[/\\]\w+\.js/.test(i) && !i.includes('util.js:')
      })
      process.stderr.write(
        '  ' +
          bold(red(e.message)) +
          '\n\nTest:      ' +
          yellow(file) +
          '\nRe-run it: ' +
          yellow(
            'npx @logux/backend-test ' + data.backend + ' ' + bold(data.index)
          ) +
          '\n'
      )
      process.exit(1)
    } else {
      process.stderr.write(
        'Re-run test: ' +
          yellow(
            'npx @logux/backend-test ' + data.backend + ' ' + bold(data.index)
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

module.exports = async function run (backend, controlSecret, only, ignore) {
  if (only && !tests[only]) {
    throw new Error('Unknown test ' + only)
  }

  if (only) {
    await runTest({ controlSecret, backend, index: only })
  } else {
    for (let i = 0; i < tests.length; i++) {
      if (!ignore.includes(i)) {
        await runTest({ controlSecret, backend, index: i })
      }
    }
  }
}
