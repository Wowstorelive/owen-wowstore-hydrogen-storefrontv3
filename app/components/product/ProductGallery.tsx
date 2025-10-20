import React from 'react';
import type {MediaImage} from '@shopify/hydrogen/storefront-api-types';
import {Image} from '@shopify/hydrogen';
import type {
  MediaFragment,
  ProductVariantFragmentFragment,
} from 'storefrontapi.generated';
import {ATTR_LOADING_EAGER} from '~/lib/const';

/**
 * A client component that defines a media gallery for hosting images, 3D models, and videos of products
 */
export function ProductGallery({
  media,
  selectedVariant,
  className,
}: {
  media: MediaFragment[];
  selectedVariant: ProductVariantFragmentFragment;
  className?: string;
}) {

  if (!media.length) {
    return null;
  }

  const selectedColor = selectedVariant.selectedOptions.find((option: any) => {
    return option?.name === 'Color';
  });

  return (
    <div
      className={`
      product-gallery swimlane md:grid-flow-row hiddenScroll md:p-0 md:overflow-x-auto gap-[2px]
      ${className} 
      ${media.length === 1 ? '' : ' lg:grid-cols-2'}`}
    >
      {media.map((med, i) => {
        let mediaProps: Record<string, any> = {};
        const data = {
          ...med,
          image: {
            ...med.image,
            altText: med.alt || 'Product image',
          },
        } as MediaImage;

        switch (med.mediaContentType) {
          case 'IMAGE':
            mediaProps = {
              width: 800,
              widths: [400, 800, 1200, 1600, 2000, 2400],
            };
            break;
          case 'VIDEO':
            mediaProps = {
              width: '100%',
              autoPlay: true,
              controls: false,
              muted: true,
              loop: true,
              preload: 'auto',
            };
            break;
          case 'EXTERNAL_VIDEO':
            mediaProps = {width: '100%', height: '100%'};
            break;
          case 'MODEL_3D':
            mediaProps = {
              width: '100%',
              interactionPromptThreshold: '0',
              ar: true,
              loading: ATTR_LOADING_EAGER,
              disableZoom: true,
            };
            break;
        }

        if (i === 0 && med.mediaContentType === 'IMAGE') {
          mediaProps.loading = ATTR_LOADING_EAGER;
        }

        return (
          <React.Fragment key={med.id}>
            {selectedColor ? (
              <>
                {med.alt === selectedColor.value && (
                  <div
                    className={`
                    aspect-square snap-center w-mobileGallery md:w-full 
                    ${med.mediaContentType === 'EXTERNAL_VIDEO' ? 'card-video bg-black' : 'card-image bg-gray-100'}
                    `}
                  >
                    {(med as MediaImage).image && (
                      <Image
                        loading={i === 0 ? 'eager' : 'lazy'}
                        data={data.image ?? {}}
                        alt={data.image!.altText!}
                        width={300}
                        className="w-full h-full aspect-square object-cover"
                        sizes={'(min-width: 48em) 40vw, 30vw'}
                      />
                    )}
                    {med.mediaContentType === 'VIDEO' && (
                      <video
                        preload="none"
                        autoPlay={true}
                        muted
                        loop
                        playsInline
                        className="z-10 w-full h-full"
                      >
                        <source
                          src={med.sources[0].url}
                          type={med.sources[0].mimeType}
                        />
                      </video>
                    )}
                    {med.mediaContentType === 'EXTERNAL_VIDEO' && (
                      <iframe width={mediaProps?.width} height={mediaProps?.height} src={med.embedUrl} loading="lazy" />
                    )}
                  </div>
                )}
              </>
            ) : (
              <div
                className={`
                aspect-square snap-center w-mobileGallery md:w-full 
                ${med.mediaContentType === 'EXTERNAL_VIDEO' ? 'card-video bg-black' : 'card-image bg-gray-100'}
                `}
              >
                {(med as MediaImage).image && (
                  <Image
                    loading={i === 0 ? 'eager' : 'lazy'}
                    data={data.image ?? {}}
                    alt={data.image!.altText!}
                    width={300}
                    className="w-full h-full aspect-square object-cover"
                    sizes={'(min-width: 48em) 40vw, 30vw'}
                  />
                )}
                {med.mediaContentType === 'EXTERNAL_VIDEO' && (
                  <iframe width={mediaProps?.width} height={mediaProps?.height} src={med.embedUrl} loading="lazy" />
                )}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
