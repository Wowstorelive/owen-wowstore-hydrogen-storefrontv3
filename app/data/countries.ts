import type {Localizations} from '~/lib/type';

export const countries: Localizations = {
  default: {
    label: 'English (USD $)',
    language: 'EN',
    country: 'US',
    currency: 'USD',
  },
  '/ar-sa': {
    label: 'Arabic (SAR SR)',
    language: 'AR',
    country: 'SA',
    currency: 'SAR',
  },
  '/de-de': {
    label: 'Germany (EUR €)',
    language: 'DE',
    country: 'DE',
    currency: 'EUR',
  },
  '/ja-jp': {
    label: 'Japan (JPY ¥)',
    language: 'JA',
    country: 'JP',
    currency: 'JPY',
  },
};
