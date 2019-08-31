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
import type {DepsObjectType, DepsType, ServiceType} from './types';
import {
  flattenHandlers,
  getHandler,
  getInvalidPath,
} from './utils/handlerUtils';

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

    const flatHandlers = flattenHandlers(handlers);
    const paths: string[] = Object.keys(flatHandlers);
    // eslint-disable-next-line no-console
    console.log('Registered Paths:', JSON.stringify(paths, null, 2));
    const invalidPath = getInvalidPath(flatHandlers);

    if (invalidPath) {
      throw new Error(
        `One of the handlers is missing/incorrect registered against path "${invalidPath}".`
      );
    }

    const parseBody = bodyParser({...bodyParserOptions, multipart: true});

    const from = memoize(async (ctx: Context): Function | null => {
      const {path, method, query} = ctx;
      const [handler, params] = getHandler(path, method, paths, flatHandlers);

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
