// @flow
/* eslint-env node */
import bodyParser from 'koa-body';
import {
  createPlugin,
  memoize,
  type Context,
  type FusionPlugin,
} from 'fusion-core';

import {BodyParserOptionsToken, HttpHandlersToken} from './tokens';
import type {
  DepsObjectType,
  DepsType,
  HandlersType,
  ServiceType,
} from './types';
import flatten from './utils/flatten';
import matchPath, {type Match} from './utils/matchPath';

export function getHttpHandler(
  currentPath: string,
  method: string,
  paths: string[],
  handlers: HandlersType
): [Function, Object] | Array<any> {
  const {path, params, isExact}: Match = matchPath(currentPath, paths);
  const handler = handlers[path] && handlers[path][method];

  if (handler && isExact) {
    if (typeof handler !== 'function') {
      throw new Error(
        `Missing/incorrect handler registered to ${method} of ${path}.`
      );
    }

    return [handler, params];
  }

  return [];
}

const plugin: FusionPlugin<DepsType, ServiceType> = createPlugin({
  deps: {
    bodyParserOptions: BodyParserOptionsToken.optional,
    handlers: HttpHandlersToken,
  },

  provides: (deps: DepsObjectType): ServiceType => {
    const {handlers, bodyParserOptions = {}} = deps;

    if (!handlers || typeof handlers !== 'object') {
      throw new Error(
        'Missing/incorrect handlers registered to HttpHandlersToken'
      );
    }

    const flatHandlers = flatten(handlers);
    const parseBody = bodyParser({...bodyParserOptions, multipart: true});
    const paths: string[] = Object.keys(flatHandlers);
    const from = memoize(async (ctx: Context): Function | null => {
      const {path, method, query} = ctx;
      const [handler, params] = getHttpHandler(
        path,
        method,
        paths,
        flatHandlers
      );

      if (typeof handler !== 'function') {
        return null;
      }

      await parseBody(ctx, () => Promise.resolve());
      const {body, files = {}} = ctx.request;

      return (...args) => handler({params, query, body, files}, ...args);
    });

    return {from};
  },

  middleware: (deps: DepsObjectType, service: ServiceType) => async (
    ctx: Context,
    next: () => Promise<any>
  ) => {
    try {
      const handler = await service.from(ctx);

      if (typeof handler === 'function') {
        ctx.body = await handler(ctx);
      }
    } catch (error) {
      ctx.body = {
        status: 'failure',
        data: {
          code: error.code,
          message: error.message,
          stack: error.stack,
          meta: error.meta,
        },
      };
    }

    return next();
  },
});

export default plugin;
