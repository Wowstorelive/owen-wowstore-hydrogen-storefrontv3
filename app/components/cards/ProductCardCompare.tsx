import clsx from 'clsx';
import {flattenConnection, Image} from '@shopify/hydrogen';
import type {MoneyV2, Product} from '@shopify/hydrogen/storefront-api-types';
import {useTranslation} from 'react-i18next';
import type {ProductCardFragment} from 'storefrontapi.generated';
import {Text} from '~/components/elements/Text';
import {Link} from '~/components/elements/Link';
import {Button} from '~/components/elements/Button';
import {Rating} from '~/components/elements/Rating';
import {AddToCartButton} from '~/components/elements/AddToCartButton';
import {isDiscounted, isNewArrival} from '~/lib/utils';
import {getProductPlaceholder} from '~/lib/placeholders';
import {WishlistButton} from '~/components/wishlist/WishlistButton';

export function ProductCardCompare({
  product,
  label,
  className,
  onClick,
  quickAdd,
}: {
  product: ProductCardFragment;
  label?: string;
  className?: string;
  onClick?: () => void;
  quickAdd?: boolean;
}) {
  let cardLabel;
  const {t} = useTranslation();
  const cardProduct: Product = product?.variants
    ? (product as Product)
    : getProductPlaceholder();
  if (!cardProduct?.variants?.nodes?.length) return null;

  const firstVariant = flattenConnection(cardProduct.variants)[0];

  if (!firstVariant) return null;
  const {image, price, compareAtPrice} = firstVariant;

  if (label) {
    cardLabel = label;
  } else if (isDiscounted(price as MoneyV2, compareAtPrice as MoneyV2)) {
    cardLabel = t('global.sale');
  } else if (isNewArrival(product.publishedAt)) {
    cardLabel = t('global.new');
  }

  const styles = clsx('flex flex-col gap-3', className);

  let swapImage = null;
  if (product?.images?.edges?.length > 0) {
    const url =
      product?.images?.edges?.length > 1
        ? product.images?.edges[1]?.node?.originalSrc
        : product.images?.edges[0]?.node?.originalSrc;

    swapImage = {
      url,
    };
  }

  const reviews = product?.reviews ? JSON.parse(product.reviews?.value) : [];

  return (
    <div className={`${styles} productcard relative overflow-hidden`}>
      <Link
        onClick={onClick}
        to={`/products/${product.handle}`}
        prefetch="viewport"
      >
        <div className="aspect-square bg-primary/5">
          {image && (
            <div className="product-image relative overflow-hidden flex w-full h-full">
              <Image
                className={
                  (swapImage ? 'image-front' : '') +
                  ' aspect-square w-full object-cover'
                }
                sizes="(min-width: 64em) 25vw, (min-width: 48em) 30vw, 45vw"
                aspectRatio="1/1"
                data={image}
                width={250}
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
          )}
          {cardLabel && (
            <Text
              as="label"
              size="fine"
              className="absolute z-10 bg-red-600 text-white px-2 top-0 right-0 m-4 text-right text-sm"
            >
              {cardLabel}
            </Text>
          )}
        </div>
      </Link>
      <div className="flex flex-col flex-1 gap-1">
        <div className="flex items-center justify-between h-6 mt-1">
          <div className="text-sm text-gray-600">{product.vendor}</div>
          <WishlistButton handle={product.handle} />
        </div>
        <div className="flex items-center gap-1 flex-1 min-h-5">
          <Rating rating={Math.round(reviews.value)} />
          {product?.rating_count?.value > 0 && (
            <span className="text-sm">({product?.rating_count?.value})</span>
          )}
        </div>
        <Link
          onClick={onClick}
          to={`/products/${product.handle}`}
          className="w-full text-sm font-medium flex-1 min-h-11 title-ellipsis"
        >
          {product.title}
        </Link>
      </div>
      {quickAdd && firstVariant.availableForSale && (
        <AddToCartButton
          lines={[
            {
              quantity: 1,
              merchandiseId: firstVariant.id,
              selectedVariant: firstVariant
            },
          ]}
          variant="secondary"
          className="mt-2 btn-primary"
        >
          <Text as="span" className="flex items-center justify-center gap-2">
            {t('global.addToCart')}
          </Text>
        </AddToCartButton>
      )}
      {quickAdd && !firstVariant.availableForSale && (
        <Button variant="secondary" className="mt-2" disabled>
          <Text as="span" className="flex items-center justify-center gap-2">
            {t('global.soldOut')}
          </Text>
        </Button>
      )}
    </div>
  );
}
