import {
  json,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {useTranslation} from 'react-i18next';
import {getSeoMeta} from '@shopify/hydrogen';
import i18next from '~/i18next.server';
import {seoPayload} from '~/lib/seo.server';
import {PageHeader, Section} from '~/components/elements/Text';
import {Link} from '~/components/elements/Link';
import {CompareDetails} from '~/components/compare/CompareDetails';
import {useStoreContext} from '~/components/global/StoreContext';

export const loader = async ({request, context}: LoaderFunctionArgs) => {
  const {storefront} = context;

  const locale = storefront.i18n.language.toLowerCase();
  const t = await i18next.getFixedT(locale);

  const page = {
    'seo': {
      'title': t('compare.heading'),
      'description': t('compare.heading'),
    }
  }

  const seo = seoPayload.page({page, url: request.url});

  return json({seo});
};

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function Compare() {
  const {compareCounter, compareList, setCompareList} =
    useStoreContext() as any;
  const {t} = useTranslation();
  return (
    <>
      <PageHeader heading={t('compare.heading')} />
      <Section className="container">
        {compareCounter > 0 ? (
          <CompareDetails
            counter={compareCounter}
            compareList={compareList}
            setCompareList={setCompareList}
          />
        ) : (
          <div className="fadeIn">
            <div>{t('compare.empty')}</div>
            <Link to="/collections">
              <p className="underline">{t('collection.browseCatalog')}</p>
            </Link>
          </div>
        )}
      </Section>
    </>
  );
}
