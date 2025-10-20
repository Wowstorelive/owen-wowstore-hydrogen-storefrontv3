import {
  json,
  redirect,
  type ActionFunction,
  type AppLoadContext,
} from '@shopify/remix-oxygen';
import {
  Form,
  useActionData,
  useOutletContext,
  useParams,
  useNavigation,
} from '@remix-run/react';
import {flattenConnection} from '@shopify/hydrogen';
import type {CustomerAddressInput} from '@shopify/hydrogen/customer-account-api-types';
import invariant from 'tiny-invariant';
import {useTranslation} from 'react-i18next';

import i18next from '~/i18next.server';
import {Text} from '~/components/elements/Text';
import {Button} from '~/components/elements/Button';
import {getInputStyleClasses} from '~/lib/utils';
import {
  UPDATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
  CREATE_ADDRESS_MUTATION,
} from '~/graphql/customer-account/CustomerAddressMutations';

import {doLogout} from './($locale).account_.logout';
import type {AccountOutletContext} from './($locale).account.edit';

interface ActionData {
  formError?: string;
}

export const handle = {
  renderInModal: true,
};

export const action: ActionFunction = async ({request, context, params}) => {
  const {storefront, customerAccount} = context;
  const locale = storefront.i18n.language.toLowerCase();
  const t = await i18next.getFixedT(locale);
  const formData = await request.formData();

  // Double-check current user is logged in.
  // Will throw a logout redirect if not.
  if (!(await customerAccount.isLoggedIn())) {
    throw await doLogout(context);
  }

  const addressId = formData.get('addressId');
  invariant(typeof addressId === 'string', t('errorMesg.mustProvideAddress'));

  if (request.method === 'DELETE') {
    try {
      const {data, errors} = await customerAccount.mutate(
        DELETE_ADDRESS_MUTATION,
        {variables: {addressId}},
      );

      invariant(!errors?.length, errors?.[0]?.message);

      invariant(
        !data?.customerAddressUpdate?.userErrors?.length,
        data?.customerAddressUpdate?.userErrors?.[0]?.message,
      );

      return redirect(
        params?.locale ? `${params?.locale}/account` : '/account',
      );
    } catch (error: any) {
      return json(
        {formError: error.message},
        {
          status: 400,
        },
      );
    }
  }

  const address: CustomerAddressInput = {};

  const keys: (keyof CustomerAddressInput)[] = [
    'lastName',
    'firstName',
    'address1',
    'address2',
    'city',
    'zoneCode',
    'territoryCode',
    'zip',
    'phoneNumber',
    'company',
  ];

  for (const key of keys) {
    const value = formData.get(key);
    if (typeof value === 'string') {
      address[key] = value;
    }
  }

  const defaultAddress = formData.has('defaultAddress')
    ? String(formData.get('defaultAddress')) === 'on'
    : false;

  if (addressId === 'add') {
    try {
      const {data, errors} = await customerAccount.mutate(
        CREATE_ADDRESS_MUTATION,
        {variables: {address, defaultAddress}},
      );

      invariant(!errors?.length, errors?.[0]?.message);

      invariant(
        !data?.customerAddressCreate?.userErrors?.length,
        data?.customerAddressCreate?.userErrors?.[0]?.message,
      );

      invariant(
        data?.customerAddressCreate?.customerAddress?.id,
        t('errorMesg.expectedAddress'),
      );

      return redirect(
        params?.locale ? `${params?.locale}/account` : '/account',
      );
    } catch (error: any) {
      return json(
        {formError: error.message},
        {
          status: 400,
        },
      );
    }
  } else {
    try {
      const {data, errors} = await customerAccount.mutate(
        UPDATE_ADDRESS_MUTATION,
        {
          variables: {
            address,
            addressId,
            defaultAddress,
          },
        },
      );

      invariant(!errors?.length, errors?.[0]?.message);

      invariant(
        !data?.customerAddressUpdate?.userErrors?.length,
        data?.customerAddressUpdate?.userErrors?.[0]?.message,
      );

      return redirect(
        params?.locale ? `${params?.locale}/account` : '/account',
      );
    } catch (error: any) {
      return json(
        {formError: error.message},
        {
          status: 400,
        },
      );
    }
  }
};

export default function EditAddress() {
  const {id: addressId} = useParams();
  const isNewAddress = addressId === 'add';
  const actionData = useActionData<ActionData>();
  const {state} = useNavigation();
  const {customer} = useOutletContext<AccountOutletContext>();
  const addresses = flattenConnection(customer.addresses);
  const defaultAddress = customer.defaultAddress;
  /**
   * When a refresh happens (or a user visits this link directly), the URL
   * is actually stale because it contains a special token. This means the data
   * loaded by the parent and passed to the outlet contains a newer, fresher token,
   * and we don't find a match. We update the `find` logic to just perform a match
   * on the first (permanent) part of the ID.
   */
  const normalizedAddress = decodeURIComponent(addressId ?? '').split('?')[0];
  const address = addresses.find((address: any) =>
    address.id!.startsWith(normalizedAddress),
  );
  const {t} = useTranslation();
  return (
    <>
      <Text className="mb-6" as="h3" size="lead">
        {isNewAddress ? t('account.addAddress') : t('account.editAddress')}
      </Text>
      <div className="max-w-2xl">
        <Form method="post">
          <input
            type="hidden"
            name="addressId"
            value={address?.id ?? addressId}
          />
          {actionData?.formError && (
            <div className="flex items-center justify-center mb-6 bg-red-100 rounded">
              <p className="m-4 text-sm text-red-900">{actionData.formError}</p>
            </div>
          )}
          <div className="grid md:grid-cols-2 mt-3 gap-3">
            <input
              className={getInputStyleClasses()}
              id="firstName"
              name="firstName"
              required
              type="text"
              autoComplete="given-name"
              placeholder={t('fields.firstName')}
              aria-label={t('fields.firstName')}
              defaultValue={address?.firstName ?? ''}
            />
            <input
              className={getInputStyleClasses()}
              id="lastName"
              name="lastName"
              required
              type="text"
              autoComplete="family-name"
              placeholder={t('fields.lastName')}
              aria-label={t('fields.lastName')}
              defaultValue={address?.lastName ?? ''}
            />
          </div>
          <div className="grid md:grid-cols-2 mt-3 gap-3">
            <input
              className={getInputStyleClasses()}
              id="phone"
              name="phoneNumber"
              type="tel"
              autoComplete="tel"
              placeholder={t('fields.phone')}
              aria-label={t('fields.phone')}
              defaultValue={address?.phoneNumber ?? ''}
            />
            <input
              className={getInputStyleClasses()}
              id="company"
              name="company"
              type="text"
              autoComplete="organization"
              placeholder={t('fields.company')}
              aria-label={t('fields.company')}
              defaultValue={address?.company ?? ''}
            />
          </div>
          <div className="mt-3">
            <input
              className={getInputStyleClasses()}
              id="address1"
              name="address1"
              type="text"
              autoComplete="address-line1"
              placeholder={`${t('fields.address1')} *`}
              required
              aria-label={t('fields.address1')}
              defaultValue={address?.address1 ?? ''}
            />
          </div>
          <div className="mt-3">
            <input
              className={getInputStyleClasses()}
              id="address2"
              name="address2"
              type="text"
              autoComplete="address-line2"
              placeholder={t('fields.address2')}
              aria-label={t('fields.address2')}
              defaultValue={address?.address2 ?? ''}
            />
          </div>
          <div className="grid md:grid-cols-2 mt-3 gap-3">
            <input
              className={getInputStyleClasses()}
              id="city"
              name="city"
              type="text"
              required
              autoComplete="address-level2"
              placeholder={t('fields.city')}
              aria-label={t('fields.city')}
              defaultValue={address?.city ?? ''}
            />
            <input
              className={getInputStyleClasses()}
              id="zoneCode"
              name="zoneCode"
              type="text"
              autoComplete="address-level1"
              placeholder={t('fields.zoneCode')}
              required
              aria-label={t('fields.zoneCode')}
              defaultValue={address?.zoneCode ?? ''}
            />
          </div>
          <div className="grid md:grid-cols-2 mt-3 gap-3">
            <input
              className={getInputStyleClasses()}
              id="zip"
              name="zip"
              type="text"
              autoComplete="postal-code"
              placeholder={t('fields.zip')}
              required
              aria-label="Zip"
              defaultValue={address?.zip ?? ''}
            />
            <input
              className={getInputStyleClasses()}
              id="territoryCode"
              name="territoryCode"
              type="text"
              autoComplete="country"
              placeholder={t('fields.country')}
              required
              aria-label={t('fields.country')}
              defaultValue={address?.territoryCode ?? ''}
            />
          </div>
          <div className="mt-2">
            <input
              type="checkbox"
              name="defaultAddress"
              id="defaultAddress"
              defaultChecked={defaultAddress?.id === address?.id}
              className="border-gray-500 rounded-sm cursor-pointer border-1"
            />
            <label
              className="inline-block ml-2 rtl:ml-0 rtl:mr-2 text-sm cursor-pointer"
              htmlFor="defaultAddress"
            >
              {t('account.setDefaultAddress')}
            </label>
          </div>
          <div className="mt-5">
            <Button
              className="w-full rounded focus:shadow-outline btn-primary"
              type="submit"
              variant="primary"
              disabled={state !== 'idle'}
            >
              {state !== 'idle' ? t('button.saving') : t('button.save')}
            </Button>
          </div>
          <div>
            <Button
              to=".."
              className="w-full mt-2 rounded focus:shadow-outline btn-secondary"
              variant="secondary"
            >
              {t('button.cancel')}
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
}
