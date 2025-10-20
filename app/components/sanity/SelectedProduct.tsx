import {useEffect, useMemo} from 'react';
import {useFetcher} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';
import {useTranslation} from 'react-i18next';

import {ProductCarousel} from '~/components/product/ProductCarousel';
import {ProductCard} from '~/components/cards/ProductCard';
import {ProductCardV2} from '~/components/cards/ProductCardV2';
import {Link} from '~/components/elements/Link';
import {Heading} from '~/components/elements/Text';
import {getImageLoadingPriority} from '~/lib/const';
import {useCountdown} from '~/hooks/useCountdown';
import {usePrefixPathWithLocale} from '~/lib/utils';

export function SelectedProduct({selectedProduct}: {selectedProduct: any}) {
  const {newProducts, productsInCollection, showCustomProducts} =
    selectedProduct;

  if (newProducts) {
    return <NewProducts selectedProduct={selectedProduct} />;
  }

  if (productsInCollection) {
    return <ProductsInCollection selectedProduct={selectedProduct} />;
  }

  if (showCustomProducts) {
    return <CustomProducts selectedProduct={selectedProduct} />;
  }

  return <></>;
}

function NewProducts({selectedProduct}: {selectedProduct: any}) {
  const count = selectedProduct.limitItems ?? 12;
  const sortKey = 'CREATED_AT';
  const reverse = true;

  const queryString = useMemo(
    () =>
      Object.entries({count, sortKey, reverse})
        .map(([key, val]) => (val ? `${key}=${val}` : null))
        .join('&'),
    [count, sortKey, reverse],
  );
  const path = usePrefixPathWithLocale(`/api/products?${queryString}`);

  const {load, data} = useFetcher();
  useEffect(() => {
    load(path);
  }, [load, path, queryString]);

  if (!data) {
    return <></>;
  }

  return (
    <SelectedProductContent
      settings={selectedProduct}
      products={data?.products}
    />
  );
}

function ProductsInCollection({selectedProduct}: {selectedProduct: any}) {
  const pageBy = selectedProduct.limitItems ?? 12;
  const id = selectedProduct?.collection?.store?.gid;
  const sortKey = 'CREATED';

  const queryString = useMemo(
    () =>
      Object.entries({pageBy, id, sortKey})
        .map(([key, val]) => (val ? `${key}=${val}` : null))
        .join('&'),
    [pageBy, id, sortKey],
  );
  const path = usePrefixPathWithLocale(`/api/collection?${queryString}`);

  const {load, data} = useFetcher();
  useEffect(() => {
    load(path);
  }, [load, path, queryString]);

  if (!data) {
    return <></>;
  }

  let collectionImage = {};
  if (data.collection.image) {
    collectionImage = {
      id: data.collection.image.id,
      url: data.collection.image.url,
      width: data.collection.image.width,
      height: data.collection.image.height,
      altText: data.collection.image.altText ?? 'Collection image',
    };
  }
  return (
    <SelectedProductContent
      settings={selectedProduct}
      collectionImage={collectionImage}
      products={data?.collection?.products?.nodes}
    />
  );
}

function CustomProducts({selectedProduct}: {selectedProduct: any}) {
  const count = selectedProduct.limitItems ?? 12;
  const sortKey = 'RELEVANCE';
  const query = selectedProduct.customProducts
    .map((item: any) => `'${item?.productWithVariant?.product?.slug}'`)
    .join(' OR ');

  const queryString = useMemo(
    () =>
      Object.entries({count, sortKey, query})
        .map(([key, val]) => (val ? `${key}=${val}` : null))
        .join('&'),
    [count, sortKey, query],
  );
  const path = usePrefixPathWithLocale(`/api/products?${queryString}`);

  const {load, data} = useFetcher();
  useEffect(() => {
    load(path);
  }, [load, path, queryString]);

  if (!data) {
    return <></>;
  }

  return (
    <SelectedProductContent
      settings={selectedProduct}
      products={data?.products}
    />
  );
}

function SelectedProductContent({
  settings,
  products,
  collectionImage,
  loading,
}: {
  settings: any;
  products: any;
  collectionImage?: any;
  loading?: HTMLImageElement['loading'];
}) {
  const {
    carousel,
    quickAdd,
    itemsPerRow,
    limitItems,
    title,
    centerTitle,
    showCollectionImage,
    viewAllLink,
    productCardStyle,
    end,
    start,
    countdown,
  } = settings;

  const [days, hours, minutes, seconds] = useCountdown(end);
  const isStart = new Date().getTime() - new Date(start).getTime() > 0;
  const isEnd = days + hours + minutes + seconds < 0;

  const activeCountdown = isStart && !isEnd;

  const showProducts = countdown ? activeCountdown : true;

  return showProducts ? (
    <div style={{margin: settings?.margin}}>
      <div className="container mb-12 md:mb-20">
        {title && (
          <div
            className={
              centerTitle === true
                ? 'text-center mb-6'
                : 'flex items-center justify-between mb-6'
            }
          >
            <div
              className={`${
                centerTitle === true ? 'justify-center' : ''
              } flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-8`}
            >
              <Heading
                className="text-xl md:text-2xl font-bold uppercase text-heading3"
                as="h3"
              >
                {title}
              </Heading>
              {countdown && ShowCounter(days, hours, minutes)}
            </div>
            {viewAllLink && centerTitle !== true && (
              <Link to={viewAllLink?.slug} className="underline">
                {viewAllLink.title}
              </Link>
            )}
          </div>
        )}
        <div
          className={
            showCollectionImage === true && collectionImage
              ? 'flex flex-col md:flex-row gap-6 items-start'
              : ''
          }
        >
          {showCollectionImage === true && collectionImage && (
            <div className="w-full md:w-1/4 h-full bg-gray-300 card-image aspect-3/4">
              <Image
                alt={collectionImage.altText ? collectionImage.altText : ''}
                data={collectionImage}
                width={collectionImage.width}
                height={collectionImage.height}
                sizes="(max-width: 32em) 100vw, 33vw"
                loading={loading}
              />
            </div>
          )}
          {carousel ? (
            <>
              <ProductCarousel
                settings={settings}
                products={products}
                showTitle={false}
              />
            </>
          ) : (
            <div
              className={
                (itemsPerRow
                  ? 'lg:grid-cols-' + itemsPerRow
                  : 'lg:grid-cols-4') +
                ' w-full grid grid-cols-1 md:grid-cols-3 gap-x-2 md:gap-x-6 gap-y-8'
              }
            >
              {products.map((product: any, index: number) => {
                return index < (limitItems ? limitItems : 8) &&
                  productCardStyle === 'style1' ? (
                  <ProductCardV2
                    key={product.id}
                    // @ts-ignores
                    product={product}
                    quickAdd={quickAdd}
                    loading={getImageLoadingPriority(index)}
                  />
                ) : (
                  <ProductCard
                    key={product.id}
                    // @ts-ignores
                    product={product}
                    quickAdd={quickAdd}
                    loading={getImageLoadingPriority(index)}
                  />
                );
              })}
            </div>
          )}
        </div>
        {viewAllLink && centerTitle == true && (
          <div className="block text-center mt-8">
            <Link
              to={viewAllLink?.slug}
              className="inline-block font-medium px-10 py-3 border border-black text-black rounded-full"
            >
              {viewAllLink.title}
            </Link>
          </div>
        )}
      </div>
    </div>
  ) : (
    <></>
  );
}

function ShowCounter(days: number, hours: number, minutes: number) {
  const {t} = useTranslation();
  return (
    <div className="text-white bg-red-600 rounded-full py-2 px-4">
      {t('global.endsIn')} {days > 0 ? `${days} : ` : ''}
      {`0${hours}`.slice(-2)}
      {' : '}
      {`0${minutes}`.slice(-2)}
    </div>
  );
}
