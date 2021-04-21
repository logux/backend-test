import { protocol } from './protocol.js'
import { actions } from './actions.js'
import { auth } from './auth.js'

export const tests = [...auth, ...actions, ...protocol]
