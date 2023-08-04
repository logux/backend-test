import { assert, expectError, getTests, it } from './util.js'

it('Supports token authentication', async ({ server }) => {
  await server.connect('10', { subprotocol: '1.0.0', token: '10:good' })
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
      headers: { error: 'Test error' },
      subprotocol: '1.0.0',
      token: '10:good'
    })
  )
  assert(!!error, 'Server did not received error from back-end')
  if (!error.stack.includes('Test error')) {
    throw error
  }
})

it('Detects wrong token', async ({ server }) => {
  await expectError('Wrong credentials', () =>
    server.connect('10', { subprotocol: '1.0.0', token: '10:bad' })
  )
})

it('Detects wrong cookie', async ({ server }) => {
  await expectError('Wrong credentials', () =>
    server.connect('10', { cookie: { token: '10:bad' }, subprotocol: '1.0.0' })
  )
})

it('Sends server subprotocol', async ({ server }) => {
  let client = await server.connect('10', {
    subprotocol: '1.0.0',
    token: '10:good'
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
        subprotocol: '0.9.1',
        token: '10:good'
      })
  )
  server.connect('10', {
    subprotocol: '1.0.1',
    token: '10:good'
  })
})

export const auth = getTests()
