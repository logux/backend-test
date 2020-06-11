let protocol = require('./protocol.js')
let actions = require('./actions.js')
let auth = require('./auth.js')

module.exports = [...protocol, ...auth, ...actions]
