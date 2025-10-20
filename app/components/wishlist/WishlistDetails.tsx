import {useEffect, useMemo} from 'react';
import {Link, useFetcher} from '@remix-run/react';
import type {Product} from '@shopify/hydrogen/storefront-api-types';
import {useTranslation} from 'react-i18next';

import {usePrefixPathWithLocale} from '~/lib/utils';
import {ProductCard} from '~/components/cards/ProductCard';
import {getImageLoadingPriority} from '~/lib/const';

export function WishlistDetails({wishlists, isAccountPage = false}: {wishlists: any; isAccountPage: boolean}) {
  const query = wishlists.map((item: any) => `'${item.handle}'`).join(' OR ');
  const count = wishlists.length ?? 12;
  const {t} = useTranslation();

  const queryString = useMemo(
    () =>
      Object.entries({count, query})
        .map(([key, val]) => (val ? `${key}=${val}` : null))
        .join('&'),
    [count, query],
  );

  const path = usePrefixPathWithLocale(`/api/products?${queryString}`);
  const {load, data} = useFetcher();
  useEffect(() => {
    load(path);
  }, [load, path, queryString]);

  if (data) {
    const newDataProduct = data.products.map((item: any) => {
      return {
        handle: item.handle,
      };
    });
    localStorage.setItem('wishlist', JSON.stringify(newDataProduct));
  }

  if (!data) {
    return (
      <div className="fadeIn">
        <div>{t('wishlist.empty')}</div>
        <Link to="/collections">
          <p className="underline">{t('collection.browseCatalog')}</p>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {data?.products && data?.products.length > 0 ? (
        <div className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 gap-y-8 ${isAccountPage ? '' : 'xl:grid-cols-5'}`}>
          {data?.products.map((product: Product, i: number) => (
            <ProductCard
              key={product.id}
              // @ts-ignores
              product={product}
              quickAdd={true}
              loading={getImageLoadingPriority(i)}
            />
          ))}
        </div>
      ) : (
        <div className="fadeIn">
          <div>{t('wishlist.empty')}</div>
          <Link to="/collections">
            <p className="underline">{t('collection.browseCatalog')}</p>
          </Link>
        </div>
      )}
    </div>
  );
}
