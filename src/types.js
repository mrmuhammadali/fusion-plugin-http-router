// @flow
import type {Context} from 'fusion-core';

export type HandlersType = {
  [string]: {[string]: (args: Object, ctx: Context) => any},
};

export type ServiceType = {
  from: (ctx: Context) => undefined | Function,
};
