import {
  assert,
  checkActions,
  getId,
  getTests,
  it,
  nameAction,
  send
} from './util.js'

function check(statusCode, body, answer) {
  assert(body === answer[1], `Back-end sent ${answer[1]} instead of ${body}`)
  assert(
    statusCode === answer[0],
    `Back-end sent ${answer[0]} status code instead of ${statusCode}`
  )
}

it('Checks secret', async ({ backend }) => {
  check(
    403,
    'Wrong secret',
    await send(backend, {
      commands: [],
      secret: 'wrong',
      version: 4
    })
  )
})

it('Checks version', async ({ backend, controlSecret }) => {
  check(
    400,
    'Back-end protocol version is not supported',
    await send(backend, {
      commands: [],
      secret: controlSecret,
      version: 1000
    })
  )
})

it('Checks format', async ({ backend }) => {
  check(400, 'Wrong body', await send(backend, []))
})

it('Processes multiple actions', async ({ backend, controlSecret, server }) => {
  let [statusCode] = await send(backend, {
    commands: [
      {
        action: { type: 'error' },
        command: 'action',
        meta: { id: '1 10:1:1 0', time: 101 }
      },
      {
        action: nameAction('10', 'B'),
        command: 'action',
        meta: { id: '2 10:1:1 0', time: 102 }
      }
    ],
    secret: controlSecret,
    version: 4
  })
  assert(
    statusCode === 200,
    `Back-end sent ${statusCode} status code instead of 200`
  )
  let client = await server.connect('10', {
    subprotocol: '1.0.0',
    token: '10:good'
  })
  client.log.keepActions()
  checkActions(await client.collect(() => client.subscribe('users/10')), [
    nameAction('10', 'B'),
    { id: getId(client, 'users/10'), type: 'logux/processed' }
  ])
})

// Must be always the last test
it('Protects from brute-force', async ({ backend, controlSecret }) => {
  let secrets = []
  for (let i = 0; i < 10; i++) {
    secrets.push(controlSecret + i.toString())
  }
  secrets.push(controlSecret)
  let answers = await Promise.all(
    secrets.map(secret =>
      send(backend, {
        commands: [],
        secret,
        version: 4
      })
    )
  )
  check(429, 'Too many wrong secret attempts', answers[answers.length - 1])
})

export const protocol = getTests()
