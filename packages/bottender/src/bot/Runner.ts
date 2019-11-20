// -> http request
// -> connector.preprocess
//   -> signature verification
//   -> webhook verification
// -> connector.createRequestHandler
//   -> requestHandler
//     -> send request into queue
//     -> sync: execute runner directly
//     -> async: create a runner listen to queue

// Q: How to run receiver and runner?
// bottender start --receiver
// bottender start --runner

export function run<C extends Client, E extends Event>(
  action: Action<C, E>
): Action<C, E> {
  return async function Run(
    context: Context<C, E>,
    props: Props<C, E> = {}
  ): Promise<void> {
    let nextDialog: Action<C, E> | void = action;

    // TODO: refactor this with withProps or whatever
    debugDialog(`Current Dialog: ${nextDialog.name || 'Anonymous'}`);
    // eslint-disable-next-line no-await-in-loop
    nextDialog = await nextDialog(context, props);

    while (typeof nextDialog === 'function') {
      // TODO: improve this debug helper
      debugDialog(`Current Dialog: ${nextDialog.name || 'Anonymous'}`);
      // eslint-disable-next-line no-await-in-loop
      nextDialog = await nextDialog(context, {});
    }

    return nextDialog;
  };
}

class Runner {
  constructor({ queue }) {
    this._queue = queue;
  }

  async start() {
    // listen to queue
    while (true) {
      const item = this._queue.pop();

      await run(body, requestContext);
    }
  }
}

export default Runner;
