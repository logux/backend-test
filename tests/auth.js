let { it, getTests, expectError, assert } = require('./util')

it('Supports token authentication', async ({ server }) => {
  await server.connect('10', { token: '10:good', subprotocol: '1.0.0' })
})

it('Supports cookie authentication', async ({ server }) => {
  await server.connect('10', {
    cookie: { token: '10:good' },
    subprotocol: '1.0.0'
  })
})

it('Processes an error during the authentication', async ({ server }) => {
  let error
  server.on('error', e => {
    error = e
  })
  await expectError('Wrong credentials', () =>
    server.connect('10', {
      token: '10:good',
      subprotocol: '1.0.0',
      headers: { error: 'Test error' }
    })
  )
  assert(!!error, 'Server did not received error from back-end')
  if (!error.toString().includes('Test error')) {
    throw error
  }
})

it('Detects wrong token', async ({ server }) => {
  await expectError('Wrong credentials', () =>
    server.connect('10', { token: '10:bad', subprotocol: '1.0.0' })
  )
})

it('Detects wrong cookie', async ({ server }) => {
  await expectError('Wrong credentials', () =>
    server.connect('10', { cookie: { token: '10:bad' }, subprotocol: '1.0.0' })
  )
})

it('Sends server subprotocol', async ({ server }) => {
  let client = await server.connect('10', {
    token: '10:good',
    subprotocol: '1.0.0'
  })
  assert(
    client.node.remoteSubprotocol !== '0.0.0',
    'Server does not set subprotocol'
  )
  assert(
    client.node.remoteSubprotocol === '1.0.0',
    `Server set subprotocol ${client.node.remoteSubprotocol} instead of 1.0.0`
  )
})

it('Checks users subprotocol', async ({ server }) => {
  await expectError(
    '^1.0.0 application subprotocols are supported, but you use 0.9.1',
    () =>
      server.connect('10', {
        token: '10:good',
        subprotocol: '0.9.1'
      })
  )
  server.connect('10', {
    token: '10:good',
    subprotocol: '1.0.1'
  })
})

module.exports = getTests()
