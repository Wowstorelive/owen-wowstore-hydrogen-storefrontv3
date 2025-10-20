import {Disclosure} from '@headlessui/react';
import {Image} from '@shopify/hydrogen';
import {useTranslation} from 'react-i18next';

import {useIsHomePath} from '~/lib/utils';
import {
  IconCaret,
  IconShipping,
  PhoneIcon,
  IconMoneyPolicies,
} from '~/components/elements/Icon';

import {Heading, Section} from '~/components/elements/Text';
import {Link} from '~/components/elements/Link';
import {Newsletter} from '~/components/elements/Newsletter';
import {Social} from '~/components/elements/Social';

import {CountrySelector} from '~/components/CountrySelector';

export function Footer({settings}: {settings?: any}) {
  let socialConfig = {
    facebook: '',
    instagram: '',
    pinterest: '',
    twitter: '',
    youtube: '',
  };
  let footer = {
    collectionLinks: [],
    columnLinks: [],
  };

  let otherConfig = {
    address1: '',
    address2: '',
    email: '',
    phoneNumber: '',
    shippingText: '',
    storeDomain: '',
    storeName: '',
    paymentImage: {},
  };

  let logo = '';

  if (settings) {
    settings.forEach((setting: any) => {
      if (setting && setting.header?.logo) {
        logo = setting.header.logoWhite;
      }
      if (setting && setting.social) {
        socialConfig = setting.social;
      }
      if (setting && setting.footer) {
        footer = setting.footer;
      }
      if (setting && setting.other) {
        otherConfig = setting.other;
      }
    });
  }

  const isHome = useIsHomePath();

  return (
    <Section
      divider={isHome ? 'none' : 'top'}
      as="footer"
      role="contentinfo"
      className="mt-20 bg-stone-900 text-white text-[15px] font-light footer-style"
    >
      <FooterTop />
      <FooterMenu
        logo={logo}
        menu={footer?.columnLinks}
        socials={socialConfig}
        newsletterConfig={settings[0]?.newsletter}
        others={otherConfig}
      />
      <FooterBottom others={otherConfig} />
    </Section>
  );
}

function FooterTop() {
  const {t} = useTranslation();
  return (
    <section className="py-10 border-b border-white border-opacity-10">
      <div className="container flex flex-col justify-between gap-4 text-white rounded-none md:flex-row bg-inherit lg:flex-row lg:gap-16">
        <div className="flex gap-5 items-center mb-4 text-sm md:text-xs lg:text-sm md:mb-0">
          <IconShipping className="w-8 h-8" />
          <div>
            <h5 className="text-base uppercase font-medium">
              {t('global.policiesHeading1')}
            </h5>
            <p>{t('global.policiesText1')}</p>
          </div>
        </div>
        <div className="flex gap-5 items-center mb-4 text-sm md:text-xs lg:text-sm md:mb-0">
          <PhoneIcon className="w-8 h-8" />
          <div>
            <h5 className="text-base uppercase font-medium">
              {t('global.policiesHeading2')}
            </h5>
            <p>{t('global.policiesText2')}</p>
          </div>
        </div>
        <div className="flex gap-5 items-center text-sm md:text-xs lg:text-sm">
          <IconMoneyPolicies width="34" height="34" />
          <div>
            <h5 className="text-base uppercase font-medium">
              {t('global.policiesHeading3')}
            </h5>
            <p>{t('global.policiesText3')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FooterMenu({
  logo,
  menu,
  socials,
  newsletterConfig,
  others,
}: {
  logo?: any;
  menu?: any;
  socials?: any;
  newsletterConfig?: any;
  others?: any;
}) {
  const {t} = useTranslation();
  return (
    <section className="container grid grid-flow-row py-6 lg:py-16 lg:grid-cols-7 lg:gap-4">
      <section className="col-span-1 pt-6 pb-6 lg:py-0 lg:col-span-2 lg:pr-32 border-b border-white border-opacity-10 lg:border-0">
        <p className="mb-6 lg:mb-8">
          <img
            src={logo.url}
            width={logo.width}
            height={logo.height}
            alt=""
            className="w-auto max-h-10"
          />
        </p>
        <div className="grid gap-3">
          <p>
            <span className="font-medium">{t('fields.address1')}:</span>
            {others?.address1}
          </p>
          <p>
            <span className="font-medium">{t('fields.email')}:</span>{' '}
            <a
              href={`mailto:${others?.email}`}
              className="sm-max:h-12 inline-flex items-center"
            >
              {others?.email}
            </a>
          </p>
          <p>
            <span className="font-medium">{t('fields.phone')}:</span>{' '}
            <a
              href={`tel:${others?.phoneNumber}`}
              className="sm-max:h-12 inline-flex"
            >
              {others?.phoneNumber}
            </a>
          </p>
        </div>
        <div className="text-base flex items-center gap-3 mt-4 md:mt-6">
          <Social socials={socials} />
        </div>
      </section>
      {(menu || []).map(
        (item: any, index: number) =>
          index < 3 && (
            <section
              className="py-4 lg:py-0 border-b border-white border-opacity-10 lg:border-0"
              key={item._key}
            >
              <Disclosure>
                {({open}) => (
                  <>
                    <Disclosure.Button
                      className={`${
                        open
                          ? 'mb-4'
                          : 'mb-0 lg:mb-10 transition-all duration-75'
                      } w-full md:cursor-default`}
                    >
                      <Heading
                        className="relative flex items-center justify-between text-base font-medium tracking-wide"
                        size="lead"
                        as="h3"
                      >
                        {item?.mainLink?.title}
                        <span className="flex items-center justify-center lg:hidden">
                          <IconCaret
                            className="w-full"
                            direction={open ? 'up' : 'down'}
                          />
                        </span>
                      </Heading>
                    </Disclosure.Button>
                    {item?.subLink?.length > 0 && (
                      <div
                        className={`${
                          open
                            ? `max-h-44 overflow-hidden lg:overflow-visible h-fit `
                            : ` max-h-0 lg:max-h-fit `
                        }overflow-hidden lg:overflow-visible transition-all duration-300`}
                      >
                        <Disclosure.Panel static>
                          <nav className="grid">
                            {item.subLink.map((subItem: any) => (
                              <Link
                                key={subItem._key}
                                to={subItem.slug}
                                target={subItem?.newWindow ? '_blank' : '_self'}
                              >
                                {subItem.title}
                              </Link>
                            ))}
                          </nav>
                        </Disclosure.Panel>
                      </div>
                    )}
                  </>
                )}
              </Disclosure>
            </section>
          ),
      )}{' '}
      <section className="col-span-1 col-start-auto row-start-auto py-6 lg:col-span-2 lg:row-start-auto lg:col-start-auto lg:py-0 lg:pl-8">
        <Heading
          as="h3"
          className="relative flex justify-between mb-4 text-base font-medium tracking-wide md:mb-4 lg:mb-10"
        >
          {t('button.subscribe')}
        </Heading>
        <div className="mb-6 lg:pr-16">{newsletterConfig?.description}</div>
        <Newsletter />
        <div className="lg:mt-4">
          <CountrySelector />
        </div>
      </section>
    </section>
  );
}

function FooterBottom({others}: {others: any}) {
  const {paymentImage, storeName, storeDomain} = others;
  const {t} = useTranslation();

  return (
    <div className="bg-stone-800 text-sm text-white copyright-style">
      <div className="container flex flex-row items-center justify-between py-8 text-center sm-max:flex-col">
        <div>
          &copy; {new Date().getFullYear()}, {storeName} {t('fields.powerBy')}{' '}
          <a
            href={`https://${
              storeDomain.length > 0 ? storeDomain : 'truestorefront.com'
            }`}
            target="_blank"
            className="underline"
            rel="noreferrer"
          >
            {storeDomain}
          </a>
        </div>
        <div className="flex mt-0 sm-max:mt-3">
          <Image
            alt="Payment Image"
            data={paymentImage}
            width={paymentImage?.width}
            height={paymentImage?.height}
            sizes="(max-width: 32em) 100vw, 33vw"
          />
        </div>
      </div>
    </div>
  );
}
