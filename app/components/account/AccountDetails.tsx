import {useTranslation} from 'react-i18next';

import type {CustomerDetailsFragment} from 'customer-accountapi.generated';
import {Link} from '~/components/elements/Link';

export function AccountDetails({customer}: {customer: CustomerDetailsFragment}) {
  const {firstName, lastName, emailAddress, phoneNumber} = customer;
  const {t} = useTranslation();
  return (
    <>
      <div className="grid w-full gap-4">
        <h2 className="font-bold text-xl">{t('account.details')}</h2>
        <div className="lg:p-8 p-6 border border-gray-200 rounded">
          <div className="flex">
            <h3 className="font-bold text-base flex-1">
              {t('account.security')}
            </h3>
            <Link
              prefetch="intent"
              className="underline text-sm font-normal"
              to="/account/edit"
            >
              {t('global.edit')}
            </Link>
          </div>
          <div className="mt-4 text-sm text-primary/50">
            {t('account.name')}
          </div>
          <p className="mt-1">
            {firstName || lastName
              ? (firstName ? firstName + ' ' : '') + lastName
              : `${t('account.addName')}`}{' '}
          </p>

          <div className="mt-4 text-sm text-primary/50">
            {t('account.contact')}
          </div>
          <p className="mt-1">{phoneNumber?.phoneNumber ?? t('account.addMobile')}</p>

          <div className="mt-4 text-sm text-primary/50">
            {t('fields.emailAddress')}
          </div>
          <p className="mt-1">{emailAddress?.emailAddress ?? 'N/A'}</p>
        </div>
      </div>
    </>
  );
}
