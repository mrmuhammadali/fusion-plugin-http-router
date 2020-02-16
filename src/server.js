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
  findInvalidPath,
} from './utils/handlerUtils';
import {getPatternedPaths} from './utils/pathUtils';

function comparator(a, b) {
  const aLength = a.split(':').length;
  const bLength = b.split(':').length;

  return aLength < bLength ? -1 : 1;
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

    const flatHandlers = flattenHandlers(handlers);
    const paths: string[] = Object.keys(flatHandlers).sort(comparator);
    // eslint-disable-next-line no-console
    console.log('\x1b[36m\x1b[1m', 'Registered Paths:\x1b[0m');
    paths.forEach((path, index) => {
      const methods = Object.keys(flatHandlers[path]).join(', ');
      // eslint-disable-next-line no-console
      console.log(
        '\x1b[36m',
        `${index + 1}. ${path} -> { ${methods} }`,
        '\x1b[0m'
      );
    });

    const invalidPath = findInvalidPath(flatHandlers);

    if (invalidPath) {
      throw new Error(
        `Missing/incorrect handler registered against ${invalidPath}.`
      );
    }

    const parseBody = bodyParser({...bodyParserOptions, multipart: true});
    const patternedPaths = getPatternedPaths(paths);

    const from = memoize(async (ctx: Context): any => {
      const {query} = ctx;
      const {handler, match} = getHandler(ctx, patternedPaths, flatHandlers);

      if (typeof handler !== 'function') {
        return {handler: null, match};
      }

      await parseBody(ctx, () => Promise.resolve());
      const {body, files = {}} = ctx.request;

      return {
        handler: (...args) =>
          handler({params: match.params, query, body, files}, ...args),
        match,
      };
    });

    return {from};
  },

  middleware: (deps: DepsObjectType, service: ServiceType) => async (
    ctx: Context,
    next: () => Promise<any>
  ) => {
    try {
      const {handler} = await service.from(ctx);

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
