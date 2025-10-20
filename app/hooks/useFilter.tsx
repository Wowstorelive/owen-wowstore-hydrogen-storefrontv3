import {
  ProductFilter,
  FilterValue,
  Filter,
} from '@shopify/hydrogen/storefront-api-types';
import {
  PRODUCTS_SEARCH_FILTERS_QUERY,
  COLLECTION_FILTERS_QUERY,
} from '~/data/shopify';

import {AppLoadContext} from '@shopify/remix-oxygen';

export type ActiveFilterValue = FilterValue & {
  filter: {
    id: Filter['id'];
    label: Filter['label'];
    type: Filter['type'];
  };
  parsedInput: ProductFilter;
  parsedDefaultInput?: ProductFilter;
};

export const useFilter = async ({
  handle,
  searchParams,
  searchTerm,
  // siteSettings,
  storefront,
}: {
  handle?: string;
  searchParams: URLSearchParams;
  searchTerm?: string;
  // siteSettings: RootSiteSettings;
  storefront: AppLoadContext['storefront'];
}): Promise<{
  appliedFilters: ActiveFilterValue[];
  filters: ProductFilter[];
}> => {
  // const enabledFilters =
  //   siteSettings?.data?.siteSettings?.settings?.collection?.filters?.enabled ??
  //   true;

  let appliedFilters: ActiveFilterValue[] = [];
  let defaultFilters: Filter[] = [];

  // if (enabledFilters) {
  if (searchTerm) {
    const defaultFiltersData = await storefront.query(
      PRODUCTS_SEARCH_FILTERS_QUERY,
      {
        variables: {
          searchTerm,
          country: storefront.i18n.country,
          language: storefront.i18n.language,
        },
        cache: storefront.CacheShort(),
      },
    );
    defaultFilters = defaultFiltersData.search?.filters;
  } else if (handle) {
    const defaultFiltersData = await storefront.query(
      COLLECTION_FILTERS_QUERY,
      {
        variables: {
          handle,
          country: storefront.i18n.country,
          language: storefront.i18n.language,
        },
        cache: storefront.CacheShort(),
      },
    );
    defaultFilters = defaultFiltersData.collection?.products?.filters;
  }

  appliedFilters = [...searchParams.entries()].reduce(
    (acc: any[], [_paramKey, _paramValue]) => {
      const paramKey = _paramKey.toLowerCase();
      const paramValue = _paramValue.toLowerCase();

      if (acc.some(({id}) => id === `${paramKey}.${paramValue}`)) return acc;

      const filter = defaultFilters?.find(
        (defaultFilter: Filter) => defaultFilter.id === paramKey,
      );
      if (!filter) return acc;

      if (paramKey === 'filter.v.price') {
        const value = filter.values[0];
        let defaultPrice = {price: {min: null, max: null}};
        try {
          defaultPrice = JSON.parse(value.input as string);
        } catch (error) {}
        const [min, max] = paramValue.split('-').map(Number);
        const {min: defaultMin, max: defaultMax} = defaultPrice.price;
        if (min === defaultMin && max === defaultMax) return acc;
        if (min >= 0 && max >= 0) {
          acc.push({
            ...value,
            parsedInput: {price: {min, max}},
            parsedDefaultInput: defaultPrice,
            filter: {id: filter.id, label: filter.label, type: filter.type},
          });
        }
        return acc;
      }
      const paramValues = paramValue.split(',').filter(Boolean);
      paramValues.forEach((__paramValue) => {
        if (acc.some(({id}) => id === `${paramKey}.${__paramValue}`)) return;
        const paramValueId = `${paramKey}.${__paramValue}`;
        const value = filter.values.find(
          (filterValue: FilterValue) => filterValue.id === paramValueId,
        ) as FilterValue;
        if (value) {
          try {
            acc.push({
              ...value,
              parsedInput: JSON.parse(value.input as string),
              filter: {id: filter.id, label: filter.label, type: filter.type},
            });
          } catch (error) {}
        }
      }, []);
      return acc;
    },
    [],
  );
  // }

  const filters = appliedFilters.map(({parsedInput}) => parsedInput);

  return {appliedFilters, filters};
};
