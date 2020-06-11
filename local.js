let { isFirstOlder } = require('@logux/core')

function userName (userId, name) {
  return {
    type: 'users/name',
    payload: {
      userId,
      name
    }
  }
}

module.exports = function (server) {
  let names = new Map()

  server.options.subprotocol = '1.0.0'
  server.options.supports = '^1.0.0'

  server.auth(({ userId, token, cookie, headers }) => {
    if (headers.error) {
      throw new Error(headers.error)
    } else if (token === `${userId}:good`) {
      return true
    } else if (cookie.token === `${userId}:good`) {
      return true
    } else {
      return false
    }
  })

  server.channel('users/:id', {
    access (ctx) {
      if (ctx.headers.error) {
        throw new Error(ctx.headers.error)
      } else {
        return ctx.params.id === ctx.userId
      }
    },
    load (ctx) {
      if (names.has(ctx.params.id)) {
        let { name, lastChanged } = names.get(ctx.params.id)
        return [[userName(ctx.params.id, name), { time: lastChanged.time }]]
      } else {
        return []
      }
    }
  })

  server.type('error', {
    access () {
      throw new Error('Error in action')
    }
  })

  server.type('users/name', {
    access (ctx, action) {
      if (ctx.headers.error) {
        throw new Error(ctx.headers.error)
      } else {
        return action.payload.userId === ctx.userId
      }
    },
    resend (ctx, action) {
      return { channels: [`users/${action.payload.userId}`] }
    },
    process (ctx, action, meta) {
      let { lastChanged } = names.get(ctx.userId) || []
      if (isFirstOlder(lastChanged, meta)) {
        names.set(ctx.userId, {
          name: action.payload.name,
          lastChanged: meta
        })
      }
    }
  })

  server.type('users/clean', {
    access () {
      return true
    },
    async process () {
      for (let userId of names.keys()) {
        await server.process(userName(userId, ''))
      }
      names.clear()
    }
  })
}
