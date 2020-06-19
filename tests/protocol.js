let { getTests, it, send, assert, nameAction, checkActions } = require('./util')

function check (statusCode, body, answer) {
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
      version: 4,
      secret: 'wrong',
      commands: []
    })
  )
})

it('Checks version', async ({ backend, controlSecret }) => {
  check(
    400,
    'Back-end protocol version is not supported',
    await send(backend, {
      version: 1000,
      secret: controlSecret,
      commands: []
    })
  )
})

it('Checks format', async ({ backend }) => {
  check(400, 'Wrong body', await send(backend, []))
})

it('Processes multiple actions', async ({ server, backend, controlSecret }) => {
  let [statusCode] = await send(backend, {
    version: 4,
    secret: controlSecret,
    commands: [
      {
        command: 'action',
        action: { type: 'error' },
        meta: { id: '1 10:1:1' }
      },
      {
        command: 'action',
        action: nameAction('10', 'B'),
        meta: { id: '1 10:1:1' }
      }
    ]
  })
  assert(
    statusCode === 200,
    `Back-end sent ${statusCode} status code instead of 200`
  )
  let client = await server.connect('10', {
    token: '10:good',
    subprotocol: '1.0.0'
  })
  checkActions(await client.collect(() => client.subscribe('users/10')), [
    nameAction('10', 'B'),
    { type: 'logux/processed', id: '3 10:1:1 0' }
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
        version: 4,
        secret,
        commands: []
      })
    )
  )
  check(429, 'Too many wrong secret attempts', answers[answers.length - 1])
})

module.exports = getTests()
