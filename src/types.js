// @flow
import type {Context} from 'fusion-core';
import {IKoaBodyOptions} from 'koa-body';

import {BodyParserOptionsToken, HttpHandlersToken} from './tokens';

export type DepsObjectType = {
  bodyParserOptions: IKoaBodyOptions,
  handlers: HandlersType,
};

export type DepsType = {
  bodyParserOptions: typeof BodyParserOptionsToken,
  handlers: typeof HttpHandlersToken,
};

export type HandlersType = {
  [string]: {[string]: (args: Object, ctx: Context) => any},
};

export type PatternedPath = {
  path: string,
  pattern: RegExp,
  keys: string[],
};

export type ServiceType = {
  from: (ctx: Context) => null | Function,
};
