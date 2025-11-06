// Virtual entry point for the app
import * as remixBuild from 'virtual:remix/server-build';
import {
  createRequestHandler,
  getStorefrontHeaders,
} from '@shopify/remix-oxygen';
import {
  cartGetIdDefault,
  cartSetIdDefault,
  createCartHandler,
  createStorefrontClient,
  storefrontRedirect,
  createCustomerAccountClient,
} from '@shopify/hydrogen';

import {AppSession} from '~/lib/session.server';
import {getLocaleFromRequest} from '~/lib/utils';
import {createAdminClient} from '~/lib/adminClient';

export default {
  async fetch(
    request: Request,
    env: Env,
    executionContext: ExecutionContext,
  ): Promise<Response> {
    try {
      const waitUntil = (p: Promise<any>) => executionContext.waitUntil(p);
      const [cache, session] = await Promise.all([
        caches.open('hydrogen'),
        AppSession.init(request, [env.SESSION_SECRET]),
      ]);

      const handleRequest = createRequestHandler({
        build: remixBuild,
        mode: process.env.NODE_ENV,
        getLoadContext: () => ({
          session,
          waitUntil,
          storefront: createStorefrontClient({
            cache,
            waitUntil,
            i18n: getLocaleFromRequest(request),
            publicStorefrontToken: env.PUBLIC_STOREFRONT_API_TOKEN,
            privateStorefrontToken: env.PRIVATE_STOREFRONT_API_TOKEN,
            storeDomain: env.PUBLIC_STORE_DOMAIN,
            storefrontId: env.PUBLIC_STOREFRONT_ID,
            storefrontHeaders: getStorefrontHeaders(request),
          }),
          admin: createAdminClient({
            privateAdminToken: env.PRIVATE_ADMIN_API_TOKEN,
            storeDomain: env.PUBLIC_STORE_DOMAIN,
            adminApiVersion: env.PRIVATE_ADMIN_API_VERSION || '2024-10',
          }),
          customerAccount: createCustomerAccountClient({
            waitUntil,
            request,
            session,
            customerAccountId: env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID,
            customerAccountUrl: env.PUBLIC_CUSTOMER_ACCOUNT_API_URL,
          }),
          cart: createCartHandler({
            storefront: createStorefrontClient({
              cache,
              waitUntil,
              i18n: getLocaleFromRequest(request),
              publicStorefrontToken: env.PUBLIC_STOREFRONT_API_TOKEN,
              privateStorefrontToken: env.PRIVATE_STOREFRONT_API_TOKEN,
              storeDomain: env.PUBLIC_STORE_DOMAIN,
              storefrontId: env.PUBLIC_STOREFRONT_ID,
              storefrontHeaders: getStorefrontHeaders(request),
            }),
            getCartId: cartGetIdDefault(request.headers),
            setCartId: cartSetIdDefault(),
            cartQueryFragment: CART_QUERY_FRAGMENT,
          }),
          env,
        }),
      });

      const response = await handleRequest(request);

      if (response.status === 404) {
        return storefrontRedirect({request, response, storefront: createStorefrontClient({
          cache,
          waitUntil,
          i18n: getLocaleFromRequest(request),
          publicStorefrontToken: env.PUBLIC_STOREFRONT_API_TOKEN,
          privateStorefrontToken: env.PRIVATE_STOREFRONT_API_TOKEN,
          storeDomain: env.PUBLIC_STORE_DOMAIN,
          storefrontId: env.PUBLIC_STOREFRONT_ID,
          storefrontHeaders: getStorefrontHeaders(request),
        })});
      }

      return response;
    } catch (error) {
      console.error(error);
      return new Response('An unexpected error occurred', {status: 500});
    }
  },
};

interface Env {
  SESSION_SECRET: string;
  PUBLIC_STOREFRONT_API_TOKEN: string;
  PRIVATE_STOREFRONT_API_TOKEN: string;
  PUBLIC_STORE_DOMAIN: string;
  PUBLIC_STOREFRONT_ID: string;
  PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID: string;
  PUBLIC_CUSTOMER_ACCOUNT_API_URL: string;
  PRIVATE_ADMIN_API_TOKEN: string;
  PRIVATE_ADMIN_API_VERSION: string;
}

const CART_QUERY_FRAGMENT = `#graphql
  fragment Money on MoneyV2 {
    currencyCode
    amount
  }
  fragment CartLine on CartLine {
    id
    quantity
    attributes {
      key
      value
    }
    cost {
      totalAmount {
        ...Money
      }
      amountPerQuantity {
        ...Money
      }
      compareAtAmountPerQuantity {
        ...Money
      }
    }
    merchandise {
      ... on ProductVariant {
        id
        availableForSale
        compareAtPrice {
          ...Money
        }
        price {
          ...Money
        }
        requiresShipping
        title
        image {
          id
          url
          altText
          width
          height
        }
        product {
          handle
          title
          id
        }
        selectedOptions {
          name
          value
        }
      }
    }
  }
  fragment CartApiQuery on Cart {
    id
    checkoutUrl
    totalQuantity
    buyerIdentity {
      countryCode
      customer {
        id
        email
        firstName
        lastName
        displayName
      }
      email
      phone
    }
    lines(first: $numCartLines) {
      edges {
        node {
          ...CartLine
        }
      }
    }
    cost {
      subtotalAmount {
        ...Money
      }
      totalAmount {
        ...Money
      }
      totalDutyAmount {
        ...Money
      }
      totalTaxAmount {
        ...Money
      }
    }
    note
    attributes {
      key
      value
    }
    discountCodes {
      code
      applicable
    }
  }
`;
