import {useTranslation} from 'react-i18next';
import {useMoney} from '@shopify/hydrogen';

import {BundleProductCard} from '~/components/cards/BundleProductCard';
import {Text} from '~/components/elements/Text';
import {AddToCartButton} from '~/components/elements/AddToCartButton';

export function ProductBundle({product, bundleItems, wrapperClass}: any) {
  const {bundle_price} = product;
  const priceProduct = Number(product.variants.nodes[0].price.amount);
  const priceAdditional = bundleItems.reduce(
    (a: any, b: any) => a + Number(b.variants.nodes[0].price.amount),
    0,
  );

  const totalPrice = priceProduct + priceAdditional;
  const bundlePrice = Number(JSON.parse(bundle_price.value)?.amount);

  const {currencyNarrowSymbol} = useMoney(product.variants.nodes[0].price);

  const {t} = useTranslation();

  return (
    <div className={wrapperClass}>
      <div className="text-xl font-bold py-4">{t('product.bundleHeading')}</div>
      <div className="grid md:grid-cols-4 gap-8 mt-1">
        <BundleProductCard product={product} />
        {bundleItems.map((product: any) => (
          <div className="relative" key={product.id}>
            <div className="absolute top-1/2 -translate-x-1/2 -left-4 -translate-y-1/2 text-lg font-bold">
              +
            </div>
            <BundleProductCard product={product} />
          </div>
        ))}
        <div className="flex flex-col items-center justify-center">
          <div>
            {t('product.totalPrice')}{' '}
            <span className="text-lg font-semibold">
              {currencyNarrowSymbol}
              {bundlePrice}
            </span>
          </div>
          <div className="font-semibold text-md text-red-600 mb-3">
            {t('product.save')} {currencyNarrowSymbol}
            {(totalPrice - bundlePrice).toFixed()} {t('product.whenBundled')}
          </div>
          <AddBundleProduct product={product} bundleItems={bundleItems} />
        </div>
      </div>
    </div>
  );
}

function AddBundleProduct({
  product,
  bundleItems,
}: {
  product?: any;
  bundleItems?: any;
}) {
  const lines = [product, ...bundleItems];

  const linesId = lines.map((line) => ({
    quantity: 1,
    merchandiseId: line.variants.nodes[0].id,
    firstVariant: line.variants.nodes[0]
  }));

  const {t} = useTranslation();

  return (
    <AddToCartButton lines={linesId} variant="primary" className="btn-primary">
      <Text as="span" className="flex items-center justify-center gap-2">
        {t('product.addAllToCart')}
      </Text>
    </AddToCartButton>
  );
}
