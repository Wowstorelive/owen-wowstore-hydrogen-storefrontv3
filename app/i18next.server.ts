import {RemixI18Next} from 'remix-i18next';
import {createCookie} from '@shopify/remix-oxygen';

import i18n from '~/i18n';
import {supportedLngs, lngResources} from 'languages.config';

export const localeCookie = createCookie('locale', {
  path: '/',
  httpOnly: true,
});

const i18next = new RemixI18Next({
  detection: {
    supportedLanguages: i18n.supportedLngs,
    fallbackLanguage: i18n.fallbackLng,
    cookie: localeCookie,
  },
  i18next: {
    ...i18n,
    supportedLngs: supportedLngs,
    resources: lngResources,
  },
});

export default i18next;
