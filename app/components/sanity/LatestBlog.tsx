import {useEffect} from 'react';
import {useFetcher} from '@remix-run/react';

import {Heading} from '~/components/elements/Text';
import {Link} from '~/components/elements/Link';
import {Grid} from '~/components/elements/Grid';
import {ArticleCard} from '~/components/cards/ArticleCard';
import {getImageLoadingPriority} from '~/lib/const';
import {usePrefixPathWithLocale} from '~/lib/utils';
import config from 'theme.config';

export function LatestBlog({latestBlog}: {latestBlog: any}) {
  const {load, data} = useFetcher();

  const path = usePrefixPathWithLocale(`/api/latestArticles`);

  useEffect(() => {
    load(path);
  }, [load, path]);

  if (!data) {
    return <p className="text-center">No articles found</p>;
  }

  return (
    <div
      className="mb-12 md:mb-20 overflow-x-hidden"
      style={{margin: latestBlog?.margin}}
    >
      <div className="container">
        {latestBlog.blogTitle && (
          <div
            className={
              latestBlog.blogTitle == true
                ? 'text-center mb-6'
                : 'flex items-center justify-between mb-6'
            }
          >
            <Heading
              className="text-xl md:text-2xl font-bold text-heading3"
              as="h3"
            >
              {latestBlog.blogTitle}
            </Heading>
            {latestBlog.viewAllLink && latestBlog.centerTitle !== true && (
              <Link
                to={
                  latestBlog.viewAllLink.slug
                    ? latestBlog.viewAllLink.slug
                    : 'journal'
                }
                className="underline"
              >
                {latestBlog.viewAllLink.title}
              </Link>
            )}
          </div>
        )}
        <div
          className={
            latestBlog.scrollMobile && latestBlog.limit > 2
              ? 'scrollMobile'
              : ''
          }
        >
          <Grid
            items={latestBlog.limit ? latestBlog.limit : 3}
            className="gap-x-4 md:gap-x-6 gap-y-8"
          >
            {data?.articles.map(
              (article: any, index: number) =>
                index < (latestBlog.limit ? latestBlog.limit : 3) && (
                  <ArticleCard
                    key={article.id}
                    blogHandle={config.blogHandle.toLowerCase()}
                    article={article}
                    loading={getImageLoadingPriority(index)}
                  />
                ),
            )}
            {latestBlog.scrollMobile && latestBlog.limit > 2 && (
              <div className="lg:hidden">&nbsp;</div>
            )}
          </Grid>
        </div>
        {latestBlog.viewAllLink && latestBlog.centerTitle == true && (
          <div className="block text-center mt-8">
            <Link
              to={
                latestBlog.viewAllLink.slug
                  ? latestBlog.viewAllLink.slug
                  : 'news'
              }
              className="inline-block font-medium px-10 py-3 border border-black text-black rounded-full"
            >
              {latestBlog.viewAllLink.title}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
