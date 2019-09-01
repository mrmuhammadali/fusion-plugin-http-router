// @flow
import tape from 'tape-cup';

import {flattenHandlers, findInvalidPath} from '../utils/handlerUtils';

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
    findInvalidPath(output1),
    'method "PATCH" of path "/api/users/:id"',
    'should get invalid path and method'
  );
  t.deepEqual(
    findInvalidPath(output2),
    'path "/api/users0"',
    'should get invalid path'
  );
  t.deepEqual(findInvalidPath(validInput), '', 'should get empty string');
  t.end();
});
