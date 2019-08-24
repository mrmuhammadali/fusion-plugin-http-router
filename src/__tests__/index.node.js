// @flow
import App, {type Context} from 'fusion-core';
import {getSimulator} from 'fusion-test-utils';
import tape from 'tape-cup';

import HttpRouter, {HttpHandlersToken, HttpRouterToken} from '../index';

const handlers = {
  '/api/:id': {
    GET: params => params,
    POST: params => params,
  },
};

/* Test fixtures */
const appCreator = () => {
  const app = new App('test', el => el);
  app.register(HttpRouterToken, HttpRouter);
  app.register(HttpHandlersToken, handlers);

  return app;
};
const simulator = getSimulator(appCreator());

tape('Test GET request', async t => {
  const response: Context = await simulator.request('/api/123?search=abc');

  t.deepEqual(
    response.body,
    {params: {id: '123'}, query: {search: 'abc'}, files: {}, body: {}},
    'should do GET request'
  );
  t.end();
});

tape('Test POST request', async t => {
  const response: Context = await simulator.request('/api/123', {
    method: 'POST',
    body: {name: 'Test'},
  });

  t.deepEqual(
    response.body,
    {params: {id: '123'}, query: {}, files: {}, body: {}},
    'should do POST request'
  );

  t.end();
});

tape('Test multiple requests', async t => {
  const promise = simulator.request('/api/123?search=abc');
  const responses = await Promise.all([promise, promise, promise, promise]);
  const responseBodies = responses.map(response => response.body);

  t.deepEqual(
    responseBodies,
    responseBodies.map(() => ({
      params: {id: '123'},
      query: {search: 'abc'},
      files: {},
      body: {},
    })),
    'should do multiple requests'
  );
  t.end();
});
