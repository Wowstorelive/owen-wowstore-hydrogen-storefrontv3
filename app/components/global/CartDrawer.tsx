import {Await, useRouteLoaderData} from '@remix-run/react';
import {Suspense} from 'react';
import {useTranslation} from 'react-i18next';

import {Drawer} from '~/components/global/Drawer';
import {Cart} from '~/components/global/Cart';
import {CartLoading} from '~/components/global/CartLoading';
import {useDirection} from '~/hooks/useDirection';
import type {RootLoader} from '~/root';

export function CartDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const rootData = useRouteLoaderData<RootLoader>('root');
  if (!rootData) return null;
  const {t} = useTranslation();
  const dir = useDirection();
  const direction = dir === 'ltr' ? 'right' : 'left';
  
  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      heading={t('global.cart')}
      openFrom={direction}
    >
      <div className="grid">
        <Suspense fallback={<CartLoading />}>
          <Await resolve={rootData?.cart}>
            {(cart) => <Cart layout="drawer" onClose={onClose} cart={cart} />}
          </Await>
        </Suspense>
      </div>
    </Drawer>
  );
}
