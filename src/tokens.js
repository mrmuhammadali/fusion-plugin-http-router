// @flow
import {createToken, type Token} from 'fusion-core';

import type {HandlersType} from './types';

export const HTTPRouterToken: Token<any> = createToken('HTTPRouter');

export const HTTPHandlersToken: Token<HandlersType> = createToken(
  'HTTPHandlersToken'
);
export const BodyParserOptionsToken: Token<Object> = createToken(
  'BodyParserOptionsToken'
);
