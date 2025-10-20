import {
  defer,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import invariant from 'tiny-invariant';
import {Suspense} from 'react';
import groq from 'groq';
import {getSeoMeta} from '@shopify/hydrogen';
import {PageHeader} from '~/components/elements/Text';
import {routeHeaders} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';
import {PAGE} from '~/data/sanity/pages/page';
import {ModuleSection} from '~/components/ModuleSection';

export const headers = routeHeaders;

export async function loader(args: LoaderFunctionArgs) {
  const criticalData = await loadCriticalData(args);
  return defer({...criticalData});
}

async function loadCriticalData({context, params, request}: LoaderFunctionArgs) {
  invariant(params.pageHandle, 'Missing page handle');
  const lang = context.storefront.i18n.language.toLowerCase();
  const query = groq`
    *[_type == "page" && language == "${lang}" && slug == "${params.pageHandle}"][0] {
      ${PAGE}
    }
  `;

  const [page] = await Promise.all([
    context.sanity.fetch(query),
  ]);

  if (!page) {
    throw new Response(null, {status: 404});
  }

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
