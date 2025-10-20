import {useEffect} from 'react';
import {useFetcher} from '@remix-run/react';
import {useTranslation} from 'react-i18next';

import {usePrefixPathWithLocale} from '~/lib/utils';
import type {FeaturedData} from '~/routes/($locale).featured-products';
import {ProductCarousel} from '~/components/product/ProductCarousel';

import {FeaturedCollections} from './FeaturedCollections';

export function FeaturedSection() {
  const {load, data} = useFetcher<FeaturedData>();
  const path = usePrefixPathWithLocale('/featured-products');
  const {t} = useTranslation();
  const collectionsTitle = t('global.featuredCollections');
  const productsTitle = t('global.featuredProducts');
  useEffect(() => {
    load(path);
  }, [load, path]);

  if (!data) return null;

  const {featuredCollections, featuredProducts} = data;

  return (
    <div className="container">
      <div className="grid gap-12 mt-16 fadeIn">
        <FeaturedCollections
          title={collectionsTitle}
          collections={featuredCollections}
        />
        <ProductCarousel
          title={productsTitle}
          products={featuredProducts.nodes}
          settings={{itemsPerRow: 4, limitItems: 8}}
        />
      </div>
    </div>
  );
}
