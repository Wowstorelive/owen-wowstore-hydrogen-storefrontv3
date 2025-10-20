import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getLocaleFromRequest} from '~/lib/utils';

export async function action({
  request,
  context: {storefront},
}: LoaderFunctionArgs) {
  const [payload]: any = await Promise.all([request.json()]);
  const {search} = payload;
  const headerURL = {
    url: request.headers.get('Referer'),
  };
  const locale = getLocaleFromRequest(headerURL);

  const [products] = await Promise.all([
    storefront.query(SEARCH_QUERY, {
      variables: {
        query: search,
        first: 5,
        endCursor: null,
        country: locale.country,
        language: locale.language,
      },
    }),
  ])

  return {...products};
}

const SEARCH_QUERY = `#graphql
  query PaginatedProductsSearch(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $query: String
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor,
      sortKey: RELEVANCE,
      query: $query
    ) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
