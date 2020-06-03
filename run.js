let { TestServer } = require('@logux/server')
let ora = require('ora')

module.exports = async function run (backend, controlSecret) {
  let spinner = ora('Starting Logux server').start()
  let server = new TestServer({
    controlSecret,
    backend
  })
  await server.listen()
  spinner.succeed()
  await server.destroy()
}
