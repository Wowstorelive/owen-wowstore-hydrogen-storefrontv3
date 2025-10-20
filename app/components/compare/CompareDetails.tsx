import {useEffect, useMemo} from 'react';
import clsx from 'clsx';
import {useFetcher} from '@remix-run/react';
import type {Product, MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {flattenConnection, Money, useMoney} from '@shopify/hydrogen';
import {useTranslation} from 'react-i18next';

import {ProductCardCompare} from '~/components/cards/ProductCardCompare';
import {isDiscounted, usePrefixPathWithLocale} from '~/lib/utils';
import {getImageLoadingPriority} from '~/lib/const';
import {getProductPlaceholder} from '~/lib/placeholders';
import {Link} from '~/components/elements/Link';
import {Text} from '~/components/elements/Text';

export function CompareDetails({
  counter,
  compareList,
  setCompareList,
}: {
  counter: number;
  compareList?: any;
  setCompareList?: any;
}) {
  const query = compareList.map((item: any) => `'${item.handle}'`).join(' OR ');
  const count = counter ?? 12;
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

    localStorage.setItem('compare', JSON.stringify(newDataProduct));
  }

  if (!data) {
    return (
      <div className="fadeIn">
        <div>{t('compare.empty')}</div>
        <Link to="/collections">
          <p className="underline">{t('collection.browseCatalog')}</p>
        </Link>
      </div>
    );
  }

  const handleRemoveCompare = (handle: string) => {
    const newCompareList = compareList.filter(
      (item: any) => item.handle !== handle,
    );
    setCompareList(newCompareList);
    localStorage.setItem('compare', JSON.stringify(newCompareList));
    window.dispatchEvent(new Event('comparechange'));
  };

  return (
    <div className="overflow-x-auto pb-8">
      {data?.products && data?.products.length > 0 ? (
        <div className="flex flex-col pl-28">
          <div className="flex gap-4 md:gap-6 gap-y-8 flex-1">
            {(data?.products || []).map((product: Product, i: number) => {
              const cardProduct: Product = product?.variants
                ? (product as Product)
                : getProductPlaceholder();
              if (!cardProduct?.variants?.nodes?.length) return null;

              const firstVariant = flattenConnection(cardProduct.variants)[0];
              if (!firstVariant) return null;
              const {price, compareAtPrice} = firstVariant;

              const availableForSale = firstVariant.availableForSale;

              const colorOptions = firstVariant?.selectedOptions.find(
                (item: any) => item.name === 'Color',
              );

              const sizeOptions = firstVariant?.selectedOptions.find(
                (item: any) => item.name === 'Size',
              );

              return (
                <div
                  key={product.id}
                  className="flex flex-col gap-8"
                  style={{minWidth: '230px', maxWidth: '230px'}}
                >
                  <div className="flex items-center">
                    {i == 0 && (
                      <div className="font-semibold min-w-28 -ml-28">
                        {t('global.product')}
                      </div>
                    )}
                    <div className="w-full">
                      <div
                        className="text-center cursor-pointer py-2 font-semibold"
                        onClick={() => {
                          handleRemoveCompare(product.handle);
                        }}
                        aria-hidden="true"
                      >
                        {t('global.remove')}
                      </div>
                      <ProductCardCompare
                        // @ts-ignores
                        product={product}
                        quickAdd={true}
                        loading={getImageLoadingPriority(i)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    {i == 0 && (
                      <div className="font-semibold min-w-28 -ml-28">
                        {t('global.availability')}
                      </div>
                    )}
                    {availableForSale ? (
                      <div className="w-full flex justify-center text-green-500">
                        {t('global.inStock')}
                      </div>
                    ) : (
                      <div className="w-full flex justify-center text-red-500">
                        {t('global.outStock')}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center">
                    {i == 0 && (
                      <div className="font-semibold min-w-28 -ml-28">
                        {t('global.price')}
                      </div>
                    )}
                    <Text className="w-full flex gap-2 justify-center">
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
                  </div>

                  <div className="flex items-center">
                    {i == 0 && (
                      <div className="font-semibold min-w-28 -ml-28">
                        {t('global.vendor')}
                      </div>
                    )}
                    <div className="w-full flex justify-center">
                      {product.vendor}
                    </div>
                  </div>

                  <div className="flex items-center">
                    {i == 0 && (
                      <div className="font-semibold min-w-28 -ml-28">
                        {t('global.color')}
                      </div>
                    )}
                    {colorOptions?.value ? (
                      <div className="w-full flex justify-center">
                        {colorOptions?.value}
                      </div>
                    ) : (
                      <div className="w-full flex justify-center text-gray-500">
                        N/A
                      </div>
                    )}
                  </div>

                  <div className="flex items-center">
                    {i == 0 && (
                      <div className="font-semibold min-w-28 -ml-28">
                        {t('global.size')}
                      </div>
                    )}
                    {sizeOptions?.value ? (
                      <div className="w-full flex justify-center">
                        {sizeOptions?.value}
                      </div>
                    ) : (
                      <div className="w-full flex justify-center text-gray-500">
                        N/A
                      </div>
                    )}
                  </div>

                  {/* <div className="flex items-center">
                    {i == 0 && (
                      <div className="font-semibold min-w-28 -ml-28">
                        Description
                      </div>
                    )}
                    <div
                      className="prose text-sm"
                      dangerouslySetInnerHTML={{__html: product?.descriptionHtml}}
                    />
                  </div> */}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="fadeIn">
          <div>{t('compare.empty')}</div>
          <Link to="/collections">
            <p className="underline">{t('collection.browseCatalog')}</p>
          </Link>
        </div>
      )}
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
