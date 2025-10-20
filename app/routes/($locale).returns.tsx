import {
  json,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {getSeoMeta} from '@shopify/hydrogen';
import i18next from '~/i18next.server';
import {seoPayload} from '~/lib/seo.server';
import {Section} from '~/components/elements/Text';
import {ReturnForm} from '~/components/returns/ReturnForm';

export const loader = async ({request, context}: LoaderFunctionArgs) => {
  const {storefront} = context;

  const locale = storefront.i18n.language.toLowerCase();
  const t = await i18next.getFixedT(locale);

  const page = {
    'seo': {
      'title': t('page.returnHeading'),
      'description': t('page.returnText'),
    }
  }

  const seo = seoPayload.page({page, url: request.url});

  return json({seo});
};

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function Returns() {
  return (
    <Section className="container">
      <ReturnForm />
    </Section>
  );
}
