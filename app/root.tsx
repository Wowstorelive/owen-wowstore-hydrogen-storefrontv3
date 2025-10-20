import {
  defer,
  type LinksFunction,
  type LoaderFunctionArgs,
  type AppLoadContext,
  type MetaArgs,
} from '@shopify/remix-oxygen';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
  useRouteError,
  type ShouldRevalidateFunction,
} from '@remix-run/react';
import {
  useNonce,
  Analytics,
  getShopAnalytics,
  getSeoMeta,
  type SeoConfig,
} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';
import groq from 'groq';
import {toast, Toaster, ToastBar} from 'react-hot-toast';
import {useChangeLanguage} from 'remix-i18next';
import {useTranslation} from 'react-i18next';

import {IconClose} from '~/components/elements/Icon';
import {NewsletterPopup} from '~/components/elements/NewsletterPopup';

// import {LayoutDefault as PageLayout} from '~/components/layouts/default/Layout';
// Comment LayoutDefault above then uncomment one of their layouts below if you want to use another layout.
// import {LayoutAutumn as PageLayout} from '~/components/layouts/autumn/Layout';
// import {LayoutSpring as PageLayout} from '~/components/layouts/spring/Layout';
// import {LayoutSummer as PageLayout} from '~/components/layouts/summer/Layout';
import {LayoutWinter as PageLayout} from '~/components/layouts/winter/Layout';
import {SANITY_SETTINGS} from '~/data/sanity/settings';
import {MAIN_MENU} from '~/data/sanity/menu';
import {COLOR_THEME} from '~/data/sanity/colorTheme';
import {ColorTheme} from '~/components/ColorTheme';
import favicon from '~/assets/favicon.svg';
import {GenericError} from '~/components/GenericError';
import {NotFound} from '~/components/NotFound';
import {seoPayload} from '~/lib/seo.server';
import styles from '~/styles/app.css?url';

import {DEFAULT_LOCALE} from './lib/utils';

import {StoreContextProvider} from '~/components/global/StoreContext';
import {LiveChat} from '~/components/global/LiveChat';
import config from 'theme.config';
export type RootLoader = typeof loader;

// This is important to avoid re-fetching root queries on sub-navigations
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') {
    return true;
  }

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) {
    return true;
  }

  return false;
};

export const links: LinksFunction = () => {
  return [
    {rel: 'stylesheet', href: styles},
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return defer({
    ...deferredData,
    ...criticalData,
  });
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({request, context}: LoaderFunctionArgs) {
  const {storefront, env} = context;

  const lang = storefront.i18n.language.toLowerCase();
  let currencyCode = context.storefront.i18n.currency || 'USD';

  const sanityQuery = groq`
    {
      'settings': *[_type == "settings" && language == "${lang}"] {${SANITY_SETTINGS}},
      'menu': *[_type == "menu" && language == "${lang}"] {${MAIN_MENU}} | order(position),
      'colorTheme': *[_type == "colorTheme"] {${COLOR_THEME}}
    }
  `;

  const [layout, sanityData] = await Promise.all([
    getLayoutData(context),
    context.sanity.fetch(sanityQuery),
  ]);

  const seo = seoPayload.root({shop: layout.shop, url: request.url});

  return {
    layout,
    seo,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: true,
      // localize the privacy banner
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
    selectedLocale: storefront.i18n,
    sanityData,
    locale: lang,
    currencyCode,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  const {cart, customerAccount} = context;

  return {
    isLoggedIn: customerAccount.isLoggedIn(),
    cart: cart.get(),
  };
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return getSeoMeta(data!.seo as SeoConfig);
};

function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();
  const data = useRouteLoaderData<typeof loader>('root');
  const locale = data?.selectedLocale ?? DEFAULT_LOCALE;
  const {i18n} = useTranslation();
  useChangeLanguage(data.locale);

  return (
    <html lang={data.locale} dir={i18n.dir()}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="msvalidate.01" content="A352E6A0AF9A652267361BBB572B8468" />
        <Meta />
        <Links />
        <link rel="icon" type="image/svg+xml" href={data?.sanityData?.settings[0]?.header?.favicon?.url ?? favicon} />
      </head>
      <body className="body-style">
        {data ? (
          <Analytics.Provider
            cart={data.cart}
            shop={data.shop}
            consent={data.consent}
          >
            <StoreContextProvider>
              <PageLayout
                key={`${locale.language}-${locale.country}`}
                layout={data.layout}
                sanityData={data.sanityData}
              >
                {children}
              </PageLayout>
              {data?.sanityData?.colorTheme?.length > 0 && (
                <ColorTheme colorTheme={data?.sanityData?.colorTheme[0]} />
              )}
            </StoreContextProvider>
            {(config.tawkPropertyId && config.tawkWidgetId) && (
              <LiveChat propertyId={config.tawkPropertyId} widgetId={config.tawkWidgetId} />
            )}

            {data.sanityData &&
              data.sanityData?.settings[0]?.newsletter?.showPopup === true && (
                <NewsletterPopup
                  settings={data.sanityData?.settings[0]?.newsletter}
                />
              )}
            <Toaster
              position="bottom-center"
              reverseOrder={false}
              toastOptions={{
                style: {
                  width: '100%',
                  textAlign: 'left',
                  justifyContent: 'start',
                  padding: '15px',
                },
              }}
            >
              {(t: any) => (
                <ToastBar toast={t}>
                  {({icon, message} : {icon: any; message: string}) => (
                    <>
                      {icon}
                      {message}
                      {t.type !== 'loading' && (
                        <button
                          onClick={() => toast.dismiss(t.id)}
                          className="bg-gray-100 rounded p-2"
                        >
                          <IconClose className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                </ToastBar>
              )}
            </Toaster>
            {data.sanityData && data.sanityData?.settings[0]?.embedCode && (
              <div
                dangerouslySetInnerHTML={{
                  __html: data.sanityData?.settings[0]?.embedCode,
                }}
              />
            )}
          </Analytics.Provider>
        ) : (
          children
        )}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export function ErrorBoundary({error}: {error: Error}) {
  const routeError = useRouteError();
  const isRouteError = isRouteErrorResponse(routeError);

  let title = 'Error';
  let pageType = 'page';

  if (isRouteError) {
    title = 'Not found';
    if (routeError.status === 404) pageType = routeError.data || pageType;
  }

  return (
    <Layout>
      {isRouteError ? (
        <>
          {routeError.status === 404 ? (
            <NotFound type={pageType} />
          ) : (
            <GenericError
              error={{message: `${routeError.status} ${routeError.data}`}}
            />
          )}
        </>
      ) : (
        <GenericError error={error instanceof Error ? error : undefined} />
      )}
    </Layout>
  );
}

const LAYOUT_QUERY = `#graphql
  query layout(
    $language: LanguageCode
  ) @inContext(language: $language) {
    shop {
      ...Shop
    }
  }
  fragment Shop on Shop {
    id
    name
    description
    primaryDomain {
      url
    }
    brand {
      logo {
        image {
          url
        }
      }
    }
  }
` as const;

async function getLayoutData({storefront}: AppLoadContext) {
  const data = await storefront.query(LAYOUT_QUERY, {
    variables: {
      language: storefront.i18n.language,
    },
  });

  invariant(data, 'No data returned from Shopify API');

  return {shop: data.shop};
}
