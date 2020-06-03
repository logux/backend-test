let { TestServer } = require('@logux/server')
let ora = require('ora')

module.exports = async function run (backend, controlSecret) {
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
  await server.destroy()
}
