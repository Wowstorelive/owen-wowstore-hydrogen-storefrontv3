import type {AppLoadContext, EntryContext} from '@shopify/remix-oxygen';
import {RemixServer} from '@remix-run/react';
import isbot from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';
import {createInstance} from 'i18next';
import {I18nextProvider, initReactI18next} from 'react-i18next';
import type {HttpBackendOptions} from 'i18next-http-backend';

import i18next from './i18next.server';
import i18n from './i18n';
import {defaultLng, supportedLngs, lngResources} from 'languages.config';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  context: AppLoadContext,
) {
  const instance = createInstance();
  const url = new URL(request.url);
  let lng = defaultLng;
  supportedLngs.map((item: any) => {
    if (url.pathname.startsWith('/' + item)) {
      lng = item;
    }
    return lng;
  });

  const ns = i18next.getRouteNamespaces(remixContext);

  await instance
    .use(initReactI18next) // Tell our instance to use react-i18next
    .init<HttpBackendOptions>({
      ...i18n, // spread the configuration
      lng, // The locale we detected above
      ns, // The namespaces the routes about to render wants to use
      resources: lngResources,
    });

  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    defaultSrc: [
      'localhost:*',
      "'self'",
      "'unsafe-inline'",
      '*.shopify.com',
      '*.sanity.io',
      '*.jsdelivr.net',
      '*.tawk.to',
      'firebasestorage.googleapis.com',
      'snapwidget.com',
      '*.google.com',
      '*.youtube.com',
      '*.vimeo.com',
    ],
    scriptSrc: [
      'localhost:*',
      "'self'",
      "'unsafe-inline'",
      '*.shopify.com',
      '*.jsdelivr.net',
      '*.tawk.to',
      'snapwidget.com',
      '*.googleapis.com'
    ],
    styleSrc: [
      'localhost:*',
      "'self'",
      "'unsafe-inline'",
      '*.shopify.com',
      '*.jsdelivr.net',
      '*.tawk.to',
      '*.googleapis.com',
      '*.gstatic.com'
    ],
    mediaSrc: [
      '*.shopify.com',
      `${context.env.PUBLIC_STORE_DOMAIN}`
    ],
    imgSrc: [
      'localhost:*',
      "'self'",
      'data:',
      'blob:',
      '*.shopify.com',
      '*.sanity.io',
      '*.tawk.to',
      '*.jsdelivr.net',
      'firebasestorage.googleapis.com',
      '*.ytimg.com',
      '*.vimeocdn.com',
      '*.googleapis.com',
      '*.gstatic.com'
    ],
    fontSrc: [
      'localhost:*',
      "'self'",
      "'unsafe-inline'",
      '*.shopify.com',
      '*.tawk.to',
      '*.jsdelivr.net',
      '*.gstatic.com'
    ],
    connectSrc: [
      '*.googleapis.com',
      '*.firebaseio.com',
      'api.distancematrix.ai',
      'wss://e282-222-252-30-89.ngrok-free.app:*'
    ]
  });

  const body = await renderToReadableStream(
    <I18nextProvider i18n={instance}>
      <NonceProvider>
        <RemixServer context={remixContext} url={request.url} />
      </NonceProvider>
    </I18nextProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        // eslint-disable-next-line no-console
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
