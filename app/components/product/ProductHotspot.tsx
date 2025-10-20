import Tippy from '@tippyjs/react/headless';
import clsx from 'clsx';

import {Link} from '~/components/elements/Link';
import {ProductCard} from '~/components/cards/ProductCard';

type Props = {
  spotBg?: any;
  spotColor?: any;
  product?: any;
  x: number;
  y: number;
};

export function ProductHotspot({spotBg, spotColor, product, x, y}: Props) {
  if (!product) {
    return null;
  }

  return (
    <Tippy
      placement="top"
      render={() => {
        return (
          <div
            className="bg-white p-4 rounded-lg border border-gray-300"
            style={{width: '286px'}}
          >
            <ProductCard product={product} />
          </div>
        );
      }}
    >
      <button
        className={clsx(
          'absolute left-[50%] top-[50%] flex w-7 h-7 -translate-x-1/2 -translate-y-1/2 animate-pulse items-center justify-center rounded-full bg-offBlack duration-300 ease-out',
          'hover:scale-125 hover:animate-none',
        )}
        style={{
          left: `${x}%`,
          top: `${y}%`,
          backgroundColor: spotBg ? spotBg : '#2B2E2E',
          color: spotColor ? spotColor : '#ffffff',
        }}
      >
        <Link
          className="pointer-events-none lg:pointer-events-auto w-full h-full flex items-center justify-center"
          to={`/products/${product.handle}`}
        >
          <span>+</span>
        </Link>
      </button>
    </Tippy>
  );
}
