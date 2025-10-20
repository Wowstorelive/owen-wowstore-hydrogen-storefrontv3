import {useEffect, useMemo} from 'react';
import {useFetcher} from '@remix-run/react';
import {Tab} from '@headlessui/react';
import {useTranslation} from 'react-i18next';

import {Link} from '~/components/elements/Link';
import {Heading} from '~/components/elements/Text';
import {getImageLoadingPriority} from '~/lib/const';
// @ts-ignore
import {ProductCarousel} from '~/components/product/ProductCarousel';
import {ProductCard} from '~/components/cards/ProductCard';
import {ProductCardV2} from '~/components/cards/ProductCardV2';
import {usePrefixPathWithLocale} from '~/lib/utils';

export function CollectionTabs({collectionTabs}: {collectionTabs: any}) {
  const {limitItems, collections} = collectionTabs;

  const query = collections
    .map((collection: any) => {
      return `title:'${collection.title}'`;
    })
    .join(' OR ');

  const count = collections.length ?? 4;
  const limit = limitItems ?? 8;

  const queryString = useMemo(
    () =>
      Object.entries({count, query, limit})
        .map(([key, val]) => (val ? `${key}=${val}` : null))
        .join('&'),
    [count, query, limit],
  );

  const path = usePrefixPathWithLocale(`/api/collections?${queryString}`);
  const {load, data} = useFetcher();
  useEffect(() => {
    load(path);
  }, [load, path, queryString]);

  if (!data) {
    return <></>;
  }

  return (
    <CollectionTabsContent
      settings={collectionTabs}
      collections={data?.collections?.nodes}
    />
  );
}

function CollectionTabsContent({
  settings,
  collections,
}: {
  settings: any;
  collections: any;
}) {
  const {
    carousel,
    quickAdd,
    limitItems,
    title,
    centerTitle,
    viewAll,
    productCardStyle,
  } = settings;

  const {t} = useTranslation();

  return (
    <div style={{margin: settings?.margin}}>
      <div className="container mb-12 md:mb-20 overflow-x-hidden">
        <Tab.Group>
          <div
            className={
              centerTitle === true
                ? ''
                : 'md:flex items-center justify-between mb-6'
            }
          >
            {title && (
              <div className="flex items-center justify-center">
                <Heading
                  className="text-xl md:text-2xl font-bold uppercase text-heading3"
                  as="h3"
                >
                  {title}
                </Heading>
              </div>
            )}
            <Tab.List
              className={
                (centerTitle === true ? 'mt-3 mb-8' : 'py-1') +
                ' flex gap-x-8 justify-center'
              }
            >
              {(collections || []).map((collection: any) => {
                return (
                  <Tab className="" key={collection.handle}>
                    {({selected}) => (
                      <span
                        className={`${
                          selected
                            ? 'border-b-2 border-black pb-1'
                            : 'text-gray-500'
                        }`}
                      >
                        {collection.title}
                      </span>
                    )}
                  </Tab>
                );
              })}
            </Tab.List>
          </div>
          <Tab.Panels>
            {(collections || []).map((collection: any) => {
              const products = collection.products.nodes;

              return (
                <Tab.Panel key={collection.handle}>
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
                        settings.scrollMobile && settings.itemsPerRow > 2
                          ? 'scrollMobile'
                          : ''
                      }
                    >
                      <div
                        className={
                          (settings.itemsPerRowMobile
                            ? 'grid-cols-' + settings.itemsPerRowMobile
                            : '') +
                          (settings.itemsPerRowTablet
                            ? ' md:grid-cols-' + settings.itemsPerRowTablet
                            : ' md:grid-cols-2') +
                          (settings.itemsPerRow
                            ? ' lg:grid-cols-' + settings.itemsPerRow
                            : ' lg:grid-cols-4') +
                          ' grid gap-4 md:gap-6'
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
                        {settings.scrollMobile && settings.itemsPerRow > 2 && (
                          <div className="lg:hidden">&nbsp;</div>
                        )}
                      </div>
                    </div>
                  )}
                  {viewAll == true && (
                    <p className="text-center mt-8 md:mt-12">
                      <Link
                        to={'/collections/' + collection?.handle}
                        className="inline-block font-medium px-10 py-3 border border-black text-black rounded-full"
                      >
                        {t('button.viewMore')}
                      </Link>
                    </p>
                  )}
                </Tab.Panel>
              );
            })}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}
