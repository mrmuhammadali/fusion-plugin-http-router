// @flow
import type {Context} from 'fusion-core';
import {Options} from 'koa-bodyparser';

import {BodyParserOptionsToken, HttpHandlersToken} from './tokens';

export type DepsObjectType = {
  bodyParserOptions: Options,
  handlers: HandlersType,
};

export type DepsType = {
  bodyParserOptions: typeof BodyParserOptionsToken,
  handlers: typeof HttpHandlersToken,
};

export type HandlersType = {
  [string]: {[string]: (args: Object, ctx: Context) => any},
};

export type ServiceType = {
  from: (ctx: Context) => null | Function,
};
