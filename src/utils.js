// @flow
import {matchPath} from 'fusion-plugin-react-router';

export function getMatchedPath(currentPath: string, routes: Object) {
  const paths = Object.keys(routes);
  const matchedPath = paths.find(path => {
    const {isExact} = matchPath(currentPath, path) || {};

    return isExact;
  });

  return matchedPath;
}

export function ms() {
  const [seconds, ns] = process.hrtime();
  return Math.round(seconds * 1000 + ns / 1e6);
}
