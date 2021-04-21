import {
  checkActions,
  expectError,
  nameAction,
  getTests,
  getId,
  it
} from './util.js'

async function connectClient(server) {
  let client = await server.connect('10', {
    token: '10:good',
    subprotocol: '1.0.0'
  })
  client.log.keepActions()
  return client
}

function rename(client, userId, name) {
  return client.process(nameAction(userId, name))
}

it('Checks subscription access', async ({ server }) => {
  let client = await connectClient(server)
  await expectError('Action was denied', () => client.subscribe('users/20'))
})

it('Checks action access', async ({ server }) => {
  let client = await connectClient(server)
  await expectError('Action was denied', () => rename(client, '20', 'New'))
})

it('Processes an error during the action processing', async ({ server }) => {
  let client = await connectClient(server)
  client.node.setLocalHeaders({ error: 'Test error' })
  await expectError('Test error', () => client.subscribe('users/10'))
})

it('Processes an error during the subscription', async ({ server }) => {
  let client = await connectClient(server)
  client.node.setLocalHeaders({ error: 'Test error' })
  await expectError('Test error', () => rename(client, '10', 'New'))
})

it('Processes subscriptions', async ({ server }) => {
  let client1 = await connectClient(server)
  let client2 = await connectClient(server)
  let other = await connectClient(server)

  await client1.subscribe('users/10')
  await rename(client1, '10', 'Name')

  checkActions(await client2.collect(() => client2.subscribe('users/10')), [
    nameAction('10', 'Name'),
    { type: 'logux/processed', id: getId(client2, 'users/10') }
  ])

  checkActions(await client2.collect(() => rename(client1, '10', 'A')), [
    nameAction('10', 'A')
  ])

  checkActions(await other.collect(() => rename(client1, '10', 'B')), [])
})

it('Sends action from the back-end', async ({ server }) => {
  let client = await connectClient(server)
  await rename(client, '10', 'Name')
  await client.subscribe('users/10')

  let actions = await client.collect(() => {
    return client.process({ type: 'users/clean' })
  })
  checkActions(actions, [
    nameAction('10', ''),
    { type: 'logux/processed', id: getId(client, { type: 'users/clean' }) }
  ])
})

it('Tracks action time', async ({ server }) => {
  let client = await connectClient(server)
  await client.process(nameAction('10', 'A'), { time: 100 })
  await client.process(nameAction('10', 'B'), { time: 10 })

  checkActions(await client.collect(() => client.subscribe('users/10')), [
    nameAction('10', 'A'),
    { type: 'logux/processed', id: getId(client, 'users/10') }
  ])
})

it('Processes unknown actions', async ({ server }) => {
  let client = await connectClient(server)
  await expectError('not have callbacks for unknown actions', () => {
    return client.process({ type: 'unknown' })
  })
})

it('Processes unknown subscriptions', async ({ server }) => {
  let client = await connectClient(server)
  await expectError('not have callbacks for unknown channel', () => {
    return client.subscribe('unknown')
  })
})

export const actions = getTests()
