import {
  json,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import type {Collection} from '@shopify/hydrogen/storefront-api-types';
import {
  Image,
  Pagination,
  getPaginationVariables,
  getSeoMeta,
} from '@shopify/hydrogen';
import {useTranslation} from 'react-i18next';

import {Heading, PageHeader, Section} from '~/components/elements/Text';
import {Link} from '~/components/elements/Link';
import {Button} from '~/components/elements/Button';
import {Grid} from '~/components/elements/Grid';

import {getImageLoadingPriority} from '~/lib/const';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders} from '~/data/cache';

const PAGINATION_SIZE = 8;

export const headers = routeHeaders;

export const loader = async ({
  request,
  context: {storefront},
}: LoaderFunctionArgs) => {
  const variables = getPaginationVariables(request, {pageBy: PAGINATION_SIZE});
  const {collections} = await storefront.query(COLLECTIONS_QUERY, {
    variables: {
      ...variables,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  const seo = seoPayload.listCollections({
    collections,
    url: request.url,
  });

  return json({collections, seo});
};

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function Collections() {
  const {collections} = useLoaderData<typeof loader>();
  const {t} = useTranslation();
  return (
    <>
      <PageHeader
        className="justify-center uppercase text-3xl"
        heading={t('collection.ourCollections')}
      />
      <Section className="container">
        <Pagination connection={collections}>
          {({nodes, isLoading, PreviousLink, NextLink}) => (
            <>
              <div className="flex items-center justify-center mb-2">
                <Button as={PreviousLink} variant="secondary" width="full">
                  {isLoading
                    ? t('global.loading')
                    : t('collection.previousCollections')}
                </Button>
              </div>
              <Grid
                items={nodes.length === 3 ? 3 : 3}
                data-test="collection-grid"
              >
                {nodes.map(
                  (collection, i) =>
                    collection.handle !== 'frontpage' && (
                      <CollectionCard
                        collection={collection as Collection}
                        key={collection.id}
                        loading={getImageLoadingPriority(i, 2)}
                      />
                    ),
                )}
              </Grid>
              <div className="flex items-center justify-center mt-6">
                <Button as={NextLink} variant="secondary" width="full">
                  {isLoading
                    ? t('global.loading')
                    : t('collection.nextCollections')}
                </Button>
              </div>
            </>
          )}
        </Pagination>
      </Section>
    </>
  );
}

function CollectionCard({
  collection,
  loading,
}: {
  collection: Collection;
  loading?: HTMLImageElement['loading'];
}) {
  return (
    <Link
      prefetch="viewport"
      to={`/collections/${collection.handle}`}
      className="grid gap-4"
    >
      <div className="card-image bg-primary/5">
        {collection?.image && (
          <Image
            data={collection.image}
            aspectRatio="3/2"
            sizes="(max-width: 32em) 100vw, 45vw"
            loading={loading}
          />
        )}
      </div>
      <Heading as="h3" size="copy">
        {collection.title}
      </Heading>
    </Link>
  );
}

const COLLECTIONS_QUERY = `#graphql
  query Collections(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        id
        title
        description
        handle
        seo {
          description
          title
        }
        image {
          id
          url
          width
          height
          altText
        }
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
`;
