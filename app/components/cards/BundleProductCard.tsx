import clsx from 'clsx';
import {flattenConnection, Money, Image, useMoney} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import type {ProductCardFragment} from 'storefrontapi.generated';
import {Text} from '~/components/elements/Text';
import {Link} from '~/components/elements/Link';
import {isDiscounted} from '~/lib/utils';
import {getProductPlaceholder} from '~/lib/placeholders';

export function BundleProductCard({product}: {product: ProductCardFragment;}) {
  const cardData = product?.variants ? product : getProductPlaceholder();

  const firstVariant = flattenConnection(cardData.variants)[0];

  if (!firstVariant) return null;
  const {image, price, compareAtPrice} = firstVariant;

  let swapImage = null;

  if (product.images) {
    const url =
      product.images.edges.length > 1
        ? product.images.edges[1].node.originalSrc
        : product.images.edges[0].node.originalSrc;

    swapImage = {
      url,
    };
  }

  return (
    <Link
      to={`/products/${product.handle}`}
      className="flex gap-2 md:flex-col lg:flex-row border rounded overflow-hidden"
    >
      {image && (
        <>
          <div className="w-full lg:w-60 product-image relative overflow-hidden flex aspect-square overflow-hidden">
            <Image
              className={
                (swapImage ? 'image-front' : '') +
                ' aspect-square w-full object-cover'
              }
              sizes="(min-width: 64em) 25vw, (min-width: 48em) 30vw, 45vw"
              aspectRatio="1/1"
              data={image}
              alt={image.altText || product.title}
              loading={'lazy'}
            />
            {swapImage && (
              <Image
                className="image-back aspect-square w-full object-cover"
                sizes="(min-width: 64em) 25vw, (min-width: 48em) 30vw, 45vw"
                aspectRatio="1/1"
                data={swapImage || image}
                alt={image.altText || product.title}
                loading={'lazy'}
              />
            )}
          </div>
        </>
      )}
      <div className="w-full flex flex-col gap-1 p-4 relative">
        <div className="text-sm text-ellipsis mb-2">{product.title}</div>
        <div className="flex gap-4">
          <Text className="flex gap-2">
            {isDiscounted(price as MoneyV2, compareAtPrice as MoneyV2) && (
              <CompareAtPrice
                className="font-medium text-gray-500"
                data={compareAtPrice as MoneyV2}
              />
            )}
            <span
              className={`${
                isDiscounted(price as MoneyV2, compareAtPrice as MoneyV2) &&
                'text-red-600'
              } font-bold`}
            >
              <Money data={price!} />
            </span>
          </Text>
        </div>
      </div>
    </Link>
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
