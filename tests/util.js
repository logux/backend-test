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

module.exports = {
  it,
  getTests,
  assert,
  catchError,
  expectError
}
