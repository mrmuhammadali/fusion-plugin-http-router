// @flow
import App, {type Context} from 'fusion-core';
import {createRequestContext, getService} from 'fusion-test-utils';
import tape from 'tape-cup';

import Plugin, {HTTPHandlersToken} from '../index';

const handlers = {
  '/api/:id': {
    GET: params => params,
    POST: params => params,
  },
};

/* Test fixtures */
const appCreator = () => {
  const app = new App('test', el => el);
  app.register(HTTPHandlersToken, handlers);

  return () => app;
};

tape('Test plugin', async t => {
  const getCtx: Context = createRequestContext('/api/123?query=abc');
  const postCtx: Context = createRequestContext('/api/123', {
    method: 'POST',
    body: {name: 'Test'},
  });
  const service = getService(appCreator(), Plugin);

  if (!Plugin.middleware) {
    t.end();
    return;
  }

  await Plugin.middleware(null, service)(getCtx, () => Promise.resolve());
  await Plugin.middleware(null, service)(postCtx, () => Promise.resolve());

  t.deepEqual(getCtx.body, {id: '123', query: 'abc'}, 'should do GET request');
  t.deepEqual(
    postCtx.body,
    {id: '123', name: 'Test'},
    'should do POST request'
  );

  t.end();
});
