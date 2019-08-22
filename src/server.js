// @flow
/* eslint-env node */
import bodyParser from 'koa-bodyparser';
import {
  createPlugin,
  memoize,
  type Context,
  type FusionPlugin,
} from 'fusion-core';
import {match, matchPath} from 'react-router';

import {BodyParserOptionsToken, HttpHandlersToken} from './tokens';
import type {
  DepsObjectType,
  DepsType,
  HandlersType,
  ServiceType,
} from './types';

export function getHttpHandler(
  currentPath: string,
  method: string,
  paths: string[],
  handlers: HandlersType
): [Function, Object] | Array<any> {
  const {path, params = {}, isExact}: match<Object> =
    matchPath(currentPath, {
      path: paths,
    }) || {};

  const handler = handlers[path] && handlers[path][method];

  if (path && handler && isExact) {
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

  provides: ({handlers, bodyParserOptions}: DepsObjectType): ServiceType => {
    if (!handlers || typeof handlers !== 'object') {
      throw new Error(
        'Missing/incorrect handlers registered to HttpHandlersToken'
      );
    }

    const parseBody = bodyParser(bodyParserOptions);
    const paths: string[] = Object.keys(handlers);
    const from = memoize(async (ctx: Context): Function | null => {
      const {path, method, query} = ctx;
      const [handler, params] = getHttpHandler(path, method, paths, handlers);

      if (typeof handler !== 'function') {
        return null;
      }

      await parseBody(ctx, () => Promise.resolve());
      return () => handler({...params, ...query, ...ctx.request.body}, ctx);
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
        ctx.body = await handler();
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
