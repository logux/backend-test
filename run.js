import { TestServer } from '@logux/server'
import { createSpinner } from 'nanospinner'
import pico from 'picocolors'

import { local } from './local.js'
import { tests } from './tests/index.js'

async function runTest(data) {
  let prefix = pico.gray((data.index + ' ').padStart(3, ' '))
  let spinner = createSpinner(prefix + tests[data.index].title).start()
  let server = new TestServer({
    auth: false,
    backend: data.backend === 'local' ? undefined : data.backend,
    controlSecret: data.controlSecret,
    supports: data.backend === 'local' ? '^1.0.0' : undefined
  })
  if (data.backend === 'local') {
    local(server)
  }
  await server.listen()
  try {
    await tests[data.index].test({ ...data, server })
    spinner.success()
  } catch (e) {
    spinner.error()
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
          pico.bold(pico.red(e.message)) +
          '\n\nTest:      ' +
          pico.yellow(file) +
          '\nRe-run it: ' +
          pico.yellow(
            'npx @logux/backend-test ' +
              data.backend +
              ' ' +
              pico.bold(data.index)
          ) +
          '\n'
      )
      process.exit(1)
    } else {
      process.stderr.write(
        'Re-run test: ' +
          pico.yellow(
            'npx @logux/backend-test ' +
              data.backend +
              ' ' +
              pico.bold(data.index)
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

export async function run(backend, controlSecret, only, ignore) {
  if (only && !tests[only]) {
    throw new Error('Unknown test ' + only)
  }

  if (only) {
    await runTest({ backend, controlSecret, index: only })
  } else {
    for (let i = 0; i < tests.length; i++) {
      if (!ignore.includes(i)) {
        await runTest({ backend, controlSecret, index: i })
      }
    }
  }
}
