// @flow
/* eslint-env node */
import bodyparser from 'koa-bodyparser';
import {createPlugin, type Context} from 'fusion-core';
import {matchPath} from 'fusion-plugin-react-router';

import {BodyParserOptionsToken, HTTPHandlersToken} from './tokens';
import {getMatchedPath} from './utils';
import ResponseError from './response-error';

export default __NODE__ &&
  createPlugin({
    deps: {
      bodyParserOptions: BodyParserOptionsToken.optional,
      handlers: HTTPHandlersToken,
    },

    middleware: deps => {
      const {bodyParserOptions, handlers} = deps;
      if (!handlers)
        throw new Error('Missing handlers registered to HTTPHandlersToken');

      const parseBody = bodyparser(bodyParserOptions);

      return async (ctx: Context, next) => {
        const matchedPath = getMatchedPath(ctx.path, handlers);
        const handler =
          handlers[matchedPath] && handlers[matchedPath][ctx.method];

        if (handler) {
          const {params = {}} = matchPath(ctx.path, matchedPath) || {};
          await parseBody(ctx, () => Promise.resolve());
          try {
            ctx.body = await handler({...params, ...ctx.request.body}, ctx);
          } catch (e) {
            const error =
              e instanceof ResponseError
                ? e
                : new Error(
                    'UnknownError - Use ResponseError from fusion-plugin-http-router package for more detailed error messages'
                  );
            ctx.body = {
              status: 'failure',
              data: {
                message: error.message,
                // $FlowFixMe
                code: error.code,
                // $FlowFixMe
                meta: error.meta,
              },
            };
          }
        }

        return next();
      };
    },
  });
