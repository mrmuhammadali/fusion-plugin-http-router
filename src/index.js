// @flow
import browserPlugin from './browser';
import serverPlugin from './server';

export default __NODE__ ? serverPlugin : browserPlugin;

export {
  BodyParserOptionsToken,
  HTTPHandlersToken,
  HTTPRouterToken,
} from './tokens';
