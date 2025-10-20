import {
  json,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {getSeoMeta} from '@shopify/hydrogen';
import i18next from '~/i18next.server';
import {seoPayload} from '~/lib/seo.server';
import {PageHeader} from '~/components/elements/Text';
import {Link} from '~/components/elements/Link';
import {WishlistDetails} from '~/components/wishlist/WishlistDetails';
import {useStoreContext} from '~/components/global/StoreContext';
import {FeaturedSection} from '~/components/FeaturedSection';

export const loader = async ({request, context}: LoaderFunctionArgs) => {
  const {storefront} = context;

  const locale = storefront.i18n.language.toLowerCase();
  const t = await i18next.getFixedT(locale);

  const page = {
    'seo': {
      'title': t('wishlist.heading'),
      'description': t('wishlist.heading'),
    }
  }

  const seo = seoPayload.page({page, url: request.url});

  return json({seo});
};

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function Wishlist() {
  const {wishlist, wishlistCounter} = useStoreContext() as any;
  const {t} = useTranslation();
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    window.setTimeout(function () {
      setIsFeatured(true);
    }, 500);
  });

  return (
    <>
      <PageHeader heading={t('wishlist.heading')} className="mt-8" />
        {wishlistCounter > 0 ? (
          <div className="container">
            <WishlistDetails wishlists={wishlist} />
          </div>
        ) : (
          <>
            <div className="container">
              <div className="fadeIn mb-12">
                <p>{t('wishlist.empty')}</p>
                <Link to="/collections">
                  <p className="underline">{t('collection.browseCatalog')}</p>
                </Link>
              </div>
            </div>
            {isFeatured && (
              <FeaturedSection />
            )}
          </>
        )}
    </>
  );
}
