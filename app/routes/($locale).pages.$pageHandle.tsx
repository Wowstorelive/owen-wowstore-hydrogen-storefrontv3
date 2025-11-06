import {
  defer,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import invariant from 'tiny-invariant';
import {Suspense} from 'react';
// import groq from 'groq'; // TODO: Removed Sanity CMS - using custom CMS
import {getSeoMeta} from '@shopify/hydrogen';
import {PageHeader} from '~/components/elements/Text';
import {routeHeaders} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';
// import {PAGE} from '~/data/sanity/pages/page'; // TODO: Removed Sanity CMS
import {ModuleSection} from '~/components/ModuleSection';

export const headers = routeHeaders;

export async function loader(args: LoaderFunctionArgs) {
  const criticalData = await loadCriticalData(args);
  return defer({...criticalData});
}

async function loadCriticalData({context, params, request}: LoaderFunctionArgs) {
  invariant(params.pageHandle, 'Missing page handle');
  const lang = context.storefront.i18n.language.toLowerCase();

  // TODO: Replace with custom CMS integration
  // Sanity CMS removed - user has custom CMS system built on PostgreSQL
  // const query = groq`...`;
  // const page = await context.sanity.fetch(query);

  // Provide default data structure
  const page = {
    title: params.pageHandle.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    showTitle: true,
    centerTitle: false,
    modules: [],
    seo: {
      title: params.pageHandle.replace(/-/g, ' '),
      description: '',
    },
  };

  return {
    page,
    seo: seoPayload.page({page, url: request.url}),
  };
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function Page() {
  const {page} = useLoaderData<typeof loader>() as any;
  const {modules, title, showTitle, centerTitle} = page;

  return (
    <>
      <Suspense>
        {showTitle === true && (
          <PageHeader
            heading={title}
            className={centerTitle ? 'justify-center' : ''}
          />
        )}
        {(modules || []).map((item: any) => {
          return <ModuleSection key={item._key} item={item} />;
        })}
      </Suspense>
    </>
  );
}
