import {
  json,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {flattenConnection, getSeoMeta} from '@shopify/hydrogen';

import {PageHeader, Section} from '~/components/elements/Text';
import {Grid} from '~/components/elements/Grid';
import {ArticleCard} from '~/components/cards/ArticleCard';
import {getImageLoadingPriority, PAGINATION_SIZE} from '~/lib/const';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders} from '~/data/cache';
import config from 'theme.config';
import {defaultLng} from 'languages.config';

export const headers = routeHeaders;

export const loader = async ({
  request,
  context: {storefront},
}: LoaderFunctionArgs) => {
  const {language, country} = storefront.i18n;

  let handle = config.blogHandle;
  if (language.toLowerCase() !== defaultLng) {
    handle = `${language.toLowerCase()}-${config.blogHandle.toLowerCase()}`;
  }

  const {blog} = await storefront.query(BLOGS_QUERY, {
    variables: {
      blogHandle: handle,
      pageBy: PAGINATION_SIZE,
      language,
    },
  });

  if (!blog?.articles) {
    throw new Response('Not found', {status: 404});
  }

  const articles = flattenConnection(blog.articles).map((article: any) => {
    const {publishedAt} = article!;
    return {
      ...article,
      publishedAt: new Intl.DateTimeFormat(`${language}-${country}`, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(publishedAt!)),
    };
  });

  const seo = seoPayload.blog({blog, url: request.url});

  return json({blogTitle: blog.title, articles, seo});
};

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function Journals() {
  const {blogTitle, articles} = useLoaderData<typeof loader>();

  return (
    <>
      <PageHeader heading={blogTitle} />
      <Section className="container">
        <Grid as="ol" layout="blog">
          {articles.map((article: any, i: number) => (
            <ArticleCard
              blogHandle={config.blogHandle.toLowerCase()}
              article={article}
              key={article.id}
              loading={getImageLoadingPriority(i, 2)}
            />
          ))}
        </Grid>
      </Section>
    </>
  );
}

const BLOGS_QUERY = `#graphql
query Blog(
  $language: LanguageCode
  $blogHandle: String!
  $pageBy: Int!
  $cursor: String
) @inContext(language: $language) {
  blog(handle: $blogHandle) {
    title
    seo {
      title
      description
    }
    articles(first: $pageBy, after: $cursor) {
      edges {
        node {
          ...Article
        }
      }
    }
  }
}

fragment Article on Article {
  author: authorV2 {
    name
  }
  excerptHtml
  handle
  id
  image {
    id
    altText
    url
    width
    height
  }
  publishedAt
  title
}
`;
