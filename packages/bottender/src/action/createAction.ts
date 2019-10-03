import Context from '../context/Context';

import { BOTTENDER_ACTION_TYPE } from './BottenderSymbols';

export type Action = {
  $$typeof: symbol;
  func: FunctionAction;
  props: Record<string, any>;
};

export type FunctionAction = (
  context: Context,
  props: Record<string, any>
) => Action | FunctionAction | void | Promise<Action | FunctionAction | void>;

export default function createAction(
  func: FunctionAction,
  props: Record<string, any>
): Action {
  return {
    $$typeof: BOTTENDER_ACTION_TYPE,
    func,
    props,
  };
}
