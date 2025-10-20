import {Disclosure} from '@headlessui/react';
import {Image} from '@shopify/hydrogen';
import {useTranslation} from 'react-i18next';
import {useIsHomePath} from '~/lib/utils';

import {Link} from '~/components/elements/Link';
import {Social} from '~/components/elements/Social';
import {Heading, Section} from '~/components/elements/Text';
import {Newsletter} from '~/components/elements/Newsletter';
import {IconCaret} from '~/components/elements/Icon';

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

  let logoWhite = '';

  if (settings) {
    settings.forEach((setting: any) => {
      if (setting && setting.header?.logoWhite) {
        logoWhite = setting.header.logoWhite;
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
      className="mt-12 md:mt-20 bg-slate-900 text-white text-[15px] font-light footer-style"
    >
      <FooterTop newsletterConfig={settings[0]?.newsletter} />
      <FooterMenu
        logo={logoWhite}
        menu={footer?.columnLinks}
        socials={socialConfig}
        others={otherConfig}
      />
      <FooterBottom others={otherConfig} />
    </Section>
  );
}

function FooterTop({newsletterConfig}: {newsletterConfig: any}) {
  return (
    <section className="pt-10 lg:pt-20 pb-6 md:pb-0">
      <div className="container lg:max-w-4xl">
        <Heading
          className="w-full text-xl text-center md:text-2xl font-medium uppercase text-heading4"
          as="h3"
        >
          {newsletterConfig?.heading}
        </Heading>
        <div className="font-light text-center mt-2 md:mt-4 block mb-6">
          {newsletterConfig?.description}
        </div>

        <Newsletter />
      </div>
    </section>
  );
}

function FooterMenu({
  logo,
  menu,
  socials,
  others,
}: {
  logo?: any;
  menu?: any;
  socials: any;
  others: any;
}) {
  const {t} = useTranslation();

  return (
    <>
      <section className="container grid grid-flow-row py-6 divide-y divide-white divide-opacity-25 lg:py-20 lg:grid-cols-7 lg:gap-4 lg:divide-none">
        <section className="col-span-1 pb-6 md:pt-6 lg:py-0 lg:col-span-2 lg:pr-10">
          <p className="mb-6">
            <img
              src={logo.url}
              width={logo.width}
              height={logo.height}
              alt=""
              className="w-auto max-h-10"
            />
          </p>
          <p className="mb-2">
            <span className="font-medium">{t('fields.address1')}:</span>{' '}
            {others?.address1}
          </p>
          <p>
            <span className="font-medium">{t('fields.address2')}:</span>{' '}
            {others?.address2}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <p>
              <span className="font-medium">{t('fields.email')}:</span>{' '}
              <a
                href={`mailto:${others?.email}`}
                className="sm-max:h-12 inline-flex items-center"
              >
                {others?.email}
              </a>
              <br />
              <span className="font-medium">{t('fields.phone')}:</span>{' '}
              <a
                href={`tel:${others?.phoneNumber}`}
                className="sm-max:h-12 inline-flex"
              >
                {others?.phoneNumber}
              </a>
            </p>
          </div>
          <div className="text-base flex items-center gap-3 mt-4">
            <Social socials={socials} />
          </div>
        </section>
        {(menu || []).map((item: any) => (
          <section className="py-4 lg:py-0" key={item._key}>
            <Disclosure>
              {({open}) => (
                <>
                  <Disclosure.Button
                    className={`${
                      open ? 'mb-4' : 'mb-0 lg:mb-8 transition-all duration-75'
                    } w-full lg:cursor-default`}
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
                          ? `max-h-44 overflow-hidden h-fit lg:overflow-visible `
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
        ))}{' '}
        <section className="py-4 lg:py-0">
          <Disclosure>
            {({open}) => (
              <Disclosure.Button className="w-full text-left lg:cursor-default">
                <Heading
                  as="h3"
                  className="relative max-w-full flex justify-between text-base font-medium tracking-wide lg:mb-8 uppercase"
                >
                  {t('fields.openingTime')}
                  <span className="flex items-center justify-center lg:hidden">
                    <IconCaret
                      className="w-full"
                      direction={open ? 'up' : 'down'}
                    />
                  </span>
                </Heading>
                <div
                  className={`${
                    open
                      ? `max-h-44 relative overflow-hidden h-fit`
                      : ` max-h-0 lg:max-h-fit `
                  }overflow-hidden transition-all duration-300`}
                >
                  <Disclosure.Panel static>
                    <nav
                      className={`${
                        open ? 'pt-4' : 'transition-all duration-75'
                      } grid mb-3 relative`}
                    >
                      <Link to="" target="">
                        Mon - Fri: 8AM - 9PM
                      </Link>
                      <Link to="" target="">
                        Sat: 9 AM - 8 PM
                      </Link>
                      <Link to="" target="">
                        Sun: Closed
                      </Link>
                    </nav>
                  </Disclosure.Panel>
                </div>
              </Disclosure.Button>
            )}
          </Disclosure>
          <CountrySelector />
        </section>
      </section>
    </>
  );
}

function FooterBottom({others}: {others: any}) {
  const {paymentImage, storeName, storeDomain} = others;
  const {t} = useTranslation();

  return (
    <div className="border-t border-slate-700 text-sm copyright-style">
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
