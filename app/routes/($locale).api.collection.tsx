import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import type {Collection as CollectionType} from '@shopify/hydrogen/storefront-api-types';
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

  const id = searchParams.get('id') ?? '';
  const sortKey = searchParams.get('sortKey') ?? 'CREATED';

  let pageBy = 4;
  try {
    const _count = searchParams.get('pageBy');
    if (typeof _count === 'string') {
      pageBy = parseInt(_count);
    }
  } catch (_) {
    // noop
  }

  const {collection} = await storefront.query<{
    collection: CollectionType;
  }>(COLLECTION_QUERY, {
    variables: {
      id,
      pageBy,
      sortKey,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
    cache: storefront.CacheLong(),
  });

  invariant(collection, 'No data returned from top products query');

  return json({collection});
}

const COLLECTION_QUERY = `#graphql
  query ApiCollection(
    $id: ID!
    $country: CountryCode
    $language: LanguageCode
    $pageBy: Int!
    $sortKey: ProductCollectionSortKeys!
  ) @inContext(country: $country, language: $language) {
    collection(id: $id) {
      id
      handle
      title
      image {
        id
        url
        width
        height
        altText
      }
      products(first: $pageBy, sortKey: $sortKey) {
        nodes {
          ...ProductCard
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

// no-op
export default function ProductsApiRoute() {
  return null;
}
