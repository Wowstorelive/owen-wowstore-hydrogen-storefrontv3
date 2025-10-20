import {useTranslation} from 'react-i18next';
import {Link} from '~/components/elements/Link';
import {IconCachet} from '~/components/elements/Icon';

export function Complete() {
  const {t} = useTranslation();
  return (
    <div className="text-center pt-8 flex flex-col items-center justify-center gap-4">
      <IconCachet className="text-3xl text-green-600" />
      <p className="text-2xl font-medium">{t('page.returnSuccessHeading')}</p>
      <p>{t('page.returnSuccessText')}</p>
      <Link to="/account" className="font-medium underline">
        {t('page.returnAccount')}
      </Link>
    </div>
  );
}
