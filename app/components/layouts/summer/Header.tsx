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
import {Suspense, useEffect, useState, useMemo} from 'react';
import {useTranslation} from 'react-i18next';

import {useIsHomePath} from '~/lib/utils';
import {
  IconAccount,
  IconCart,
  IconSearch,
  IconMenu,
  IconClose,
  IconHeartEmpty,
  IconCompare,
} from '~/components/elements/Icon';

import {Link} from '~/components/elements/Link';
import {Input} from '~/components/elements/Input';

import {useIsHydrated} from '~/hooks/useIsHydrated';
import {useCartFetchers} from '~/hooks/useCartFetchers';
import {MegaMenu} from '~/components/sanity/MegaMenu';
import {CartDrawer} from '~/components/global/CartDrawer';
import {useDrawer} from '~/components/global/Drawer';
import {MenuDrawer} from '~/components/global/MenuDrawer';
import {useStoreContext} from '~/components/global/StoreContext';
import {CompareDrawer} from '~/components/global/CompareDrawer';
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
  const logoWhite = settings[0]?.header?.logoWhite;

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
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
      <CompareDrawer isOpen={isCompareOpen} onClose={closeCompare} />
      {menu && (
        <MenuDrawer isOpen={isMenuOpen} onClose={closeMenu} menu={menu} />
      )}
      <DesktopHeader
        isHome={isHome}
        title={title}
        menu={menu}
        logo={logoWhite}
        openCart={openCart}
        isLoggedIn={isLoggedIn}
        totalWishlist={totalWishlist}
        totalCompare={totalCompare}
      />
      <MobileHeader
        isHome={isHome}
        title={title}
        logo={logoWhite}
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
  title,
  totalWishlist,
  totalCompare,
}: {
  isHome: boolean;
  isLoggedIn?: boolean;
  openCart: () => void;
  menu?: any;
  logo?: any;
  title: string;
  totalWishlist: number;
  totalCompare: number;
}) {
  const params = useParams();
  const [searchInputShow, setSearchInputShow] = useState(false);
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
      className={
        (isHome
          ? 'bg-gradient-to-b from-primary/80 -mb-[88px]'
          : 'bg-stone-900 header-style') +
        ' z-30 hidden lg:flex flex-col leading-none text-white'
      }
    >
      <div className="container flex items-center justify-between relative">
        <div className="flex items-center gap-8">
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
          <MegaMenu
            menu={menu}
            wrapperClass="w-full"
            innerClass="ml-10 items-center flex"
            itemClass="block px-5 py-8"
          />
        </div>
        <div className="flex items-center gap-x-5">
          <div>
            <Form
            method="get"
            action={params.locale ? `/${params.locale}/search` : '/search'}
            className="flex items-center gap-2 relative"
          >
            <div
              className="p-1 cursor-pointer select-none"
              onClick={() => {
                setSearchInputShow((prev) => !prev);
                setShow(false)
              }}
              aria-hidden="true"
            >
              {searchInputShow ? <IconClose /> : <IconSearch />}
            </div>
            {searchInputShow && (
              <div
                className={
                  (isHome ? 'bg-transparent' : 'bg-stone-900 header-style') +
                  ' absolute flex items-center gap-2 right-6 rtl:right-auto rtl:left-6'
                }
              >
                <button type="submit" className="flex items-center">
                  <IconSearch />
                </button>
                <Input
                  type="text"
                  className={
                    (isHome ? 'bg-transparent' : 'bg-stone-900 header-style') +
                    ' border-0 border-b text-white focus:ring-0'
                  }
                  placeholder={t('fields.search')}
                  name="q"
                  variant=""
                  onChange={(e) => showResultSearch(e)}
                />
              </div>
            )}
            </Form>
            {
              show && <Recommendation valueSearch={valueSearch} customClass="mt-7" />
            }
          </div>
          <Link
            to="/account"
            aria-label="Account"
            className="flex items-center flex-col gap-1"
          >
            <Suspense fallback={<IconAccount width="20" height="22" />}>
              <Await resolve={isLoggedIn} errorElement={<IconAccount width="20" height="22" />}>
                <IconAccount width="20" height="22" />
              </Await>
            </Suspense>
          </Link>
          <Link
            to={'/compare'}
            aria-label="Compare"
            className="flex items-center flex-col relative"
          >
            <IconCompare className="text-2xl" />
            {totalCompare > 0 && <CompareBadge totalCompare={totalCompare} />}
          </Link>
          <Link to={'/wishlist'} aria-label="Wishlist">
            <div className="flex items-center flex-col relative">
              <IconHeartEmpty className="w-6 h-6" />
              {totalWishlist > 0 && (
                <WishlistBadge totalWishlist={totalWishlist} />
              )}
            </div>
          </Link>
          <CartCount isHome={isHome} openCart={openCart} />
        </div>
      </div>
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
    container: `${
      isHome
        ? 'bg-gradient-to-b from-primary/80 -mb-14'
        : 'bg-stone-900 sticky top-0 header-mobile-style'
    } text-white flex lg:hidden items-center h-nav z-30 justify-between w-full leading-none gap-4 px-4 md:px-6`,
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

  const BadgeCounter = useMemo(
    () => (
      <>
        <IconCart className="w-6 h-6" />
        <div className="bg-red-500 absolute -top-1 -right-1 text-white text-[0.625rem] font-medium subpixel-antialiased flex items-center justify-center leading-none rounded-full w-4 h-4">
          <span>{count || 0}</span>
        </div>
      </>
    ),
    [count],
  );

  return isHydrated ? (
    <button
      onClick={openCart}
      className="flex items-center flex-col gap-1 w-8 relative"
    >
      {BadgeCounter}
    </button>
  ) : (
    <Link to="/cart" className="flex items-center flex-col gap-1 w-8 relative">
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
