let { it, getTests, expectError } = require('./util')

it('Supports token authentication', async ({ server }) => {
  await server.connect('10', { token: '10:good' })
})

it('Supports cookie authentication', async ({ server }) => {
  await server.connect('10', { cookie: { token: '10:good' } })
})

it('Detects wrong token', async ({ server }) => {
  await expectError('Wrong credentials', () =>
    server.connect('10', { token: '10:bad' })
  )
})

it('Detects wrong cookie', async ({ server }) => {
  await expectError('Wrong credentials', () =>
    server.connect('10', { cookie: { token: '10:bad' } })
  )
})

module.exports = getTests()
