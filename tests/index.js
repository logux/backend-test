let actions = require('./actions.js')
let auth = require('./auth.js')

module.exports = [...auth, ...actions]
