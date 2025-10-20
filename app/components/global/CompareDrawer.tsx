import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';

import {Drawer} from '~/components/global/Drawer';
import {useStoreContext} from '~/components/global/StoreContext';
import {ComparePreview} from '~/components/compare/ComparePreview';
import {Link} from '~/components/elements/Link';
import {useDirection} from '~/hooks/useDirection';

export function CompareDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {compareList, setCompareList, compareCounter} =
    useStoreContext() as any;

  const {t} = useTranslation();
  const dir = useDirection();
  const direction = dir === 'ltr' ? 'right' : 'left';

  useEffect(() => {
    window.addEventListener('comparechange', () => {
      const compareLocal = localStorage.getItem('compare') || '[]';
      setCompareList(JSON.parse(compareLocal));
    });
  }, [setCompareList]);

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      heading={t('compare.heading')}
      openFrom={direction}
    >
      <div className="grid">
        {compareCounter > 0 ? (
          <ComparePreview
            onClose={onClose}
            compares={compareList}
            setCompareList={setCompareList}
          />
        ) : (
          <div className="fadeIn px-6 md:px-12">
            <div>{t('compare.empty')}</div>
            <Link to="/collections" onClick={onClose}>
              <p className="underline">{t('collection.browseCatalog')}</p>
            </Link>
          </div>
        )}
      </div>
    </Drawer>
  );
}
