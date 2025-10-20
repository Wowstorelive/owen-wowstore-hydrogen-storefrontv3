import {Form} from '@remix-run/react';
import type {CustomerAddress} from '@shopify/hydrogen/customer-account-api-types';
import {useTranslation} from 'react-i18next';

import type {CustomerDetailsFragment} from 'customer-accountapi.generated';
import {Text} from '~/components/elements/Text';
import {Link} from '~/components/elements/Link';
import {Button} from '~/components/elements/Button';

export function AccountAddressBook({
  customer,
  addresses,
}: {
  customer: CustomerDetailsFragment;
  addresses: CustomerAddress[];
}) {
  const {t} = useTranslation();
  return (
    <>
      <div className="grid w-full gap-4">
        <h2 className="font-bold text-xl">{t('account.addressBook')}</h2>
        <div>
          {!addresses?.length && (
            <Text className="mb-1" width="narrow" as="p" size="copy">
              {t('account.addressesEmpty')}
            </Text>
          )}
          <div className="flex gap-y-5 flex-col mb-8">
            <Text as="p">{t('account.followingAddresses')}</Text>
            <div className="w-48">
              <Button
                to="address/add"
                className="text-sm w-full btn-secondary"
                variant="secondary"
              >
                {t('account.addAddress')}
              </Button>
            </div>
          </div>
          {Boolean(addresses?.length) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {customer.defaultAddress && (
                <Address address={customer.defaultAddress} defaultAddress />
              )}
              {addresses
                .filter((address) => address.id !== customer.defaultAddress?.id)
                .map((address) => (
                  <Address key={address.id} address={address} />
                ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Address({
  address,
  defaultAddress,
}: {
  address: CustomerAddress;
  defaultAddress?: boolean;
}) {
  const {t} = useTranslation();
  return (
    <div className="lg:p-8 p-6 border border-gray-200 rounded flex flex-col">
      {defaultAddress && (
        <div className="mb-3 flex flex-row">
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/20 text-primary/50">
            {t('global.default')}
          </span>
        </div>
      )}
      <ul className="flex-1 flex-row">
        {(address.firstName || address.lastName) && (
          <li>
            {'' +
              (address.firstName && address.firstName + ' ') +
              address?.lastName}
          </li>
        )}
        {address.formatted &&
          address.formatted.map((line: string) => <li key={line}>{line}</li>)}
      </ul>

      <div className="flex flex-row font-medium mt-6 items-baseline">
        <Link
          to={`/account/address/${encodeURIComponent(address.id)}`}
          className="text-left underline text-sm"
          prefetch="intent"
        >
          {t('global.edit')}
        </Link>
        <Form action="address/delete" method="delete">
          <input type="hidden" name="addressId" value={address.id} />
          <button className="text-left text-primary/50 mx-4 text-sm">
            {t('global.remove')}
          </button>
        </Form>
      </div>
    </div>
  );
}
