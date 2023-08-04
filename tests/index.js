import { actions } from './actions.js'
import { auth } from './auth.js'
import { protocol } from './protocol.js'

export const tests = [...auth, ...actions, ...protocol]
