let { getTests, it, send, assert } = require('./util')

function check (statusCode, body, answer) {
  assert(
    statusCode === answer[0],
    `Back-end sent ${answer[0]} status code instead of ${statusCode}`
  )
  assert(body === answer[1], `Back-end sent ${answer[1]} instead of ${body}`)
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
