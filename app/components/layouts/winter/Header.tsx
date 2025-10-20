import {
  useParams,
  Form,
  Await,
  useLocation,
  useRouteLoaderData,
  useAsyncValue
} from '@remix-run/react';

import {
  Image,
  CartForm,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {Suspense, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {useIsHomePath} from '~/lib/utils';
import {
  IconAccount,
  IconCart,
  IconSearch,
  IconMenu,
  IconSupport,
  IconHeartEmpty,
  IconCompare,
  IconClose,
} from '~/components/elements/Icon';

import {Input} from '~/components/elements/Input';
import {Link} from '~/components/elements/Link';
import {Social} from '~/components/elements/Social';

import {useIsHydrated} from '~/hooks/useIsHydrated';
import {useCartFetchers} from '~/hooks/useCartFetchers';
import {MegaMenu} from '~/components/sanity/MegaMenu';
import {CountdownTimer} from '~/components/sanity/CountdownTimer';
import {CartDrawer} from '~/components/global/CartDrawer';
import {useDrawer} from '~/components/global/Drawer';
import {MenuDrawer} from '~/components/global/MenuDrawer';
import {useStoreContext} from '~/components/global/StoreContext';
import {CompareDrawer} from '~/components/global/CompareDrawer';
import {CountrySelector} from '~/components/CountrySelector';
import type {RootLoader} from '~/root';
import Recommendation from '~/components/search/Recommendation';

export function Header({
  title,
  menu,
  settings,
}: {
  title: string;
  menu?: any;
  settings?: any;
}) {
  const isHome = useIsHomePath();
  const location = useLocation();
  const {
    isOpen: isCartOpen,
    openDrawer: openCart,
    closeDrawer: closeCart,
  } = useDrawer();

  const {
    isOpen: isCompareOpen,
    openDrawer: openCompare,
    closeDrawer: closeCompare,
  } = useDrawer();

  const {
    isOpen: isMenuOpen,
    openDrawer: openMenu,
    closeDrawer: closeMenu,
  } = useDrawer();

  const rootData = useRouteLoaderData<RootLoader>('root');
  const isLoggedIn = rootData?.isLoggedIn;
  const {wishlistCounter: totalWishlist, compareCounter: totalCompare} =
    useStoreContext() as any;

  const addToCartFetchers = useCartFetchers(CartForm.ACTIONS.LinesAdd);
  const logo = settings[0]?.header?.logo;
  const social = settings[0]?.social;
  const topLinks = settings[0]?.header?.topLinks;
  const shippingText = settings[0]?.other?.shippingText;
  const phoneNumber = settings[0]?.other?.phoneNumber;
  // toggle cart drawer when adding to cart
  useEffect(() => {
    if (isCartOpen || !addToCartFetchers.length) return;
    openCart();
  }, [addToCartFetchers, isCartOpen, openCart]);

  useEffect(() => {
    if (location.pathname.includes('/compare')) {
      closeCompare();
      return;
    }
    window.addEventListener('comparechange', () => {
      openCompare();
    });
    if (isCompareOpen) return;
  }, [isCompareOpen, openCompare, closeCompare, location.pathname]);

  return (
    <>
      <CountdownTimer settings={settings} />
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
      <CompareDrawer isOpen={isCompareOpen} onClose={closeCompare} />
      {menu && (
        <MenuDrawer isOpen={isMenuOpen} onClose={closeMenu} menu={menu} />
      )}
      <DesktopHeader
        isHome={isHome}
        title={title}
        menu={menu}
        logo={logo}
        socials={social}
        topLinks={topLinks}
        openCart={openCart}
        shippingText={shippingText}
        phoneNumber={phoneNumber}
        isLoggedIn={isLoggedIn}
        totalWishlist={totalWishlist}
        totalCompare={totalCompare}
      />
      <MobileHeader
        isHome={isHome}
        title={title}
        logo={logo}
        openCart={openCart}
        openMenu={openMenu}
        isLoggedIn={isLoggedIn}
      />
    </>
  );
}

function DesktopHeader({
  isHome,
  isLoggedIn,
  menu,
  logo,
  openCart,
  totalWishlist,
  title,
  socials,
  topLinks,
  shippingText,
  phoneNumber,
  totalCompare,
}: {
  isHome: boolean;
  isLoggedIn: boolean;
  openCart: () => void;
  totalWishlist: number;
  menu?: any;
  logo?: any;
  title: string;
  socials?: any;
  topLinks?: any;
  shippingText?: string;
  phoneNumber?: string;
  totalCompare: number;
}) {
  const params = useParams();
  const {t} = useTranslation();
  const [valueSearch, setValueSearch] = useState('');
  const [show, setShow] = useState(false);
  const location = useLocation();

  const showResultSearch = (e: any) => {
    const textSearch = e.target.value;
    setValueSearch(textSearch);

    if (!textSearch) {
      setShow(false);
    } else {
      setShow(true);
    }
  };

  useEffect(() => {
    if(location.pathname) {
      setShow(false);
    }
  }, [location])

  return (
    <header
      role="banner"
      className="z-30 text-black flex-col hidden leading-none bg-white lg:flex header-style"
    >
      <div className="h-10 bg-gray-200 topbar-style">
        <div className="container flex items-center justify-between h-10">
          <div className="flex items-center gap-6 text-sm font-medium">
            {(topLinks || []).map((item: any) => (
              <Link
                key={item._key}
                to={item?.slug}
                target={item?.newWindow ? '_blank' : '_self'}
              >
                {item?.title}
              </Link>
            ))}
          </div>
          <div className="flex items-center">
            <div className="mx-2">
              <Social socials={socials} />
            </div>
            <div className="text-sm">
              <CountrySelector showLabel={false} hasBorder={false} />
            </div>
          </div>
        </div>
      </div>
      <div className="container relative flex items-center justify-between py-4 gap-x-14">
        <Link to={'/'} className="min-w-32">
          {logo ? (
            <Image
              alt={title}
              className={`w-auto max-h-10`}
              data={logo}
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          ) : (
            <span>{title ? title : 'Owen Store'}</span>
          )}
        </Link>
        <div className="flex items-center w-full gap-x-8">
          <div className="w-full">
            <div className='w-full relative flex items-center gap-8 text-black'>
            <Form
              method="get"
              action={params.locale ? `/${params.locale}/search` : '/search'}
              className="flex items-center w-full gap-8"
            >
              {
                show ? <IconClose 
                  className='absolute w-7 h-7 z-30 flex items-center justify-center right-2 rounded-full cursor-pointer' 
                  onClick={() => setShow(false)}
                /> : (
                  <button
                    type="submit"
                    className="bg-amber-500 absolute w-8 h-8 z-30 flex items-center justify-center right-2 rounded-full"
                  >
                    <IconSearch />
                  </button>
                )
              }
              <Input
                type="text"
                className="w-full h-10 border border-black border-opacity-10 rounded-3xl px-6 bg-black bg-opacity-10 placeholder-current placeholder-opacity-50"
                placeholder={t('fields.search')}
                name="q"
                variant=""
                onChange={(e) => showResultSearch(e)}
              />
            </Form>
            </div>
            {
              show && <Recommendation valueSearch={valueSearch} customClass="mt-4" />
            }
          </div>
          <div className="flex items-center justify-center gap-4 min-w-52">
            <IconSupport className="w-8 h-8" />
            <div>
              <div className="text-xs font-semibold uppercase">
                {t('header.hotlineText')}
              </div>
              <p className="tracking-wide">{phoneNumber ?? ''}</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 min-w-56">
            <Link
              to="/account"
              aria-label="Account"
              className="flex items-center flex-col gap-1"
            >
              <Suspense fallback={<IconAccount width="23" height="25" />}>
                <Await resolve={isLoggedIn} errorElement={<IconAccount width="23" height="25" />}>
                  <IconAccount width="23" height="25" />
                  <span className="text-[10px] uppercase">
                    {t('header.account')}
                  </span>
                </Await>
              </Suspense>
            </Link>
            <Link
              to={'/compare'}
              aria-label="Compare"
              className="flex items-center flex-col"
            >
              <span className="relative">
                <IconCompare className="text-3xl" />
                {totalCompare > 0 && (
                  <CompareBadge totalCompare={totalCompare} />
                )}
              </span>
              <span className="block text-[10px] uppercase">
                {t('header.compare')}
              </span>
            </Link>
            <Link
              to={'/wishlist'}
              aria-label="Wishlist"
              className="flex items-center gap-0.5 flex-col"
            >
              <span className="relative">
                <IconHeartEmpty className="w-7 h-7" />
                {totalWishlist > 0 && (
                  <WishlistBadge totalWishlist={totalWishlist} />
                )}
              </span>
              <span className="block text-[10px] uppercase">
                {t('header.wishlist')}
              </span>
            </Link>
            <CartCount isHome={isHome} openCart={openCart} />
          </div>
        </div>
      </div>
      <MegaMenu
        menu={menu}
        showShipping={true}
        wrapperClass="bg-black text-white w-full nav-style"
        innerClass="container flex items-center justify-between relative"
        itemClass="block px-5 py-3"
        shippingText={shippingText}
      />
    </header>
  );
}

function MobileHeader({
  title,
  isHome,
  isLoggedIn,
  logo,
  openCart,
  openMenu,
}: {
  title: string;
  isHome: boolean;
  isLoggedIn: boolean;
  logo?: any;
  openCart: () => void;
  openMenu: () => void;
}) {
  // useHeaderStyleFix(containerStyle, setContainerStyle, isHome);

  const params = useParams();

  const styles = {
    button: 'relative flex items-center justify-center w-8 h-8',
    container: `bg-white header-mobile-style text-black border-b flex lg:hidden items-center h-nav sticky backdrop-blur-lg z-30 top-0 justify-between w-full leading-none gap-4 px-4 md:px-6`,
  };

  return (
    <header role="banner" className={styles.container}>
      <div className="flex items-center justify-start gap-4">
        <button onClick={openMenu} className={styles.button} title="Menu">
          <IconMenu className="w-6 h-6" />
        </button>
        <Form
          method="get"
          action={params.locale ? `/${params.locale}/search` : '/search'}
          className="items-center gap-2 sm:flex"
        >
          <button type="submit" className={styles.button}>
            <IconSearch />
          </button>
          <Input
            type="search"
            variant="minisearch"
            placeholder="Search"
            name="q"
          />
        </Form>
      </div>

      <Link
        className="flex items-center self-stretch leading-[3rem] md:leading-[4rem] justify-center flex-grow w-full h-full"
        to="/"
      >
        {logo ? (
          <Image
            alt={title}
            data={logo}
            sizes="(min-width: 768px) 50vw, 100vw"
            style={{height: '50%'}}
          />
        ) : (
          <span>{title ? title : 'Owen Store'}</span>
        )}
      </Link>

      <div className="flex items-center justify-end gap-4">
        <Link
          to="/account"
          aria-label="Account"
          className={styles.button}
        >
          <Suspense fallback={<IconAccount width="20" height="23" />}>
            <Await resolve={isLoggedIn} errorElement={<IconAccount width="20" height="23" />}>
              <IconAccount width="20" height="23" />
            </Await>
          </Suspense>
        </Link>
        <CartCount isHome={isHome} openCart={openCart} />
      </div>
    </header>
  );
}

function CartCount({
  isHome,
  openCart,
}: {
  isHome: boolean;
  openCart: () => void;
}) {
  const rootData = useRouteLoaderData<RootLoader>('root');

  return (
    <Suspense fallback={<CartBadge count={0} openCart={openCart} />}>
      <Await resolve={rootData?.cart}>
        <CartBanner openCart={openCart} />
      </Await>
    </Suspense>
  );
}

function CartBanner({openCart}: {openCart: () => void;}) {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} openCart={openCart} />;
}

function CartBadge({
  openCart,
  count,
}: {
  count: number;
  openCart: () => void;
}) {
  const isHydrated = useIsHydrated();
  const {t} = useTranslation();
  const BadgeCounter = useMemo(
    () => (
      <>
        <IconCart className="w-6 h-6" />
        <div className="bg-red-500 absolute -top-1 -right-1 text-white text-[0.625rem] font-medium subpixel-antialiased flex items-center justify-center leading-none rounded-full w-4 h-4">
          <span>{count || 0}</span>
        </div>
        <span className="text-[10px] md-max:hidden uppercase">
          {t('header.cart')}
        </span>
      </>
    ),
    [count, t],
  );

  return isHydrated ? (
    <button
      onClick={openCart}
      className="flex items-center flex-col gap-1 w-8 relative"
    >
      {BadgeCounter}
    </button>
  ) : (
    <Link
      to="/cart"
      className="flex items-center flex-col gap-1 w-8 relative"
    >
      {BadgeCounter}
    </Link>
  );
}

function CompareBadge({totalCompare}: {totalCompare: number}) {
  return (
    <span className="bg-red-500 text-white absolute -top-1 -right-2 text-[0.625rem] font-medium subpixel-antialiased flex items-center justify-center leading-none rounded-full w-4 h-4">
      <span>{totalCompare}</span>
    </span>
  );
}

function WishlistBadge({totalWishlist}: {totalWishlist: number}) {
  return (
    <span className="bg-red-500 text-white absolute -top-1 -right-2 text-[0.625rem] font-medium subpixel-antialiased flex items-center justify-center leading-none rounded-full w-4 h-4">
      <span id="wishlist-counter">{totalWishlist}</span>
    </span>
  );
}
