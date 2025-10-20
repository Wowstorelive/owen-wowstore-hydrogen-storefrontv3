import {useState} from 'react';
import {useTranslation} from 'react-i18next';

import {Link} from '~/components/elements/Link';
import {IconCompare, IconCachet} from '~/components/elements/Icon';

import {useStoreContext} from '~/components/global/StoreContext';

const MAX_LENGTH_COMPARE_PRODUCTS = 12;
export function CompareButton({
  showText = false,
  handle,
}: {
  showText?: boolean;
  handle: string;
}) {
  const [updating, setUpdating] = useState(false);
  const {compareList, setCompareList} = useStoreContext() as any;
  const {t} = useTranslation();

  const handleUpdateCompare = () => {
    const productExist = compareList.some(
      (item: any) => item.handle === handle,
    );

    const newCompareList = productExist
      ? compareList.filter((item: any) => item.handle !== handle)
      : compareList;

    if (newCompareList.length >= MAX_LENGTH_COMPARE_PRODUCTS) {
      newCompareList.shift();
    }

    newCompareList.push({handle});

    setUpdating(true);

    localStorage.setItem('compare', JSON.stringify(newCompareList));
    setCompareList(newCompareList);

    window.dispatchEvent(new Event('comparechange'));

    setUpdating(false);
  };

  const addedCompare = compareList.some((item: any) => item.handle === handle);

  return (
    <>
      {addedCompare ? (
        <Link
          to="/compare"
          className="flex items-center gap-2"
          title={t('compare.goToCompare')}
        >
          <IconCachet className="cursor-pointer text-lg" />
          {showText && t('compare.compareLable')}
        </Link>
      ) : (
        <div
          className={
            (updating ? 'opacity-20 pointer-events-none' : 'cursor-pointer') +
            ' select-none'
          }
          onClick={() => handleUpdateCompare()}
          aria-hidden="true"
        >
          <div
            className="flex items-center gap-2"
            title={t('button.addCompare')}
          >
            <IconCompare className="text-2xl" />
            {showText && t('compare.compareLable')}
          </div>
        </div>
      )}
    </>
  );
}
