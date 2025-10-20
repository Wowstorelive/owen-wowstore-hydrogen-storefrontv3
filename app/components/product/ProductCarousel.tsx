import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import {useCallback, useEffect, useRef, useState} from 'react';

import type {HomepageFeaturedProductsQuery} from 'storefrontapi.generated';
import {ProductCard} from '~/components/cards/ProductCard';
import {ProductCardV2} from '~/components/cards/ProductCardV2';
import {Heading} from '~/components/elements/Text';
import {
  PrevButton,
  NextButton,
} from '~/components/elements/EmblaCarouselButtons';
import {useDirection} from '~/hooks/useDirection';
const mockProducts = {
  nodes: new Array(12).fill(''),
};

type ProductCarouselProps = HomepageFeaturedProductsQuery & {
  title?: string;
  showTitle?: boolean;
  settings?: any;
};

export function ProductCarousel({
  title = 'Featured Products',
  products = mockProducts,
  settings,
  showTitle = true,
}: ProductCarouselProps) {
  const direction = useRef(useDirection());
  const autoplay = useRef(
    Autoplay(
      {delay: 5000, stopOnMouseEnter: true, stopOnInteraction: false},
      // @ts-ignore
      (emblaRoot) => emblaRoot.parentElement,
    ),
  );

  const {itemsPerRow, limitItems, productCardStyle} = settings;

  const loop = false;

  const [emblaRef, embla] = useEmblaCarousel(
    {
      loop,
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
    if (!settings?.autoPlay) {
      autoplay.current.stop();
    }
  }, [settings, embla]);

  let itemClass = '';
  switch (itemsPerRow) {
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
      itemClass = 'min-w-full md:min-w-1/3 lg:min-w-1/4 xl:min-w-1/5';
      break;
    case 6:
      itemClass = 'min-w-full md:min-w-1/3 lg:min-w-1/5 xl:min-w-1/6';
      break;
    default:
      itemClass = 'min-w-full';
      break;
  }

  return (
    <div className="w-full overflow-hidden relative">
      {showTitle && (
        <Heading
          className="text-xl md:text-2xl font-bold uppercase mb-6 text-heading3"
          as="h3"
        >
          {title}
        </Heading>
      )}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-6 will-change-transform">
          {products.map((product: any, index: number) => {
            return (
              index < (limitItems ? limitItems : 8) && (
                <div
                  key={product.id}
                  className={itemClass + ' pl-6 relative flex-auto'}
                >
                  {productCardStyle === 'style1' ? (
                    <ProductCardV2
                      product={product}
                      quickAdd={settings.quickAdd}
                    />
                  ) : (
                    <ProductCard
                      product={product}
                      quickAdd={settings.quickAdd}
                    />
                  )}
                </div>
              )
            );
          })}
          {products.length < itemsPerRow && (
            <>
              {[...Array(itemsPerRow - products.length)].map((x, i) => (
                <div
                  // eslint-disable-next-line react/no-array-index-key
                  key={i}
                  className={
                    itemClass +
                    ' pl-6 relative flex-auto sm-max:min-w-0 sm-max:p-0'
                  }
                >
                  &nbsp;
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      <div
        className={
          products.length == 1
            ? 'hidden'
            : products.length <= itemsPerRow
            ? 'lg:hidden'
            : ''
        }
      >
        <PrevButton
          onClick={scrollPrev}
          enabled={prevBtnEnabled}
          buttonColor="black"
          centerImage={true}
        />
        <NextButton
          onClick={scrollNext}
          enabled={nextBtnEnabled}
          buttonColor="black"
          centerImage={true}
        />
      </div>
    </div>
  );
}
