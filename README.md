# fusion-plugin-http-router

Register and handle Http routes in a fusion app.

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
import HttpRouter, {
  HttpRouterToken,
  HttpHandlersToken,
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

  app.register(HttpRouterToken, HttpRouter);
  app.register(HttpHandlersToken, handlers)

  return app;
};
```

---

### API

#### Registration API

##### `HttpRouter`

```js
import HttpRouter from 'fusion-plugin-http-router'
```

The HttpRouter plugin. Registers http routes and handlers.

##### `HttpRouterToken`

```js
import { HttpRouterToken } from 'fusion-plugin-http-router'
```

The canonical token for the HttpRouter plugin. Typically, it should be registered with
the HttpRouter plugin.

#### Dependencies

##### `HttpHandlersToken`

```js
import { HttpHandlersToken } from 'fusion-plugin-http-router'
```

Configures what http Router handlers exist. Required. Server-only.

###### Types

```flow
type HttpHandlers = Object<Object<string, () => any>>
```

You can register a value of type `HttpHandlers` or a Plugin that provides a value
of type `HttpHandlers`.
