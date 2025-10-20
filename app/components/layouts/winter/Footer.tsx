import {Disclosure} from '@headlessui/react';
import {Image} from '@shopify/hydrogen';
import {useTranslation} from 'react-i18next';

import {useIsHomePath} from '~/lib/utils';
import {
  IconCaret,
  IconSend,
  MapMarkerIcon,
  Envelope,
  PhoneIcon,
} from '~/components/elements/Icon';

import {Heading, Section, Text} from '~/components/elements/Text';
import {Link} from '~/components/elements/Link';
import {Newsletter} from '~/components/elements/Newsletter';
import {Social} from '~/components/elements/Social';

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
      className="mt-20 bg-white footer-style"
    >
      <FooterTop />
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

function FooterTop() {
  const {t} = useTranslation();
  return (
    <section className="text-sm bg-black">
      <div className="container bg-inherit flex lg:flex-row flex-col justify-between lg:gap-16 gap-0 text-center py-6 lg:py-4 text-white">
        <div className="w-full flex gap-12 items-center sm-max:justify-between lg:pb-0 pb-2 sm-max:flex-col sm-max:gap-0 flex-row">
          <div className="flex items-center justify-center lg:justify-start pb-4 lg:pb-0">
            <IconSend width={32} height={32} />
            <Heading
              as="h6"
              className="text-xl font-light ml-4 lg:whitespace-nowrap"
            >
              {t('global.newsletterHeading')}
            </Heading>
          </div>

          <Heading
            as="h6"
            className="text-base font-medium flex items-center justify-center lg:justify-start pb-4 lg:pb-0 lg:whitespace-nowrap"
          >
            ...{t('global.newsletterText')}
          </Heading>
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
  others?: any;
}) {
  const {t} = useTranslation();
  return (
    <>
      <section className="container relative grid grid-flow-row pt-10 pb-6 divide-y divide-black divide-opacity-25 lg:py-16 lg:grid-cols-6 lg:gap-4 divide-solid lg:divide-none">
        <section className="pb-6 lg:col-span-2 lg:pr-10 lg:pb-0">
          <Heading as="h3" className="mb-4 font-bold tracking-wide">
            {t('global.ourStore')}
          </Heading>
          <Text as="p">{t('global.storeInfo')}</Text>
          <div className="flex items-center gap-3 mt-6">
            <MapMarkerIcon className="text-base" />
            <Text as="p">
              {t('fields.address')}: {others.address1}
            </Text>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <Envelope width={16} height={16} />
            <Text as="p">
              {t('fields.email')}: {others.email}
            </Text>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <PhoneIcon />
            <Text as="p">
              {t('fields.phone')}: {others.phoneNumber}
            </Text>
          </div>
        </section>
        {(menu || []).map(
          (item: any, index: number) =>
            index < 3 && (
              <section className="py-4 lg:py-0" key={item._key}>
                <Disclosure>
                  {({open}) => (
                    <>
                      <Disclosure.Button
                        className={`${
                          open
                            ? 'mb-4'
                            : 'mb-0 lg:mb-8 transition-all duration-75'
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
                                  target={
                                    subItem?.newWindow ? '_blank' : '_self'
                                  }
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
                    <div className="mt-6 -mx-2 text-xl">
                      <Social socials={socials} />
                    </div>
                  </Disclosure.Panel>
                </div>
              </Disclosure.Button>
            )}
          </Disclosure>
        </section>
      </section>
    </>
  );
}

function FooterBottom({others}: {others: any}) {
  const {paymentImage, storeName, storeDomain} = others;
  const {t} = useTranslation();

  return (
    <div className="text-sm bg-gray-200 copyright-style">
      <div className="container flex flex-row items-center justify-between py-6 text-center sm-max:flex-col">
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
