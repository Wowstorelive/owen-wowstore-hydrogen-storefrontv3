import {useFetcher, useLocation, useRouteLoaderData} from '@remix-run/react';
import {useCallback, useEffect, useRef} from 'react';
import {useInView} from 'react-intersection-observer';
import clsx from 'clsx';
import type {CartBuyerIdentityInput} from '@shopify/hydrogen/storefront-api-types';
import {CartForm} from '@shopify/hydrogen';
import {useTranslation} from 'react-i18next';

import type {Localizations, Locale} from '~/lib/type';
import {DEFAULT_LOCALE, usePrefixPathWithLocale} from '~/lib/utils';
import {IconCheck, IconCaret} from '~/components/elements/Icon';
import {Heading} from '~/components/elements/Text';
import {Button} from '~/components/elements/Button';
import type {RootLoader} from '~/root';

export function CountrySelector({
  showLabel = true,
  hasBorder = true,
}: {
  showLabel?: boolean;
  hasBorder?: boolean;
}) {
  const fetcher = useFetcher();
  const closeRef = useRef<HTMLDetailsElement>(null);
  const rootData = useRouteLoaderData<RootLoader>('root');
  const selectedLocale = rootData?.selectedLocale ?? DEFAULT_LOCALE;
  const {pathname, search} = useLocation();
  const pathWithoutLocale = `${pathname.replace(
    selectedLocale.pathPrefix,
    '',
  )}${search}`;

  const countries = (fetcher.data ?? {}) as Localizations;
  const defaultLocale = countries?.['default'];
  const defaultLocalePrefix = defaultLocale
    ? `${defaultLocale?.language}-${defaultLocale?.country}`
    : '';

  const {t} = useTranslation();

  const {ref, inView} = useInView({
    threshold: 0,
    triggerOnce: true,
  });

  const observerRef = useRef(null);
  useEffect(() => {
    ref(observerRef.current);
  }, [ref, observerRef]);
  const path = usePrefixPathWithLocale('/api/countries');

  // Get available countries list when in view
  useEffect(() => {
    if (!inView || fetcher.data || fetcher.state === 'loading') return;
    fetcher.load(path);
  }, [inView, fetcher, path]);

  const closeDropdown = useCallback(() => {
    closeRef.current?.removeAttribute('open');
  }, []);

  return (
    <section
      ref={observerRef}
      className="grid w-full gap-4 md-max:mt-4"
      onMouseLeave={closeDropdown}
    >
      {showLabel && (
        <Heading
          size="lead"
          className="cursor-default font-medium tracking-wide uppercase"
          as="h3"
        >
          {t('fields.country')}
        </Heading>
      )}
      <div className="relative w-52 h-9 z-10">
        <details
          className={`${
            hasBorder ? 'border' : ''
          } absolute w-full rounded open:round-b-none overflow-clip`}
          ref={closeRef}
        >
          <summary className="flex justify-between items-center w-full px-3 py-1.5 cursor-pointer">
            <span className="flex items-center">
              <img
                src={`/flag/${selectedLocale.country.toLowerCase()}.svg`}
                alt={selectedLocale.label}
                width="24"
                height="18"
                className="mr-2 rtl:mr-0 rtl:ml-2"
              />
              {selectedLocale.label}
            </span>
            <IconCaret direction={'down'} />
          </summary>
          <div className="w-full overflow-auto border-t border-contrast/30 dark:border-white bg-contrast/30 max-h-36">
            {countries &&
              Object.keys(countries).map((countryPath) => {
                const countryLocale = countries[countryPath];
                const isSelected =
                  countryLocale.language === selectedLocale.language &&
                  countryLocale.country === selectedLocale.country;

                const countryUrlPath = getCountryUrlPath({
                  countryLocale,
                  defaultLocalePrefix,
                  pathWithoutLocale,
                });

                return (
                  <Country
                    key={countryPath}
                    closeDropdown={closeDropdown}
                    countryUrlPath={countryUrlPath}
                    isSelected={isSelected}
                    countryLocale={countryLocale}
                  />
                );
              })}
          </div>
        </details>
      </div>
    </section>
  );
}

function Country({
  closeDropdown,
  countryLocale,
  countryUrlPath,
  isSelected,
}: {
  closeDropdown: () => void;
  countryLocale: Locale;
  countryUrlPath: string;
  isSelected: boolean;
}) {
  return (
    <ChangeLocaleForm
      key={countryLocale.country}
      redirectTo={countryUrlPath}
      buyerIdentity={{
        countryCode: countryLocale.country,
      }}
    >
      <Button
        className={clsx([
          'text-contrast dark:text-primary',
          'bg-primary dark:bg-contrast w-full transition flex justify-start',
          'items-center text-left cursor-pointer py-2 px-3',
        ])}
        type="submit"
        variant="primary"
        onClick={closeDropdown}
      >
        <img
          src={`/flag/${countryLocale.country.toLowerCase()}.svg`}
          alt={countryLocale.label}
          width="24"
          height="18"
          className="mr-2 rtl:mr-0 rtl:ml-2"
        />
        {countryLocale.label}
        {isSelected ? (
          <span className="ml-2 rtl:ml-0 rtl:mr-2">
            <IconCheck />
          </span>
        ) : null}
      </Button>
    </ChangeLocaleForm>
  );
}

function ChangeLocaleForm({
  children,
  buyerIdentity,
  redirectTo,
}: {
  children: React.ReactNode;
  buyerIdentity: CartBuyerIdentityInput;
  redirectTo: string;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.BuyerIdentityUpdate}
      inputs={{
        buyerIdentity,
      }}
    >
      <>
        <input type="hidden" name="redirectTo" value={redirectTo} />
        {children}
      </>
    </CartForm>
  );
}

function getCountryUrlPath({
  countryLocale,
  defaultLocalePrefix,
  pathWithoutLocale,
}: {
  countryLocale: Locale;
  pathWithoutLocale: string;
  defaultLocalePrefix: string;
}) {
  let countryPrefixPath = '';
  const countryLocalePrefix = `${countryLocale.language}-${countryLocale.country}`;

  if (countryLocalePrefix !== defaultLocalePrefix) {
    countryPrefixPath = `/${countryLocalePrefix.toLowerCase()}`;
  }
  return `${countryPrefixPath}${pathWithoutLocale}`;
}
