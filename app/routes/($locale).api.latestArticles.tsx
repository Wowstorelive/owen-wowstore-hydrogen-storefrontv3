import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {flattenConnection} from '@shopify/hydrogen';
import config from 'theme.config';

export async function loader({context: {storefront}}: LoaderFunctionArgs) {
  const {language, country} = storefront.i18n;

  const {blog} = await storefront.query(LATEST_BLOG_QUERY, {
    variables: {
      blogHandle: config.blogHandle.toLowerCase(),
      pageBy: 6,
      language,
    },
  });

  if(!blog) {
    return null;
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

  return json({
    articles,
  });
}

const LATEST_BLOG_QUERY = `#graphql
query ApiBlog(
  $language: LanguageCode
  $blogHandle: String!
  $pageBy: Int!
) @inContext(language: $language) {
  blog(handle: $blogHandle) {
    articles(first: $pageBy, reverse:true) {
      edges {
        node {
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
      }
    }
  }
}
`;

// no-op
export default function ProductsApiRoute() {
  return null;
}
