import Context from '../context/Context';
import { Action, Client, Event, Props } from '../types';
import { PlatformContext } from '../context/PlatformContext';

type MatchPattern = string | Array<string> | RegExp;

type RoutePattern<C extends Client, E extends Event> =
  | '*'
  | RoutePredicate<C, E>;

type RoutePredicate<C extends Client, E extends Event> = (
  context: Context<C, E> | PlatformContext
) => boolean | Record<string, any> | Promise<boolean | Record<string, any>>;

type Route<C extends Client, E extends Event> = {
  predicate: RoutePredicate<C, E>;
  action: Action<C, E>;
};

function router<C extends Client = any, E extends Event = any>(
  routes: Route<C, E>[]
) {
  return async function Router(
    context: Context<C, E>,
    props: Props<C, E> = {}
  ) {
    for (const r of routes) {
      // eslint-disable-next-line no-await-in-loop
      const match = await r.predicate(context);
      if (match) {
        const derivedProps = match && typeof match === 'object' ? match : {};

        return r.action.bind(null, context, {
          ...props,
          ...derivedProps,
        });
      }
    }

    return props.next;
  };
}

function route<C extends Client = any, E extends Event = any>(
  pattern: RoutePattern<C, E>,
  action: Action<C, E>
) {
  if (pattern === '*') {
    return {
      predicate: () => true,
      action,
    };
  }

  return {
    predicate: pattern,
    action,
  };
}

function text<C extends Client = any, E extends Event = any>(
  pattern: MatchPattern,
  action: Action<C, E>
) {
  if (typeof pattern === 'string') {
    if (pattern === '*') {
      return {
        predicate: (context: Context<C, E>) => context.event.isText,
        action,
      };
    }

    return {
      predicate: (context: Context<C, E>) => context.event.text === pattern,
      action,
    };
  }

  if (pattern instanceof RegExp) {
    return {
      predicate: (context: Context<C, E>) => {
        const match = pattern.exec(context.event.text);
        return match
          ? {
              match,
            }
          : false;
      },
      action,
    };
  }

  if (Array.isArray(pattern)) {
    return {
      predicate: (context: Context<C, E>) =>
        pattern.includes(context.event.text),
      action,
    };
  }

  return {
    predicate: () => false,
    action,
  };
}

function payload<C extends Client = any, E extends Event = any>(
  pattern: MatchPattern,
  action: Action<C, E>
) {
  if (typeof pattern === 'string') {
    if (pattern === '*') {
      return {
        predicate: (context: Context<C, E>) => context.event.isPayload,
        action,
      };
    }

    return {
      predicate: (context: Context<C, E>) => context.event.payload === pattern,
      action,
    };
  }

  if (pattern instanceof RegExp) {
    return {
      predicate: (context: Context<C, E>) => {
        const match = pattern.exec(context.event.payload);
        return match
          ? {
              match,
            }
          : false;
      },
      action,
    };
  }

  if (Array.isArray(pattern)) {
    return {
      predicate: (context: Context<C, E>) =>
        pattern.includes(context.event.payload),
      action,
    };
  }

  return {
    predicate: () => false,
    action,
  };
}

function platform<C extends Client = any, E extends Event = any>(
  pattern: MatchPattern,
  action: Action<C, E>
) {
  if (typeof pattern === 'string') {
    if (pattern === '*') {
      return {
        predicate: () => true,
        action,
      };
    }

    return {
      predicate: (context: PlatformContext) => context.platform === pattern,
      action,
    };
  }

  if (pattern instanceof RegExp) {
    return {
      predicate: (context: PlatformContext) => {
        return pattern.exec(context.platform);
      },
      action,
    };
  }

  if (Array.isArray(pattern)) {
    return {
      predicate: (context: PlatformContext) =>
        pattern.includes(context.platform),
      action,
    };
  }

  return {
    predicate: () => false,
    action,
  };
}

export default router;

export { router, route, text, payload, platform };
