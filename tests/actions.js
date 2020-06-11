let { it, getTests, expectError } = require('./util')

function connectClient (server) {
  return server.connect('10', { token: '10:good', subprotocol: '1.0.0' })
}

function rename (userId, name) {
  return { type: 'users/name', payload: { userId, name } }
}

it('Checks subscription access', async ({ server }) => {
  let client = await connectClient(server)
  await expectError('Action was denied', () => {
    return client.process({ type: 'logux/subscribe', channel: 'users/20' })
  })
})

it('Checks action access', async ({ server }) => {
  let client = await connectClient(server)
  await expectError('Action was denied', () => {
    return client.process(rename(20, 'New name'))
  })
})

it('Processes an error during the action processing', async ({ server }) => {
  let client = await connectClient(server)
  client.node.setLocalHeaders({ error: 'Test error' })
  await expectError('Test error', () => {
    return client.process({ type: 'logux/subscribe', channel: 'users/10' })
  })
})

it('Processes an error during the subscription', async ({ server }) => {
  let client = await connectClient(server)
  client.node.setLocalHeaders({ error: 'Test error' })
  await expectError('Test error', () => {
    return client.process(rename(10, 'New name'))
  })
})

module.exports = getTests()
