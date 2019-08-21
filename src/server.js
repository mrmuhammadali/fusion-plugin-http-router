// @flow
/* eslint-env node */
import bodyParser from 'koa-bodyparser';
import {createPlugin, memoize, type Context} from 'fusion-core';
import {matchPath} from 'react-router';

import {BodyParserOptionsToken, HTTPHandlersToken} from './tokens';
import type {HandlersType, ServiceType} from './types';

export function getHttpHandler(
  currentPath: string,
  method: string,
  paths: string[],
  handlers: HandlersType
): [Object, Function] | [] {
  const {path, params = {}, isExact} =
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

const plugin =
  __NODE__ &&
  createPlugin({
    deps: {
      bodyParserOptions: BodyParserOptionsToken.optional,
      handlers: HTTPHandlersToken,
    },

    provides: ({handlers, bodyParserOptions}) => {
      if (!handlers || typeof handlers !== 'object') {
        throw new Error(
          'Missing/incorrect handlers registered to HTTPHandlersToken'
        );
      }

      const parseBody = bodyParser(bodyParserOptions);
      const paths = Object.keys(handlers);
      const from = memoize(async ctx => {
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

    middleware: (deps, service: ServiceType) => async (ctx: Context, next) => {
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
