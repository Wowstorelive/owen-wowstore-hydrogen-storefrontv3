import {useState} from 'react';
import {toast} from 'react-hot-toast';
import {useTranslation} from 'react-i18next';

import {Link} from '~/components/elements/Link';
import {IconHeartEmpty, IconHeartSolid} from '~/components/elements/Icon';
import {useStoreContext} from '~/components/global/StoreContext';
export function WishlistButton({
  showText = false,
  handle,
}: {
  showText?: boolean;
  handle: string;
}) {
  const [updating, setUpdating] = useState(false);
  const {wishlist, setWishlist} = useStoreContext() as any;
  const {t} = useTranslation();

  const addedWishlist = wishlist?.find(
    (wishlistItem: any) => wishlistItem.handle === handle,
  );

  const handleUpdateWishlist = () => {
    const wishlistValue = JSON.parse(localStorage.getItem('wishlist') || '[]');

    const addedWishlist = wishlistValue?.find(
      (wishlistItem: any) => wishlistItem.handle === handle,
    );

    const newWishlist = addedWishlist
      ? wishlistValue.filter(
          (wishlistItem: any) => wishlistItem.handle !== handle,
        )
      : [...wishlistValue, {handle}];

    setUpdating(true);

    localStorage.setItem('wishlist', JSON.stringify(newWishlist));

    setWishlist(newWishlist);

    addedWishlist
      ? toast.error(t('global.removedWishlist'))
      : toast.success(() => (
          <>
            {t('global.addedTo')}{' '}
            <Link to="/wishlist" className="underline ml-1">
              {t('global.wishlist')}
            </Link>
          </>
        ));
    setUpdating(false);
  };

  return (
    <div
      className={
        (updating ? 'opacity-20 pointer-events-none' : 'cursor-pointer') +
        ' select-none'
      }
      onClick={() => handleUpdateWishlist()}
      aria-hidden="true"
    >
      {addedWishlist ? (
        <div
          className="flex items-center gap-2"
          title={t('button.removeWishlist')}
        >
          <IconHeartSolid />
          {showText && (
            <span className="uppercase">{t('global.wishlist')}</span>
          )}
        </div>
      ) : (
        <div
          className="flex items-center gap-2"
          title={t('button.addWishlist')}
        >
          <IconHeartEmpty />
          {showText && (
            <span className="uppercase">{t('global.wishlist')}</span>
          )}
        </div>
      )}
    </div>
  );
}
