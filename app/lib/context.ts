import {createHydrogenContext} from '@shopify/hydrogen';
import {AppSession} from '~/lib/session.server';
import {CART_QUERY_FRAGMENT} from '~/data/fragments';

/**
 * The context implementation used in this template is the new RR 7.9.x
 * context implementation. It is a breaking change from the previous context
 * implementation and is not backwards compatible.
 */

export async function createHydrogenRouterContext(
  request: Request,
  env: Env,
  executionContext: ExecutionContext,
) {
  /**
   * Open a cache instance in the worker and a custom session instance.
   */
  if (!env?.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }

  const waitUntil = executionContext.waitUntil.bind(executionContext);
  const [cache, session] = await Promise.all([
    caches.open('hydrogen'),
    AppSession.init(request, [env.SESSION_SECRET]),
  ]);

  const hydrogenContext = createHydrogenContext({
    env,
    request,
    cache,
    waitUntil,
    session,
    i18n: {language: 'EN', country: 'US'},
    cart: {
      queryFragment: CART_QUERY_FRAGMENT,
    },
  });

  return hydrogenContext;
}
