// @flow
import pathToRegexp from 'path-to-regexp';

import type {PatternedPath} from '../types';

export type Match = {
  isExact: boolean,
  params: {},
  path: string,
};

function matchUri(url: string, patternedPath: PatternedPath): Match {
  const {path, keys, pattern} = patternedPath;
  const match: string[] | null = pattern.exec(url);

  if (!match) {
    return {isExact: false, params: {}, path};
  }

  const values = match.slice(1);
  const params = keys.reduce(
    (final, name, index) => ({...final, [name]: values[index]}),
    {}
  );

  return {isExact: true, params, path};
}

export function matchPath(
  url: string,
  paths: PatternedPath[] | PatternedPath
): Match {
  if (!(paths instanceof Array)) {
    return matchUri(url, paths);
  }

  return paths.reduce(
    (final, path) => {
      const match = matchUri(url, path);

      if (match.isExact && !final.isExact) {
        return match;
      }

      return final;
    },
    {isExact: false, params: {}, path: ''}
  );
}

export function getPatternedPaths(paths: string[]): PatternedPath[] {
  return paths.map(path => {
    const keys = [];
    const pattern: RegExp = pathToRegexp(path, keys);

    return {path, pattern, keys: keys.map(({name}) => name)};
  });
}
