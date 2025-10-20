import {useEffect, useMemo} from 'react';
import clsx from 'clsx';
import {useFetcher} from '@remix-run/react';
import {Image, Money, useMoney, flattenConnection} from '@shopify/hydrogen';
import type {MoneyV2, Product} from '@shopify/hydrogen/storefront-api-types';
import {useTranslation} from 'react-i18next';

import {Text} from '~/components/elements/Text';
import {Link} from '~/components/elements/Link';
import {IconRemove} from '~/components/elements/Icon';
import {isDiscounted, usePrefixPathWithLocale} from '~/lib/utils';

export function ComparePreview({
  compares,
  onClick,
  onClose,
  setCompareList,
}: {
  compares: any;
  onClick?: () => void;
  onClose: () => void;
  setCompareList?: any;
}) {
  const query = compares.map((item: any) => `'${item.handle}'`).join(' OR ');
  const count = compares.length ?? 12;
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

  const handleRemoveCompare = (handle: string) => {
    const newCompareList = compares.filter(
      (item: any) => item.handle !== handle,
    );

    localStorage.setItem('compare', JSON.stringify(newCompareList));
    setCompareList(newCompareList);
    window.dispatchEvent(new Event('comparechange'));
  };

  if (!data) {
    return <></>;
  }

  return (
    <div className="grid grid-cols-1 h-screen-no-nav grid-rows-[1fr_auto]">
      <div className="px-6 pb-6 sm-max:pt-2 overflow-auto transition md:px-12">
        <div className="grid gap-6">
          {data.products.map((product: Product) => {
            const firstVariant = flattenConnection(product.variants)[0];
            if (!firstVariant) return null;
            const {image, price, compareAtPrice} = firstVariant;
            return (
              <div key={product.id} className="relative flex gap-6">
                <Link
                  onClick={onClick}
                  to={`/products/${product.handle}`}
                  prefetch="intent"
                  className="min-w-24 max-w-24"
                >
                  <div className="aspect-square bg-primary/5">
                    {image && (
                      <div className="product-image relative overflow-hidden flex w-full h-full">
                        <Image
                          className="aspect-square w-full object-cover"
                          width={130}
                          height={130}
                          aspectRatio="1/1"
                          data={image}
                          alt={image.altText || `Picture of ${product.title}`}
                          loading={'lazy'}
                        />
                      </div>
                    )}
                  </div>
                </Link>
                <div className="flex flex-col gap-1 w-full">
                  <Link
                    onClick={onClick}
                    to={`/products/${product.handle}`}
                    className="w-full font-medium"
                  >
                    {product.title}
                  </Link>
                  <div className="flex gap-4 justify-between">
                    <Text className="flex gap-2">
                      {isDiscounted(
                        price as MoneyV2,
                        compareAtPrice as MoneyV2,
                      ) && (
                        <CompareAtPrice
                          className="font-medium text-gray-500"
                          data={compareAtPrice as MoneyV2}
                        />
                      )}
                      <span
                        className={`${
                          isDiscounted(
                            price as MoneyV2,
                            compareAtPrice as MoneyV2,
                          ) && 'text-red-600'
                        } font-bold`}
                      >
                        <Money data={price!} />
                      </span>
                    </Text>
                    <div
                      className="text-center cursor-pointer"
                      onClick={() => {
                        handleRemoveCompare(product.handle);
                      }}
                      aria-hidden="true"
                    >
                      <IconRemove aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="px-6 md:px-12 py-6">
        <Link
          to="/compare"
          className="block w-full text-center rounded px-4 py-3 bg-black text-white"
          onClick={onClose}
        >
          {t('compare.compareNow')}
        </Link>
      </div>
    </div>
  );
}

function CompareAtPrice({
  data,
  className,
}: {
  data: MoneyV2;
  className?: string;
}) {
  const {currencyNarrowSymbol, withoutTrailingZerosAndCurrency} =
    useMoney(data);

  const styles = clsx('line-through', className);

  return (
    <span className={styles}>
      {currencyNarrowSymbol}
      {withoutTrailingZerosAndCurrency}
    </span>
  );
}
