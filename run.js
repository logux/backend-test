let { TestServer } = require('@logux/server')
let ora = require('ora')

let local = require('./local')
let tests = require('./tests')

async function runTest (index) {
  let spinner = ora(tests[index].desc).start()
  try {
    await tests[index].fn()
    spinner.succeed()
  } catch {
    spinner.fail()
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
    await runTest(only)
  } else {
    for (let i = 0; i < tests.length; i++) {
      await runTest(i)
    }
  }

  await server.destroy()
}
