// @flow
import {createToken, type FusionPlugin, type Token} from 'fusion-core';

import type {DepsType, HandlersType, ServiceType} from './types';

export const HttpRouterToken: Token<
  FusionPlugin<DepsType, ServiceType>
> = createToken('HttpRouter');

export const HttpHandlersToken: Token<HandlersType> = createToken(
  'HttpHandlersToken'
);
export const BodyParserOptionsToken: Token<Object> = createToken(
  'BodyParserOptionsToken'
);
