import {Image} from '@shopify/hydrogen';

import {Link} from '~/components/elements/Link';
import type {ArticleFragment} from 'storefrontapi.generated';

export function ArticleCard({
  blogHandle,
  article,
  loading,
}: {
  blogHandle: string;
  article: ArticleFragment;
  loading?: HTMLImageElement['loading'];
}) {
  return (
    <div key={article.id}>
      <Link to={`/${blogHandle}/${article.handle}`} className="flex flex-col">
        <div className="bg-gray-300 aspect-3/2 overflow-hidden">
          {article?.image && (
            <Image
              className="w-full h-full object-cover"
              sizes="(max-width: 32em) 100vw, 33vw"
              data={article.image}
              alt={`Image of ${article.title}`}
              loading={loading}
            />
          )}
        </div>

        <div className="flex flex-col flex-1">
          <span className="block mt-4 text-sm font-normal opacity-70">
            {article?.author?.name} <span className="px-2">|</span>{' '}
            {new Date(article.publishedAt).toDateString()}
          </span>
          <p className="mt-2 flex-1 md:text-lg font-medium uppercase leading-none">
            {article?.title}
          </p>
          {article?.excerptHtml && (
            <div
              dangerouslySetInnerHTML={{
                __html: article?.excerptHtml.substring(0, 90) + '...',
              }}
              className="mt-2 opacity-70"
            />
          )}
        </div>
      </Link>
    </div>
  );
}
