import {useTranslation} from 'react-i18next';

import {Link} from './Link';
export function Breadcrumb({
  url,
  removelast,
}: {
  url: string;
  removelast?: boolean;
}) {
  const splitURL = url.split('/');
  if (removelast) splitURL.pop();
  const {t} = useTranslation();
  // @ts-ignore
  const breadcrumz = [];

  let link = '';

  splitURL.forEach((item: string) => {
    if (item === '') {
      link += '/';
      breadcrumz.push(
        <Link key={link} to={link} className="inline-block py-5 uppercase">
          {t('global.home')}
        </Link>,
      );
    } else {
      link += item + '/';
      const itemMobile = item.substring(0, 25);
      breadcrumz.push(
        <Link key={link} to={link} className="inline-block py-5">
          <span>
            <span className="px-1">/</span>{' '}
            <span className="md:hidden uppercase">
              {itemMobile}
              {item.length > 25 && '...'}
            </span>
            <span className="hidden md:inline-block uppercase">
              {item === 'products' ? t('global.products') : item}
            </span>
          </span>
        </Link>,
      );
    }
  });

  // @ts-ignore
  return <div className="text-xs">{breadcrumz}</div>;
}
