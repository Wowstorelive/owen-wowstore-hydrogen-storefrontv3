import {
  json,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {getSeoMeta} from '@shopify/hydrogen';
import i18next from '~/i18next.server';
import {useTranslation} from 'react-i18next';
import {seoPayload} from '~/lib/seo.server';
import {Section, PageHeader} from '~/components/elements/Text';
import {OrderTrackingForm} from '~/components/orderTracking/OrderTrackingForm';

export const loader = async ({request, context}: LoaderFunctionArgs) => {
  const {storefront} = context;

  const locale = storefront.i18n.language.toLowerCase();
  const t = await i18next.getFixedT(locale);

  const page = {
    'seo': {
      'title': t('page.orderTraking'),
      'description': t('page.orderTrakingText'),
    }
  }

  const seo = seoPayload.page({page, url: request.url});

  return json({seo});
};

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function OrderTracking() {
  const {t} = useTranslation();
  return (
    <>
      <PageHeader heading={t('page.orderTraking')} className="justify-center" />
      <Section className="container">
        <OrderTrackingForm />
      </Section>
    </>
  );
}
