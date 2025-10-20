import type {Storefront as HydrogenStorefront} from '@shopify/hydrogen';
import type {
  CountryCode,
  CurrencyCode,
  LanguageCode,
  FilterValue,
  ProductFilter,
  Filter
} from '@shopify/hydrogen/storefront-api-types';

export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

export type Locale = {
  language: LanguageCode;
  country: CountryCode;
  label: string;
  currency: CurrencyCode;
};

export type Localizations = Record<string, Locale>;

export type I18nLocale = Locale & {
  pathPrefix: string;
};

export type Storefront = HydrogenStorefront<I18nLocale>;

export type ParsedValue = FilterValue & {
  isActive?: boolean;
  parsedInput: ProductFilter;
  parsedDefaultInput?: ProductFilter | null;
};

export type AppliedFilterValue = FilterValue & {
  filter: {
    id: Filter['id'];
    label: Filter['label'];
    type: Filter['type'];
  };
  parsedInput: ProductFilter;
  parsedDefaultInput?: ProductFilter;
};
