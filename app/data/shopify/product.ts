import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';

export const PRODUCT_FIELDS = `#graphql
  fragment ProductFields on Product {
    handle
    id
    publishedAt
    options {
      name
      values
    }
    title
    vendor
    images(first: 3) {
      edges {
        node {
          originalSrc
          altText
        }
      }
    }
  }
`;

export const PRODUCTS_SEARCH_FILTERS_QUERY = `#graphql
  query ProductsSearch(
    $country: CountryCode
    $language: LanguageCode
    $searchTerm: String!
  ) @inContext(country: $country, language: $language) {
    search(
      first: 1,
      query: $searchTerm,
      types: PRODUCT,
    ) {
      filters: productFilters {
        id
        label
        type
        values {
          id
          label
          count
          input
        }
      }
    }
  }

` as const;

const SEARCH_QUERY = `#graphql
  query searchWithFilters(
    $searchTerm: String!
    $first: Int
    $last: Int
    $sortKey: SearchSortKeys
    $reverse: Boolean
    $startCursor: String
    $endCursor: String
    $country: CountryCode
    $language: LanguageCode
    $productFilters: [ProductFilter!]
  ) @inContext(country: $country, language: $language) {
    search(
      query: $searchTerm,
      first: $first,
      last: $last,
      sortKey: $sortKey,
      reverse: $reverse,
      before: $startCursor,
      after: $endCursor,
      productFilters: $productFilters
    ) {
      productFilters {
        id
        label
        type
        values {
          id
          label
          count
          input
        }
      }
      nodes {
        ...ProductCard
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }

  ${PRODUCT_CARD_FRAGMENT}
` as const;