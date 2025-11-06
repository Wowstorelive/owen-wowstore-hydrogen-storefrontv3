import {useEffect} from 'react';
import {
  json,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {useLoaderData, useNavigate} from '@remix-run/react';
import {useInView} from 'react-intersection-observer';
import type {
  Filter,
  ProductCollectionSortKeys,
} from '@shopify/hydrogen/storefront-api-types';
import {
  Pagination,
  flattenConnection,
  getPaginationVariables,
  Analytics,
  getSeoMeta,
} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';
// import groq from 'groq'; // TODO: Removed Sanity CMS - using custom CMS
import {useTranslation} from 'react-i18next';

import i18next from '~/i18next.server';

import {PageHeader, Section, Text} from '~/components/elements/Text';
import {SortFilter} from '~/components/elements/SortFilter';
import {Button} from '~/components/elements/Button';
import {Grid} from '~/components/elements/Grid';

import {ProductCard} from '~/components/cards/ProductCard';

import {PAGINATION_SIZE} from '~/lib/const';
import {routeHeaders} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';
// import {COLLECTION} from '~/data/sanity/collection'; // TODO: Removed Sanity CMS
import type {CollectionDetailsQuery} from 'storefrontapi.generated';
import type {SortParam} from '~/components/elements/SortFilter';
import {ModuleSection} from '~/components/ModuleSection';
import { useFilter } from '~/hooks/useFilter';

import {COLLECTION_QUERY} from '~/data/shopify';

export const headers = routeHeaders;

export async function loader({params, request, context}: LoaderFunctionArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: PAGINATION_SIZE,
  });
  const {collectionHandle} = params;
  const i18n = context.storefront.i18n;
  const lang = i18n.language.toLowerCase();
  const t = await i18next.getFixedT(lang);

  invariant(collectionHandle, t('collection.missingParam'));

  const searchParams = new URL(request.url).searchParams;

  const {sortKey, reverse} = getSortValuesFromParam(
    searchParams.get('sort') as SortParam,
  );

  const {appliedFilters, filters} = await useFilter({
    handle: collectionHandle,
    searchParams,
    storefront: context.storefront,
  });

  const {collection, collections} = (await context.storefront.query(
    COLLECTION_QUERY,
    {
      variables: {
        ...paginationVariables,
        handle: collectionHandle,
        filters,
        sortKey,
        reverse,
        country: i18n.country,
        language: i18n.language,
      },
    },
  )) as CollectionDetailsQuery;

  if (!collection) {
    throw new Response('collection', {status: 404});
  }

  const seo = seoPayload.collection({collection, url: request.url});

  // TODO: Replace with custom CMS integration
  // Sanity CMS removed - user has custom CMS system built on PostgreSQL
  // const sanityQuery = groq`...`;
  // const collectionSanity = await context.sanity.fetch(sanityQuery);

  // Provide empty default data structure
  const collectionSanity = {
    modules: [],
  };

  return json({
    collection,
    appliedFilters,
    collections: flattenConnection(collections),
    collectionSanity,
    seo,
  });
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function Collection() {
  const {collection, collections, collectionSanity, appliedFilters} =
    useLoaderData<typeof loader>();

  const {ref, inView} = useInView();
  const {t} = useTranslation();

  return (
    <>
      <PageHeader heading={collection.title}>
        {collection?.description && (
          <div className="flex items-baseline justify-between w-full">
            <div>
              <Text format width="narrow" as="p" className="inline-block">
                {collection.description}
              </Text>
            </div>
          </div>
        )}
      </PageHeader>
      {collectionSanity?.modules && (
        <>
          {(collectionSanity?.modules || []).map((item: any) => {
            return <ModuleSection key={item._key} item={item} />;
          })}
        </>
      )}
      <Section className="container pb-10">
        <SortFilter
          filters={collection.products.filters as Filter[]}
          appliedFilters={appliedFilters}
        >
          <Pagination connection={collection.products}>
            {({
              nodes,
              isLoading,
              PreviousLink,
              NextLink,
              nextPageUrl,
              hasNextPage,
              state,
            }) => (
              <>
                <div className="flex items-center justify-center mb-2">
                  <Button as={PreviousLink} variant="secondary" width="full">
                    {isLoading ? t('global.loading') : t('global.loadPrevious')}
                  </Button>
                </div>
                <ProductsLoadedOnScroll
                  nodes={nodes}
                  inView={inView}
                  nextPageUrl={nextPageUrl}
                  hasNextPage={hasNextPage}
                  state={state}
                />
                <div className="flex items-center justify-center mt-6">
                  <Button
                    ref={ref}
                    as={NextLink}
                    variant="secondary"
                    width="full"
                  >
                    {isLoading
                      ? t('global.loading')
                      : t('global.loadMoreProducts')}
                  </Button>
                </div>
              </>
            )}
          </Pagination>
        </SortFilter>
      </Section>
      <Analytics.CollectionView
        data={{
          collection: {
            id: collection?.id,
            handle: collection?.handle,
          },
        }}
      />
      {collectionSanity?.colorTheme && (
        <style
          id="collection-theme-color"
          dangerouslySetInnerHTML={{
            __html: `
                body.body-style {
                  background: ${collectionSanity?.colorTheme?.backgroundColor};
                  color: ${collectionSanity?.colorTheme?.textColor};
                }
              `,
          }}
        />
      )}
    </>
  );
}

function ProductsLoadedOnScroll({
  nodes,
  inView,
  nextPageUrl,
  hasNextPage,
  state,
}: {
  nodes: any;
  inView: boolean;
  nextPageUrl: string;
  hasNextPage: boolean;
  state: any;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    if (inView && hasNextPage) {
      navigate(nextPageUrl, {
        replace: true,
        preventScrollReset: true,
        state,
      });
    }
  }, [inView, navigate, state, nextPageUrl, hasNextPage]);

  return (
    <Grid layout="products" data-test="product-grid">
      {nodes.map((product: any, i: number) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </Grid>
  );
}

function getSortValuesFromParam(sortParam: SortParam | null): {
  sortKey: ProductCollectionSortKeys;
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
    case 'best-selling':
      return {
        sortKey: 'BEST_SELLING',
        reverse: false,
      };
    case 'newest':
      return {
        sortKey: 'CREATED',
        reverse: true,
      };
    case 'featured':
      return {
        sortKey: 'MANUAL',
        reverse: false,
      };
    default:
      return {
        sortKey: 'RELEVANCE',
        reverse: false,
      };
  }
}
