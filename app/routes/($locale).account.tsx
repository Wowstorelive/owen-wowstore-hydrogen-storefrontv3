import {
  Await,
  Form,
  Outlet,
  useLoaderData,
  useMatches,
  useOutlet,
} from '@remix-run/react';
import {Suspense, useState} from 'react';
import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {flattenConnection} from '@shopify/hydrogen';
import {useTranslation} from 'react-i18next';

import type {
  CustomerDetailsFragment,
  OrderCardFragment,
} from 'customer-accountapi.generated';
import {
  BookIcon,
  OrderListIcon,
  HomeIcon,
  IconAccount,
  IconHeartEmpty,
  OffIcon,
} from '~/components/elements/Icon';

import {Text} from '~/components/elements/Text';
import {Link} from '~/components/elements/Link';
import {Button} from '~/components/elements/Button';
import {Modal} from '~/components/elements/Modal';
import {Skeleton} from '~/components/elements/Skeleton';

import {AccountDetails} from '~/components/account/AccountDetails';
import {AccountAddressBook} from '~/components/account/AccountAddressBook';
import {ProductCarousel} from '~/components/product/ProductCarousel';
import {OrderCard} from '~/components/cards/OrderCard';
import {FeaturedCollections} from '~/components/FeaturedCollections';
import {usePrefixPathWithLocale} from '~/lib/utils';
import {CACHE_NONE, routeHeaders} from '~/data/cache';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';
import i18next from '~/i18next.server';
import {WishlistDetails} from '~/components/wishlist/WishlistDetails';
import {useStoreContext} from '~/components/global/StoreContext';

import {
  getFeaturedData,
  type FeaturedData,
} from './($locale).featured-products';
import {doLogout} from './($locale).account_.logout';

export const headers = routeHeaders;

export async function loader({context}: LoaderFunctionArgs) {
  const lang = context.storefront.i18n.language.toLowerCase();
  const t = await i18next.getFixedT(lang);
  const {data, errors} = await context.customerAccount.query(
    CUSTOMER_DETAILS_QUERY,
  );

  /**
   * If the customer failed to load, we assume their access token is invalid.
   */
  if (errors?.length || !data?.customer) {
    throw await doLogout(context);
  }

  const customer = data?.customer;

  const heading = customer
    ? customer.firstName
      ? `${t('account.welcome')}, ${customer.firstName}.`
      : `${t('account.welcomeTo')}`
    : `${t('account.details')}`;

  return defer(
    {
      customer,
      heading,
      featuredDataPromise: getFeaturedData(context.storefront, {}),
    },
    {
      headers: {
        'Cache-Control': CACHE_NONE,
      },
    },
  );
}

export default function Authenticated() {
  const data = useLoaderData<typeof loader>();
  const outlet = useOutlet();
  const matches = useMatches();

  // routes that export handle { renderInModal: true }
  const renderOutletInModal = matches.some((match) => {
    const handle = match?.handle as {renderInModal?: boolean};
    return handle?.renderInModal;
  });

  // Authenticated routes
  if (outlet) {
    if (renderOutletInModal) {
      return (
        <>
          <Modal cancelLink="/account">
            <Outlet context={{customer: data.customer}} />
          </Modal>
          <Account {...data} />
        </>
      );
    } else {
      return <Outlet context={{customer: data.customer}} />;
    }
  }

  return <Account {...data} />;
}

interface AccountType {
  customer: CustomerDetailsFragment;
  featuredDataPromise: Promise<FeaturedData>;
  heading: string;
}

function Account({customer, heading, featuredDataPromise}: AccountType) {
  const orders = flattenConnection(customer.orders);
  const addresses = flattenConnection(customer.addresses);
  const [handleChecked, sethandleChecked] = useState(1);
  const {t} = useTranslation();
  const [title, setTitle] = useState(t('account.myAccount'));
  
  return (
    <div className="container pt-12 lg:pt-24 max-w-7xl">
      <div className="text-black text-2xl md:text-3xl text-center w-full font-bold uppercase">
        {title}
      </div>
      <div className="w-full grid grid-cols-3 gap-2 md:gap-4 md:flex justify-center my-8 text-sm md:text-base font-medium">
        <Button
          onClick={() => {
            sethandleChecked(1);
            setTitle(t('account.myAccount'));
          }}
          className={`text-center py-2 md:p-1 md:w-32 md:h-28 ${
            handleChecked === 1
              ? 'bg-slate-900 text-white border-inherit'
              : 'bg-gray-100'
          }`}
        >
          <BookIcon width="36" height="36" className="mx-auto" />
          <p className="mt-1">{t('account.dashboard')}</p>
        </Button>
        <Button
          onClick={() => {
            sethandleChecked(2);
            setTitle(t('account.orders'));
          }}
          className={`text-center py-2 md:p-1 md:w-32 md:h-28 ${
            handleChecked === 2
              ? 'bg-slate-900 text-white border-inherit'
              : 'bg-gray-100'
          }`}
        >
          <OrderListIcon width="36" height="36" className="mx-auto" />
          <p className="mt-1">{t('account.orders')}</p>
        </Button>
        <Button
          onClick={() => {
            sethandleChecked(3);
            setTitle(t('account.addresses'));
          }}
          className={`text-center py-2 md:p-1 md:w-32 md:h-28 ${
            handleChecked === 3
              ? 'bg-slate-900 text-white border-inherit'
              : 'bg-gray-100'
          }`}
        >
          <HomeIcon width="34" height="35" className="mx-auto" />
          <p className="mt-1">{t('account.addresses')}</p>
        </Button>
        <Button
          onClick={() => {
            sethandleChecked(4);
            setTitle(t('account.details'));
          }}
          className={`text-center py-2 md:p-1 md:w-32 md:h-28 ${
            handleChecked === 4
              ? 'bg-slate-900 text-white border-inherit'
              : 'bg-gray-100'
          }`}
        >
          <IconAccount width="34" height="34" className="mx-auto" />
          <p className="mt-1">{t('account.details')}</p>
        </Button>
        <Button
          onClick={() => {
            sethandleChecked(5);
            setTitle(t('account.wishlist'));
          }}
          className={`text-center py-2 md:p-1 md:w-32 md:h-28 ${
            handleChecked === 5
              ? 'bg-slate-900 text-white border-inherit'
              : 'bg-gray-100'
          }`}
        >
          <IconHeartEmpty className="mx-auto w-10 h-10" />
          <p>{t('account.wishlist')}</p>
        </Button>
        <Form
          method="post"
          action={usePrefixPathWithLocale('/account/logout')}
          className="flex justify-center bg-gray-100 text-center py-2 md:p-1 md:w-32 md:h-28"
        >
          <button type="submit">
            <OffIcon width="38" height="36" className="mx-auto" />
            <p className="mt-1">{t('account.signOut')}</p>
          </button>
        </Form>
      </div>
      <div className="w-full bg-gray-100 mb-12 p-6">
        {handleChecked === 1 && (
          <Skeleton className="bg-transparent w-full">
            <h2 className="font-bold text-lead">{heading}</h2>
            <Text className="mt-4 max-w-screen-md" as="p">
              {t('account.dashboardCanView')}{' '}
              <button
                onClick={() => {
                  sethandleChecked(2);
                  setTitle(t('account.orders'));
                }}
                className="underline cursor-pointer"
              >
                {t('account.recentOrders')}
              </button>
              , {t('account.manageYour')}{' '}
              <button
                onClick={() => {
                  sethandleChecked(3);
                  setTitle(t('account.addresses'));
                }}
                className="underline cursor-pointer"
              >
                {t('account.textShipping')}
              </button>{' '}
              , {t('account.and')}{' '}
              <button
                onClick={() => {
                  sethandleChecked(4);
                  setTitle(t('account.details'));
                }}
                className="underline cursor-pointer"
              >
                {t('account.textEdit')}
              </button>
            </Text>
          </Skeleton>
        )}
        {handleChecked === 2 && (
          <>{orders && <AccountOrderHistory orders={orders} />}</>
        )}
        {handleChecked === 3 && (
          <AccountAddressBook addresses={addresses} customer={customer} />
        )}
        {handleChecked === 4 && <AccountDetails customer={customer} />}
        {handleChecked === 5 && <WishlistContent />}
      </div>

      {!orders.length && (
        <Suspense>
          <Await
            resolve={featuredDataPromise}
            errorElement="There was a problem loading featured products."
          >
            {(data) => (
              <div className="flex flex-col gap-12">
                <FeaturedCollections
                  title={t('global.popularCollections')}
                  collections={data.featuredCollections}
                />
                <ProductCarousel
                  title={t('global.trendingProducts')}
                  products={data!.featuredProducts.nodes}
                  settings={{itemsPerRow: 4, limitItems: 8}}
                />
              </div>
            )}
          </Await>
        </Suspense>
      )}
    </div>
  );
}

type OrderCardsProps = {
  orders: OrderCardFragment[];
};

function AccountOrderHistory({orders}: OrderCardsProps) {
  const {t} = useTranslation();
  return (
    <div className="grid w-full gap-4">
      <h2 className="font-bold text-xl">{t('order.orderHistory')}</h2>
      {orders?.length ? <Orders orders={orders} /> : <EmptyOrders />}
    </div>
  );
}

function EmptyOrders() {
  const {t} = useTranslation();
  return (
    <div>
      <Text className="mb-1" as="p">
        {t('order.emptyOrder')}
      </Text>
      <div className="w-48 mt-8">
        <Button
          className="w-full text-sm"
          variant="secondary"
          to={usePrefixPathWithLocale('/')}
        >
          {t('global.continueShopping')}
        </Button>
      </div>
    </div>
  );
}

function Orders({orders}: OrderCardsProps) {
  return (
    <ul className="grid grid-flow-row grid-cols-1 gap-2 gap-y-6 md:gap-4 lg:gap-6 false sm:grid-cols-3">
      {orders.map((order) => (
        <OrderCard order={order} key={order.id} />
      ))}
    </ul>
  );
}

function WishlistContent() {
  const {wishlist, wishlistCounter} = useStoreContext() as any;
  const {t} = useTranslation();
  return (
    <div className="grid w-full gap-4">
      <h2 className="font-bold text-xl">{t('wishlist.heading')}</h2>
      <div>
        {wishlistCounter > 0 ? (
          <WishlistDetails wishlists={wishlist} isAccountPage={true} />
        ) : (
          <div className="fadeIn">
            <p>{t('wishlist.empty')}</p>
            <Link to="/collections/trending" className="mt-2">
              <p className="underline">{t('collection.browseCatalog')}</p>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
