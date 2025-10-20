import {PortableText as Text} from '@portabletext/react';
import {Image} from '@shopify/hydrogen';

import {getImageLoadingPriority} from '~/lib/const';

interface flexSettings {
  direction: 'row' | 'column';
  reverse: boolean;
}

export function ImageWithText({data}: {data: any}) {
  const {banner, textContent, imagePosition, margin, maxWidth, textAlign} =
    data;

  const flexSettings = getFlexSettings(imagePosition);

  return (
    <div className="mb-12 md:mb-20" style={{margin}}>
      <div className="container" style={{maxWidth}}>
        <div
          className="gap-8 md:gap-12 block md:flex items-center"
          style={{
            flexDirection: `${flexSettings.direction}${
              flexSettings.reverse ? '-reverse' : ''
            }`,
          }}
        >
          <div
            className={
              (imagePosition == 'top' ? 'max-w-3xl' : 'md:w-1/2') +
              ' w-full mb-6 md:mb-0'
            }
          >
            <Image
              alt={banner.altText ?? 'Banner'}
              data={banner}
              sizes="(max-width: 32em) 100vw, 33vw"
              crop="center"
              loading={getImageLoadingPriority(2)}
            />
          </div>
          {textContent && (
            <div
              className={
                (imagePosition == 'top' ? '' : 'md:w-1/2 ') + 'article'
              }
              style={{textAlign}}
            >
              <Text value={textContent} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const getFlexSettings = (
  imagePosition: 'top' | 'right' | 'bottom',
): flexSettings => {
  let direction: 'row' | 'column' = 'row';
  let reverse = false;

  if (imagePosition === 'right') {
    reverse = true;
  }

  if (imagePosition === 'top' || imagePosition === 'bottom') {
    direction = 'column';
  }

  if (imagePosition === 'bottom') {
    reverse = true;
  }

  return {
    direction,
    reverse,
  };
};
