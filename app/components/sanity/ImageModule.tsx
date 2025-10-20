import {useEffect, useMemo} from 'react';
import {useFetcher} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';

import {usePrefixPathWithLocale} from '~/lib/utils';
import {ProductHotspot} from '~/components/product/ProductHotspot';
import {Link} from '~/components/elements/Link';

type Props = {
  module: any;
};

export function ImageModule({module}: Props) {
  if (!module.image) {
    return null;
  }
  return <ImageModuleContent module={module} />;
}

function ImageModuleContent({module}: {module: any}) {
  const count = 8;
  const query = module.productHotspots
    .map((item: any) => `'${item.product.slug}'`)
    .join(' OR ');

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

  if (!data) {
    return (
      <div className="mb-12 md:mb-20 relative" style={{margin: module?.margin}}>
        <div className={module.fullWidth ? '' : 'container'}>
          <div
            className="bg-gray-300"
            style={{aspectRatio: module.image?.width / module.image?.height}}
          >
            &nbsp;
          </div>
        </div>
      </div>
    );
  }

  const {productHotspots, caption, callToAction} = module;
  const {products} = data;

  return (
    <div className="mb-12 md:mb-20 relative" style={{margin: module?.margin}}>
      <div className={module.fullWidth ? '' : 'container'}>
        <div
          className="bg-gray-300"
          style={{aspectRatio: module.image?.width / module.image?.height}}
        >
          {callToAction ? (
            <Link className="group" to={module.callToAction.link}>
              <Image
                alt={module.image?.altText ?? 'Image hotspot'}
                data={module.image}
                width={module.image?.width}
                height={module.image?.height}
                loading={'lazy'}
                sizes={'(max-width: 48em) 40vw, 30vw'}
                className="w-full"
              />
            </Link>
          ) : (
            <Image
              alt={module.image?.altText ?? 'Image hotspot'}
              data={module.image}
              width={module.image?.width}
              height={module.image?.height}
              loading={'lazy'}
              sizes={'(max-width: 48em) 40vw, 30vw'}
              className="w-full"
            />
          )}
        </div>
        {caption && (
          <div className="mt-2 max-w-lg text-sm leading-caption">
            {module.caption}
          </div>
        )}
        {productHotspots && (
          <>
            {productHotspots.map((hotspot: any) => {
              const product = products.find((value: any) => value?.handle === hotspot?.product?.slug);
              return (
                <ProductHotspot
                  key={hotspot._key}
                  spotBg={hotspot.spotBg}
                  spotColor={hotspot.spotColor}
                  product={product}
                  x={hotspot.x}
                  y={hotspot.y}
                />
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
