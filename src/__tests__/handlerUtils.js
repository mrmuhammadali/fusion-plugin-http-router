// @flow
import tape from 'tape-cup';

import {flattenHandlers, getInvalidPath} from '../utils/handlerUtils';

const mockFn = () => {};
const input1 = {
  '/api': {
    '/users': {get: mockFn, post: mockFn, '/:id': {patch: []}},
    get: mockFn,
  },
};
const output1 = {
  '/api': {GET: mockFn},
  '/api/users': {GET: mockFn, POST: mockFn},
  '/api/users/:id': {PATCH: []},
};
const input2 = {
  '/api': {'/users': [1, 2, 3], get: mockFn},
};
const output2 = {
  '/api': {GET: mockFn},
  '/api/users0': 1,
  '/api/users1': 2,
  '/api/users2': 3,
};

tape('Test flattenHandlers', async t => {
  t.deepEqual(flattenHandlers(input1), output1, 'should be equal');
  t.deepEqual(flattenHandlers(input2), output2, 'processed wrong input');
  t.deepEqual(flattenHandlers([{}]), {}, 'processed array input');
  t.end();
});

tape('Test getInvalidPath', async t => {
  const validInput = {
    '/api': {GET: mockFn},
    '/api/users': {GET: mockFn, POST: mockFn},
    '/api/users/:id': {PATCH: mockFn},
  };

  t.deepEqual(
    getInvalidPath(output1),
    '/api/users/:id',
    'should get invalid path'
  );
  t.deepEqual(
    getInvalidPath(output2),
    '/api/users0',
    'should get invalid path'
  );
  t.deepEqual(getInvalidPath(validInput), undefined, 'should get undefined');
  t.end();
});
