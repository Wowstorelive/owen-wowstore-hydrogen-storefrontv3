import enCommon from './app/assets/locales/en/common.json';
import jaCommon from './app/assets/locales/ja/common.json';
import deCommon from './app/assets/locales/de/common.json';
import arCommon from './app/assets/locales/ar/common.json';

export const defaultLng = 'en';
export const supportedLngs = ['ja', 'de', 'ar', 'en'];

export const lngResources = {
    en: {common: enCommon},
    ar: {common: arCommon},
    de: {common: deCommon},
    ja: {common: jaCommon},
}
