import { BOTTENDER_ACTION_TYPE } from './BottenderSymbols';

export default function isAction(object: any): boolean {
  return (
    object &&
    typeof object === 'object' &&
    object.$$typeof === BOTTENDER_ACTION_TYPE
  );
}
