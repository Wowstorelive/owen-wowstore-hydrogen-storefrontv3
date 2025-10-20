import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import type {CollectionConnection} from '@shopify/hydrogen/storefront-api-types';
import invariant from 'tiny-invariant';

import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';

/**
 * Fetch a given set of products from the storefront API
 * @param count
 * @param query
 * @param reverse
 * @param sortKey
 * @returns Product[]
 * @see https://shopify.dev/api/storefront/current/queries/products
 */
export async function loader({
  request,
  context: {storefront},
}: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);

  const query = searchParams.get('query') ?? '';

  let count = 4;
  try {
    const _count = searchParams.get('count');
    if (typeof _count === 'string') {
      count = parseInt(_count);
    }
  } catch (_) {
    // noop
  }

  let limit = 4;
  try {
    const _limit = searchParams.get('limit');
    if (typeof _limit === 'string') {
      limit = parseInt(_limit);
    }
  } catch (_) {
    // noop
  }

  const {collections} = await storefront.query<{
    collections: CollectionConnection;
  }>(COLLECTIONS_QUERY, {
    variables: {
      count,
      query,
      limit,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
    cache: storefront.CacheLong(),
  });

  invariant(collections, 'No data returned from top products query');

  return json({collections});
}

const COLLECTIONS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query ApiCollections(
    $query: String
    $count: Int
    $country: CountryCode
    $language: LanguageCode
    $limit: Int!
  ) @inContext(country: $country, language: $language) {
    collections(first: $count, query: $query) {
      nodes {
        id
        handle
        title
        products(first: $limit) {
          nodes {
            ...ProductCard
          }
        }
      }
    }
  }
`;

// no-op
export default function ProductsApiRoute() {
  return null;
}
