// @flow
import test from 'tape-cup';

import Plugin from '../index';

test('browser exports null', t => {
  t.deepEqual(Plugin, null);
  t.end();
});
