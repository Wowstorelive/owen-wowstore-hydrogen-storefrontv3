import {
  defer,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {Await, Form, useLoaderData} from '@remix-run/react';
import {Suspense} from 'react';
import {
  Pagination,
  getPaginationVariables,
  Analytics,
  getSeoMeta,
} from '@shopify/hydrogen';
import {useTranslation} from 'react-i18next';

import i18next from '~/i18next.server';

import {Heading, PageHeader, Section, Text} from '~/components/elements/Text';
import {Input} from '~/components/elements/Input';
import {Grid} from '~/components/elements/Grid';
import {SortFilter} from '~/components/elements/SortFilter';

import {FeaturedCollections} from '~/components/FeaturedCollections';
import {ProductCarousel} from '~/components/product/ProductCarousel';
import {ProductCard} from '~/components/cards/ProductCard';
import {PAGINATION_SIZE} from '~/lib/const';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {seoPayload} from '~/lib/seo.server';

import {
  getFeaturedData,
  type FeaturedData,
} from './($locale).featured-products';

import type {SortParam} from '~/components/elements/SortFilter';
import {Filter, SearchSortKeys} from '@shopify/hydrogen/storefront-api-types';
import {QueryRoot} from '@shopify/hydrogen/storefront-api-types';
import {ProductCardFragment} from 'storefrontapi.generated';
import {useFilter} from '~/hooks/useFilter';

export async function loader({
  request,
  context: {storefront},
}: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;
  const searchTerm = searchParams.get('q')!;
  const variables = getPaginationVariables(request, {pageBy: PAGINATION_SIZE});
  const i18n = storefront.i18n;
  const locale = i18n.language.toLowerCase();
  const t = await i18next.getFixedT(locale);
  const sortParam = searchParams.get('sort') as SortParam

  const {sortKey, reverse} = getSortValuesFromParam(sortParam);

  const {appliedFilters, filters} = await useFilter({
    searchParams,
    searchTerm,
    storefront: storefront,
  });

  const {search} = (await storefront.query(SEARCH_QUERY, {
    variables: {
      ...variables,
      searchTerm,
      productFilters: filters,
      sortKey,
      reverse,
      country: i18n.country,
      language: i18n.language,
    },
  })) as QueryRoot;

  if (!search) {
    throw new Response('search', {status: 404});
  }

  //Filter for product node return {}
  const productsExists = search.nodes.filter(
    (value) => Object.keys(value).length !== 0,
  );

  const products = {
    productFilters: search.productFilters,
    nodes: productsExists,
    pageInfo: search.pageInfo,
  };

  const shouldGetRecommendations = !searchTerm || products.nodes.length === 0;

  const seo = seoPayload.collection({
    url: request.url,
    collection: {
      id: 'search',
      title: t('page.search'),
      handle: 'search',
      descriptionHtml: t('page.searchResults'),
      description: t('page.searchResults'),
      seo: {
        title: t('page.search'),
        description: `Showing ${products?.nodes?.length} search results for "${searchTerm}"`,
      },
      metafields: [],
      products,
      updatedAt: new Date().toISOString(),
    },
  });

  return defer({
    seo,
    searchTerm,
    products,
    appliedFilters,
    noResultRecommendations: shouldGetRecommendations
      ? getNoResultRecommendations(storefront, {pageBy: PAGINATION_SIZE}, t)
      : Promise.resolve(null),
  });
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function Search() {
  const {searchTerm, products, appliedFilters, noResultRecommendations} =
    useLoaderData<typeof loader>();

  const noResults = products.nodes.length === 0;
  const {t} = useTranslation();
  return (
    <>
      <PageHeader className="mt-8 mb-12">
        <Heading as="h1" size="copy" className="opacity-0 h-0">
          {t('page.search')}
        </Heading>
        <Form method="get" className="relative flex w-full text-heading">
          <Input
            defaultValue={searchTerm}
            placeholder={t('page.search')}
            type="search"
            variant="search"
            name="q"
          />
          <button className="absolute right-0 py-2" type="submit">
            {t('page.search')}
          </button>
        </Form>
      </PageHeader>
      {!searchTerm || noResults ? (
        <NoResults
          noResults={noResults}
          recommendations={noResultRecommendations}
        />
      ) : (
        <Section className="container">
          <SortFilter
            filters={products.productFilters as Filter[]}
            appliedFilters={appliedFilters}
          >
            <Pagination connection={products}>
              {({nodes, isLoading, NextLink, PreviousLink}) => {
                const itemsMarkup = nodes.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product as ProductCardFragment}
                  />
                ));

                return (
                  <>
                    <div className="flex items-center justify-center mt-6">
                      <PreviousLink className="inline-block rounded font-medium text-center py-3 px-6 border border-primary/10 bg-contrast text-primary w-full">
                        {isLoading
                          ? t('global.loading')
                          : t('global.loadPrevious')}
                      </PreviousLink>
                    </div>
                    <Grid data-test="product-grid">{itemsMarkup}</Grid>
                    <div className="flex items-center justify-center mt-6">
                      <NextLink className="inline-block rounded font-medium text-center py-3 px-6 border border-primary/10 bg-contrast text-primary w-full">
                        {isLoading ? t('global.loading') : t('global.next')}
                      </NextLink>
                    </div>
                  </>
                );
              }}
            </Pagination>
          </SortFilter>
        </Section>
      )}
      <Analytics.SearchView data={{searchTerm, searchResults: products}} />
    </>
  );
}

function NoResults({
  noResults,
  recommendations,
}: {
  noResults: boolean;
  recommendations: Promise<null | FeaturedData>;
}) {
  const {t} = useTranslation();
  return (
    <>
      {noResults && (
        <Section className="container mb-12">
          <Text className="opacity-80">{t('page.noResults')}</Text>
        </Section>
      )}
      <Suspense>
        <Await
          errorElement={t('product.relatedError')}
          resolve={recommendations}
        >
          {(result) => {
            if (!result) return null;
            const {featuredCollections, featuredProducts} = result;

            return (
              <div className="container flex flex-col gap-12">
                <FeaturedCollections
                  title={t('global.trendingCollections')}
                  collections={featuredCollections}
                />
                <ProductCarousel
                  title={t('global.trendingProducts')}
                  products={featuredProducts?.nodes}
                  settings={{itemsPerRow: 4, limitItems: 8}}
                />
              </div>
            );
          }}
        </Await>
      </Suspense>
    </>
  );
}

export async function getNoResultRecommendations(
  storefront: LoaderFunctionArgs['context']['storefront'],
  variables: {pageBy?: number} = {},
) {

  return getFeaturedData(storefront, variables);
}

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

function getSortValuesFromParam(sortParam: SortParam | null): {
  sortKey: SearchSortKeys;
  reverse: boolean;
} {
  switch (sortParam) {
    case 'price-high-low':
      return {
        sortKey: 'PRICE',
        reverse: true,
      };
    case 'price-low-high':
      return {
        sortKey: 'PRICE',
        reverse: false,
      };
    case 'featured':
      return {
        sortKey: 'RELEVANCE',
        reverse: false,
      };
    default:
      return {
        sortKey: 'RELEVANCE',
        reverse: false,
      };
  }
}
