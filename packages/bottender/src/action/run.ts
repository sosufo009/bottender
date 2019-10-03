import debug from 'debug';

import Context from '../context/Context';

import isAction from './isAction';
import { Action, FunctionAction } from './createAction';

const debugDialog = debug('bottender:dialog');

export default function run(fn: FunctionAction): FunctionAction {
  return async function Run(context: Context): Promise<void> {
    let nextDialog: FunctionAction | Action | void = fn;

    do {
      let func: FunctionAction;
      let props = {};
      if (isAction(nextDialog)) {
        props = ((nextDialog as any) as Action).props;
        func = ((nextDialog as any) as Action).func;
      } else {
        func = nextDialog as FunctionAction;
      }
      // TODO: improve this debug helper
      debugDialog(`Current Dialog: ${func.name || 'Anonymous'}`);

      nextDialog = await func(context, props);
    } while (typeof nextDialog === 'function' || isAction(nextDialog));
  };
}
