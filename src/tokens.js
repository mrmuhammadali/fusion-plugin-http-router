/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import {createToken, type Token} from 'fusion-core';

export const HTTPRouterToken: Token<any> = createToken('HTTPRouter');

export type HandlerType = {[string]: {[string]: (...args: any) => any}};
export const HTTPHandlersToken: Token<HandlerType> = createToken(
  'HTTPHandlersToken'
);
export const BodyParserOptionsToken: Token<mixed> = createToken(
  'BodyParserOptionsToken'
);
