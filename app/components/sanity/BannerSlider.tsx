import {Image} from '@shopify/hydrogen';
import {useState, useEffect, useRef, useCallback} from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

import {
  PrevButton,
  NextButton,
} from '~/components/elements/EmblaCarouselButtons';

import {Heading, Text} from '~/components/elements/Text';
import {Link} from '~/components/elements/Link';
import {ButtonLink} from '~/components/elements/ButtonLink';
import {useDirection} from '~/hooks/useDirection';

export function BannerSlider({sliderData}: {sliderData: any}) {
  const direction = useRef(useDirection());
  const autoplay = useRef(Autoplay({delay: 6000, stopOnInteraction: false}));

  const [emblaRef, embla] = useEmblaCarousel(
    {
      loop: sliderData?.loop,
      slidesToScroll: 'auto',
      containScroll: 'trimSnaps',
      direction: direction.current,
    },
    [autoplay.current],
  );

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  const scrollPrev = useCallback(() => {
    embla && embla.scrollPrev();
  }, [embla]);

  const scrollNext = useCallback(() => {
    embla && embla.scrollNext();
  }, [embla]);

  const onSelect = useCallback(() => {
    if (!embla) return;
    setPrevBtnEnabled(embla.canScrollPrev());
    setNextBtnEnabled(embla.canScrollNext());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    onSelect();
    embla.on('select', onSelect);
  }, [embla, onSelect]);

  useEffect(() => {
    if (sliderData?.autoPlay == false) {
      autoplay.current.stop();
    }
  }, [sliderData, embla]);

  let itemClass = '';
  switch (sliderData.itemsPerSlider) {
    case 2:
      itemClass = 'min-w-full md:min-w-1/2';
      break;
    case 3:
      itemClass = 'min-w-full md:min-w-1/3';
      break;
    case 4:
      itemClass = 'min-w-full md:min-w-1/3 lg:min-w-1/4';
      break;
    case 5:
      itemClass = 'min-w-full md:min-w-1/3 lg:min-w-1/5';
      break;
    case 6:
      itemClass = 'min-w-full md:min-w-1/3 lg:min-w-1/6';
      break;
    default:
      itemClass = 'min-w-full';
      break;
  }

  return (
    <div className="mb-12 md:mb-20" style={{margin: sliderData?.margin}}>
      <div className={sliderData.fullWidth == true ? '' : 'container'}>
        {sliderData.sliderTitle && (
          <div className="flex items-center justify-between gap-4 mb-6">
            <Heading
              className="text-xl md:text-2xl font-bold text-heading3"
              as="h3"
            >
              {sliderData.sliderTitle}
            </Heading>
            {sliderData.viewAllLink && (
              <Link to={sliderData.viewAllLink.slug} className="underline">
                {sliderData.viewAllLink.title}
              </Link>
            )}
          </div>
        )}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-6 will-change-transform">
              {sliderData?.banners.map((slider: any, i: number) => {
                return (
                  <div
                    key={slider._key}
                    className={itemClass + ' pl-6 relative flex-auto'}
                  >
                    <div className="relative w-full h-full">
                      {slider?.image && (
                        <Link to={slider?.link ? slider?.link?.slug : '/'}>
                          <div
                            className={
                              (slider.mobileRatio
                                ? 'aspect-' + slider.mobileRatio
                                : 'aspect-auto') +
                              (slider.desktopRatio
                                ? ' md:aspect-' + slider.desktopRatio
                                : ' md:aspect-auto') +
                              ' card-image bg-gray-300'
                            }
                          >
                            <Image
                              alt={slider.title}
                              data={slider.image}
                              width={slider?.image?.width}
                              height={slider?.image?.height}
                              loading={i === 0 ? 'eager' : 'lazy'}
                              sizes={'(max-width: 48em) 40vw, 30vw'}
                            />
                          </div>
                        </Link>
                      )}
                      <div
                        className={`${
                          slider.textPosition === 'left'
                            ? `left-0 md:left-12 lg:left-28`
                            : slider.textPosition === 'right'
                            ? `right-0 md:left-12 lg:left-auto lg:right-40`
                            : `left-0 right-0 mx-auto text-center`
                        } absolute z-10 px-6 lg:px-0 top-1/2 -translate-y-1/2`}
                      >
                        <div
                          className="max-w-xl mx-auto text-white mb-3 md:mb-0"
                          style={{
                            color: slider?.textColor,
                            maxWidth: slider?.maxwidthContent,
                          }}
                        >
                          {slider?.caption && (
                            <Text
                              as="p"
                              className="mb-2 text-base md:text-xl"
                              size="lead"
                            >
                              {slider.caption}
                            </Text>
                          )}
                          {slider?.title && (
                            <h4 className="text-3xl lg:text-6xl font-bold">
                              {slider.title} <br />
                              {slider.titleLine2 && slider.titleLine2}
                            </h4>
                          )}
                          {slider?.text && (
                            <Text as="p" className="mt-2 lg:mt-4" size="lead">
                              {slider.text}
                            </Text>
                          )}
                          {slider.link && slider.showButton == true && (
                            <ButtonLink
                              className="mt-5 md:mt-6"
                              link={slider?.link?.slug}
                              style={
                                slider?.buttonStyle
                                  ? slider?.buttonStyle
                                  : 'style1'
                              }
                              text={slider?.buttonText}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {sliderData?.banners.length > 1 && (
            <>
              <PrevButton onClick={scrollPrev} enabled={prevBtnEnabled} />
              <NextButton onClick={scrollNext} enabled={nextBtnEnabled} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
