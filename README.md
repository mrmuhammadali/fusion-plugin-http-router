# fusion-plugin-http-router

Register and handle HTTP routes in a fusion app.

---

### Table of contents

- [Installation](#installation)
- [Setup](#setup)
- [API](#api)
  - [Registration API](#registration-api)
  - [Dependencies](#dependencies)

---

### Installation

```
yarn add fusion-plugin-http-router
```

---

### Setup

```js
// src/main.js
import React from 'react';
import App from 'fusion-core';
import HTTPRouter, {
  HTTPRouterToken,
  HTTPHandlersToken,
} from 'fusion-plugin-http-router';

// Define your http routes and methods server side
const handlers = __NODE__ && {
  '/api/user/:id': {
    GET: async ({id}, ctx) => {
      return {some: 'data' + id};
    },
    PUT: async ({id, ...args}, ctx) => {
      return {some: 'data' + id};
    },
    DELETE: async (args, ctx) => {
      // Error Handling Example
      try {
        deleteUser();
      } catch (e) {
        const error = new Error('Failed to delete user');
        error.code = 'DELETEUSER';
        error.meta = {
          custom: 'metadata',
        };
        throw error;
      }
    },
  },
  '/api/book': {...}
};

export default () => {
  const app = new App(<div />);

  app.register(HTTPRouterToken, HTTPRouter);
  __NODE__ && app.register(HTTPHandlersToken, handlers)

  return app;
};
```

---

### API

#### Registration API

##### `HTTPRouter`

```js
import HTTPRouter from 'fusion-plugin-http-router'
```

The HTTPRouter plugin. Registers HTTP routes and handlers.

##### `HTTPRouterToken`

```js
import { HTTPRouterToken } from 'fusion-plugin-http-router'
```

The canonical token for the HTTPRouter plugin. Typically, it should be registered with
the HTTPRouter plugin.

#### Dependencies

##### `HTTPHandlersToken`

```js
import { HTTPHandlersToken } from 'fusion-plugin-http-router'
```

Configures what HTTP Router handlers exist. Required. Server-only.

###### Types

```flow
type HTTPHandlers = Object<Object<string, () => any>>
```

You can register a value of type `HTTPHandlers` or a Plugin that provides a value
of type `HTTPHandlers`.
