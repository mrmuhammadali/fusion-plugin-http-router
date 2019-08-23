// @flow
import pathToRegexp from 'path-to-regexp';

export type Match = {
  isExact: boolean,
  path: string,
  params: {},
};

function matchUri(url: string, path: string): Match {
  const keys = [];
  const pattern: RegExp = pathToRegexp(path, keys);
  const match: string[] | null = pattern.exec(url);

  if (!match) {
    return {isExact: false, params: {}, path: ''};
  }

  const values = match.slice(1);
  const params = keys.reduce(
    (final, {name}, index) => ({...final, [name]: values[index]}),
    {}
  );

  return {isExact: true, params, path};
}

export default function matchPath(
  url: string,
  paths: string[] | string
): Match {
  if (typeof paths === 'string') {
    return matchUri(url, paths);
  }

  return paths.reduce(
    (final, path) => {
      const match = matchUri(url, path);

      if (!match.isExact) {
        return final;
      }

      return match;
    },
    {isExact: false, params: {}, path: ''}
  );
}
