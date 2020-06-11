let http = require('http')

let tests = []

function it (title, test) {
  tests.push({ title, test })
}

function getTests () {
  let result = tests
  tests = []
  return result
}

function assert (bool, errorMsg) {
  if (!bool) {
    let err = new Error(errorMsg)
    err.assert = true
    throw err
  }
}

async function catchError (cb) {
  let err
  try {
    await cb()
  } catch (e) {
    err = e
  }
  return err
}

async function expectError (msg, cb) {
  let err = await catchError(cb)
  assert(!!err, 'Server didn’t return an error')
  if (err.message.includes(msg)) {
    return err
  } else {
    throw err
  }
}

async function send (url, data) {
  if (url === 'local') url = 'http://localhost:31337/'
  let body = JSON.stringify(data)
  let parsedUrl = new URL(url)
  return new Promise((resolve, reject) => {
    let req = http.request(
      {
        method: 'POST',
        host: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname + parsedUrl.search,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      },
      res => {
        let answer = ''
        res
          .on('data', i => {
            answer += i.toString()
          })
          .on('error', err => {
            reject(err)
          })
          .on('end', () => {
            resolve([res.statusCode, answer])
          })
      }
    )
    req.on('error', err => {
      reject(err)
    })
    req.end(body)
  })
}

function nameAction (userId, name) {
  return { type: 'users/name', payload: { userId, name } }
}

function checkActions (actions, ideal) {
  assert(
    actions.length === ideal.length,
    `Server sent ${actions.length} actions, instead of ${ideal.length}`
  )
  for (let [i, action] of actions.entries()) {
    assert(
      action.type === ideal[i].type,
      `Server sent "${action.type}", instead of "${ideal[i].type}" action`
    )
    let json = JSON.stringify(action)
    let idealJson = JSON.stringify(ideal[i])
    assert(
      json === idealJson,
      `Server sent ${json}, instead of ${idealJson} action`
    )
  }
}

module.exports = {
  it,
  getTests,
  assert,
  catchError,
  expectError,
  send,
  nameAction,
  checkActions
}
