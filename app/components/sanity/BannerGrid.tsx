import {Image} from '@shopify/hydrogen';
import React from 'react';

import {ButtonLink} from '~/components/elements/ButtonLink';
import {Heading, Text} from '~/components/elements/Text';
import {Link} from '~/components/elements/Link';
import {Grid} from '~/components/elements/Grid';

import {getImageLoadingPriority} from '~/lib/const';

export function BannerGrid({bannerGrid}: {bannerGrid: any}) {
  const {bannerItems} = bannerGrid;

  if (bannerGrid?.bannerStyle === 'style1') {
    return <BannerGridStyle1 bannerData={bannerGrid} />;
  }

  return (
    <div
      className="mb-12 md:mb-20 overflow-x-hidden"
      style={{margin: bannerGrid?.margin}}
    >
      <div className={bannerGrid.fullWidth == true ? '' : 'container'}>
        {bannerGrid.bannerTitle && (
          <div
            className={
              bannerGrid.centerTitle == true
                ? 'text-center mb-6'
                : 'flex items-center justify-between mb-6'
            }
          >
            <Heading
              className="text-xl md:text-2xl font-bold text-heading3"
              as="h3"
            >
              {bannerGrid.bannerTitle}
            </Heading>
            {bannerGrid.viewAllLink && bannerGrid.centerTitle !== true && (
              <Link to={bannerGrid.viewAllLink.slug} className="underline">
                {bannerGrid.viewAllLink.title}
              </Link>
            )}
          </div>
        )}
        <div
          className={
            bannerGrid.scrollMobile && bannerGrid.itemsPerRow > 2
              ? 'scrollMobile'
              : ''
          }
        >
          <div
            className={
              (bannerGrid.itemsPerRowMobile
                ? 'grid-cols-' + bannerGrid.itemsPerRowMobile
                : '') +
              (bannerGrid.itemsPerRowTablet
                ? ' md:grid-cols-' + bannerGrid.itemsPerRowTablet
                : '') +
              (bannerGrid.itemsPerRow
                ? ' lg:grid-cols-' + bannerGrid.itemsPerRow
                : '') +
              ' grid gap-4 md:gap-6 items-center'
            }
          >
            {bannerItems.map((item: any, index: number) => {
              return (
                <div key={item._key}>
                  <div className="grid relative w-full h-full">
                    {item?.image && (
                      <Link
                        to={item?.link?.slug ? item?.link?.slug : '/'}
                        aria-label={item.caption ?? 'View more'}
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
                            alt={item.title ? item.title : ''}
                            data={item.image}
                            width={item?.image?.width}
                            height={item?.image?.height}
                            sizes="(max-width: 32em) 40vw, 33vw"
                            loading={'lazy'}
                          />
                        </div>
                      </Link>
                    )}

                    <div
                      className={`${
                        item.textPosition === 'left'
                          ? `left-0 text-left top-1/2 -translate-y-1/2 `
                          : item.textPosition === 'right'
                          ? `right-0 text-right top-1/2 -translate-y-1/2 `
                          : item.textPosition === 'center'
                          ? `left-0 right-0 mx-auto text-center top-1/2 -translate-y-1/2 `
                          : item.textPosition === 'bottomRight'
                          ? `right-0 bottom-0 text-right `
                          : item.textPosition === 'bottomCenter'
                          ? `left-0 right-0 bottom-0 mx-auto text-center `
                          : `left-0 bottom-0 text-center `
                      }
                      ${item.showButton == true ? 'z-10 ' : ''}
                      ${
                        item.textPosition === 'bottomImage'
                          ? 'mt-2 md:mt-3'
                          : 'absolute'
                      }`}
                    >
                      <div
                        className={`${
                          item.textPosition === 'bottomImage'
                            ? ''
                            : 'text-white p-6 lg:p-12'
                        } w-full`}
                        style={{
                          color: item?.textColor,
                          maxWidth: item?.maxwidthContent,
                        }}
                      >
                        {item?.caption && (
                          <p className="mb-2 text-base md:text-lg">
                            {item.caption}
                          </p>
                        )}
                        {item?.title && (
                          <Heading
                            as="h4"
                            className="text-2xl lg:text-4xl font-bold"
                          >
                            {item.title} <br />
                            {item.titleLine2 && item.titleLine2}
                          </Heading>
                        )}
                        {item?.text && (
                          <p className="text-base md:text-lg font-normal mt-2">
                            {item.text}
                          </p>
                        )}
                        {item.link && item.showButton == true && (
                          <ButtonLink
                            className="mt-5"
                            link={item?.link?.slug}
                            style={
                              item?.buttonStyle ? item?.buttonStyle : 'style1'
                            }
                            text={item?.buttonText}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {bannerGrid.scrollMobile && bannerGrid.itemsPerRow > 2 && (
              <div className="lg:hidden">&nbsp;</div>
            )}
          </div>
        </div>
        {bannerGrid.viewAllLink && bannerGrid.centerTitle == true && (
          <div className="block text-center mt-5">
            <Link
              to={bannerGrid.viewAllLink.slug}
              className="inline-block font-medium px-10 py-3 border border-black text-black rounded-full"
            >
              {bannerGrid.viewAllLink.title}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function BannerGridStyle1({bannerData}: {bannerData: any}) {
  return (
    <section className="container mb-20" style={{margin: bannerData?.margin}}>
      <Grid items={4} className="layout">
        {bannerData.bannerItems.map((item: any, index: number) => {
          return (
            <React.Fragment key={item._key}>
              <div className="relative w-full h-full text-white layout-item">
                {item?.image && (
                  <Link
                    to={item?.link?.slug ? item?.link?.slug : '/'}
                    aria-label={item.caption ?? 'View more'}
                  >
                    <div
                      className={
                        (item.mobileRatio
                          ? 'aspect-' + item.mobileRatio
                          : 'aspect-auto') +
                        (item.desktopRatio
                          ? ' md:aspect-' + item.desktopRatio
                          : ' md:aspect-auto') +
                        ' card-image bg-gray-300 layout-img'
                      }
                    >
                      <Image
                        alt={item.title ? item.title : ''}
                        data={item.image}
                        width={item?.image?.dimensions?.width}
                        height={item?.image?.dimensions?.height}
                        sizes="(max-width: 32em) 100vw, 33vw"
                        loading={getImageLoadingPriority(index, 2)}
                      />
                    </div>
                  </Link>
                )}
                <div
                  className={`${
                    item.textPosition === 'left'
                      ? `left-0 text-left top-1/2 -translate-y-1/2 `
                      : item.textPosition === 'right'
                      ? `right-0 text-right top-1/2 -translate-y-1/2 `
                      : item.textPosition === 'center'
                      ? `left-0 right-0 mx-auto text-center top-1/2 -translate-y-1/2 `
                      : item.textPosition === 'bottomRight'
                      ? `right-0 bottom-0 text-right `
                      : item.textPosition === 'bottomCenter'
                      ? `left-0 right-0 bottom-0 mx-auto text-center `
                      : `left-0 bottom-0 text-left `
                  }
                    ${item.showButton == true ? 'z-10' : ''} absolute`}
                >
                  <div
                    className="w-full text-white p-6 lg:p-8"
                    style={{color: item?.textColor}}
                  >
                    {item?.caption && (
                      <Text as="p" className="">
                        {item.caption}
                      </Text>
                    )}
                    {item?.title && (
                      <Heading as="h4" className="mt-1 text-2xl">
                        {item.title} <br />
                        {item.titleLine2 && item.titleLine2}
                      </Heading>
                    )}
                    {item?.text && (
                      <Text as="p" className="mt-1 text-sm" size="lead">
                        {item.text}
                      </Text>
                    )}
                    {item.link && item.showButton == true && (
                      <ButtonLink
                        className="mt-4"
                        link={item?.link?.slug}
                        style={item?.buttonStyle ? item?.buttonStyle : 'style1'}
                        text={item?.buttonText}
                      />
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </Grid>
    </section>
  );
}
