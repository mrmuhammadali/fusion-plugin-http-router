// @flow
import type {Context} from 'fusion-core';

import type {HandlersType, PatternedPath} from '../types';
import {matchPath, type Match} from './pathUtils';

const methods = new Set([
  'CONNECT',
  'DELETE',
  'GET',
  'HEAD',
  'OPTIONS',
  'PATCH',
  'POST',
  'PUT',
  'TRACE',
]);

function dive(currentKey: string, into: Object, target: Object) {
  Object.keys(into).forEach((key: string) => {
    if (methods.has(key.toUpperCase())) {
      target[currentKey] = Object.keys(into).reduce(
        (final: Object, key: string) => {
          if (methods.has(key.toUpperCase())) {
            return {...final, [key.toUpperCase()]: into[key]};
          }

          return final;
        },
        {...target[currentKey]}
      );
    } else {
      let newKey = key;
      const newVal = into[key];

      if (currentKey.length > 0) {
        newKey = currentKey + key;
      }

      if (newVal instanceof Object) {
        dive(newKey, newVal, target);
      } else {
        target[newKey] = newVal;
      }
    }
  });
}

export function flattenHandlers(handlers: Object): HandlersType {
  const flatHandlers = {};
  dive('', handlers, flatHandlers);

  return flatHandlers;
}

export function getHandler(
  ctx: Context,
  paths: PatternedPath[],
  handlers: HandlersType
): {handler?: Function, match: Match} {
  const match: Match = matchPath(ctx.path, paths);
  const handler = handlers[match.path] && handlers[match.path][ctx.method];

  return match.isExact ? {handler, match} : {match: {}};
}

export function findInvalidPath(handlers: Object): string {
  function findInvalidMethod(path: string): string | typeof undefined {
    return Object.keys(handlers[path]).find(
      method => typeof handlers[path][method] !== 'function'
    );
  }

  const paths = Object.keys(handlers);
  const invalidPath = paths.find(path => {
    if (handlers[path] instanceof Object) {
      return findInvalidMethod(path);
    }

    return true;
  });

  if (invalidPath) {
    const invalidMethod = findInvalidMethod(invalidPath);

    return invalidMethod
      ? `method "${invalidMethod}" of path "${invalidPath}"`
      : `path "${invalidPath}"`;
  }

  return '';
}
