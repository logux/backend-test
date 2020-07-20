# Logux Back-end Test

<img align="right" width="95" height="148" title="Logux logotype"
     src="https://logux.io/branding/logotype.svg">

Logux is a new way to connect client and server. Instead of sending
HTTP requests (e.g., AJAX and GraphQL) it synchronizes log of operations
between client, server, and other clients.

* **[Guide, recipes, and API](https://logux.io/)**
* **[Chat](https://gitter.im/logux/logux)** for any questions
* **[Issues](https://github.com/logux/logux/issues)**
  and **[roadmap](https://github.com/logux/logux/projects/1)**
* **[Projects](https://logux.io/guide/architecture/parts/)**
  inside Logux ecosystem

This repository contains test [Logux Back-end Protocol] implementation.

[Logux Back-end Protocol]: https://logux.io/protocols/backend/spec/


## Usage

1. Install Node.js 10 or later.
2. Create a folder inside your project. For instance, `test/`.
3. Create `package.json` in that folder:

   ```json
   {
     "private": true
   }
   ```
4. Install this package calling the command in test folder:

   ```sh
   npm -i @logux/backend-test
   ```
5. Create test back-end server and implement [`local.js`](./local.js) behaviour:
   * Server subprotocol `1.0.0`.
   * Supports client’s subprotocols `^1.0.0`.
   * Throws an error during the authentication on `headers.errorText`.
   * Authenticates users with token `USER_ID:good`
     or with cookie `token=USER_ID:good`.
   * Allows users to subscribe to their own `users/USER_ID` channel.
   * Throws an error during the subscription on `headers.errorText`.
   * During the subscription to `users/USER_ID` channel sends
     `{ type: "users/name", payload: { userId, name } }` action with the latest
     user’s name.
   * Re-sends `users/name` action to `users/USER_ID` channel.
   * Throws an error during the action access check on `headers.errorText`.
   * Saves new user’s name on `users/name` only on bigger action time.
   * Throws an error on `error` action.
   * On `users/clean` action set all names to `""` and sends `users/name` action
     with new name to all clients.
6. Start your back-end server.
7. Call `npx @logux/backend-test` with URL to your back-end server.

   ```sh
   npx @logux/backend-test http://localhost:3000/logux
   ```
