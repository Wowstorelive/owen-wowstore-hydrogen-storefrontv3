import {Image} from '@shopify/hydrogen';

import {Heading} from '~/components/elements/Text';
import {Link} from '~/components/elements/Link';
import {IconCaret} from '~/components/elements/Icon';

import {useDirection} from '~/hooks/useDirection';

export function CollectionGrid({data}: {data: any}) {
  const {collectionItems} = data;
  const dir = useDirection();
  const direction = dir === 'ltr' ? 'left' : 'right';
  return (
    <div
      className="mb-12 md:mb-20 overflow-x-hidden"
      style={{margin: data?.margin}}
    >
      <div className={data.fullWidth === true ? '' : 'container'}>
        {data.collectionTitle && (
          <div
            className={
              data.centerTitle === true
                ? 'text-center mb-6'
                : 'flex items-center justify-between mb-6'
            }
          >
            <Heading
              className="text-xl md:text-2xl font-bold text-heading3"
              as="h3"
            >
              {data.collectionTitle}
            </Heading>
          </div>
        )}
        <div
          className={
            (data.itemsPerRowMobile
              ? 'grid-cols-' + data.itemsPerRowMobile
              : '') +
            (data.itemsPerRowTablet
              ? ' md:grid-cols-' + data.itemsPerRowTablet
              : '') +
            (data.itemsPerRow ? ' lg:grid-cols-' + data.itemsPerRow : '') +
            ' grid gap-4 md:gap-6'
          }
        >
          {collectionItems.map((item: any, index: number) => {
            return (
              <div key={item._key}>
                <div className="bg-gray-100 relative w-full h-full">
                  {item?.image && (
                    <Link
                      to={
                        item?.viewAllLink?.slug ? item?.viewAllLink?.slug : '/'
                      }
                      aria-label={item.mainTitle ?? 'View more'}
                    >
                      <div
                        className={
                          (item.mobileRatio
                            ? 'aspect-' + item.mobileRatio
                            : 'aspect-auto') +
                          (item.desktopRatio
                            ? ' md:aspect-' + item.desktopRatio
                            : ' md:aspect-auto') +
                          ' card-image bg-gray-300'
                        }
                      >
                        <Image
                          className="w-full h-full object-cover"
                          alt={item.mainTitle ?? ''}
                          data={item.image}
                          width={item?.image?.width}
                          height={item?.image?.height}
                          sizes="(max-width: 32em) 100vw, 33vw"
                          loading={'lazy'}
                        />
                      </div>
                    </Link>
                  )}

                  <div className="p-4 text-sm">
                    <div className="flex items-center justify-between">
                      {item?.mainTitle && (
                        <p className="uppercase font-medium">
                          {item.mainTitle}
                        </p>
                      )}
                      {item.viewAllLink && (
                        <Link
                          to={item.viewAllLink.slug}
                          className="underline text-red-600"
                        >
                          {item.viewAllLink.title}
                        </Link>
                      )}
                    </div>
                    {item.childItems && (
                      <div className="grid gap-3 mt-4">
                        {item.childItems.map((childItem: any) => (
                          <Link
                            to={childItem.slug}
                            key={childItem._key}
                            className="flex items-center hover:text-red-600 hover:underline"
                          >
                            {childItem.title}
                            <IconCaret direction={direction} />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
