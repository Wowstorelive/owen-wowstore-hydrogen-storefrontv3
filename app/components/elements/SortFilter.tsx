import {useState, useEffect, useMemo, useCallback} from 'react';
import {Menu, Disclosure} from '@headlessui/react';
import type {Location} from '@remix-run/react';
import {Link, useLocation, useSearchParams} from '@remix-run/react';
import type {
  Filter,
  ProductFilter,
} from '@shopify/hydrogen/storefront-api-types';
import {useTranslation} from 'react-i18next';
import {
  IconFilters,
  IconCaret,
  IconXMark,
  IconClose,
} from '~/components/elements/Icon';

import {Heading} from '~/components/elements/Text';
import {MultiRangeSlider} from '~/components/elements/MultiRangeSlider';

import equal from 'fast-deep-equal';
import {ParsedValue, AppliedFilterValue} from '~/lib/type';
import {nameToHex} from '~/lib/nameToHex';

export type AppliedFilter = {
  label: string;
  filter: ProductFilter;
};

export type SortParam =
  | 'price-low-high'
  | 'price-high-low'
  | 'best-selling'
  | 'newest'
  | 'featured';

type Props = {
  filters: Filter[];
  appliedFilters: AppliedFilterValue[];
  children: React.ReactNode;
  collections?: Array<{handle: string; title: string}>;
};

const LIMITED_OPTIONS = 10;

export const FILTER_URL_PREFIX = 'filter.';
export const FILTER_PRICE_ID = 'filter.v.price';

export function SortFilter({filters, appliedFilters, children}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const {t} = useTranslation();

  useEffect(() => {
    if (window.innerWidth > 1024) {
      setIsOpen(true);
      return;
    }
  }, []);

  return (
    <>
      <div className="flex items-center justify-between lg:justify-end w-full mb-4">
        <Heading
          as="h2"
          onClick={() => setIsOpen(!isOpen)}
          className="relative hidden md-max:flex items-center justify-center"
        >
          <IconFilters />
          <span className="ml-1 text-base font-medium">
            {t('collection.filter')}
          </span>
        </Heading>
        <SortMenu />
      </div>
      <div
        className={`fixed w-screen h-screen top-0 left-0 z-40 bg-black opacity-30 ${
          isOpen ? 'block lg:hidden' : 'hidden'
        }`}
        onClick={() => setIsOpen(!isOpen)}
        aria-hidden="true"
      >
        &nbsp;
      </div>
      <div className="flex flex-col flex-wrap lg:flex-row">
        <div
          className={`transition-all duration-200 min-w-72 w-72 xl-only:w-64 xl-only:min-w-64 bg-white lg:bg-transparent md-max:p-6 lg:pr-8 h-screen lg:h-auto fixed top-0 md-max:z-50 lg:static ${
            isOpen
              ? 'opacity-100 left-0 overflow-y-auto shadow-lg lg:shadow-none'
              : 'md-max:opacity-0 -left-72'
          }`}
        >
          <button
            type="button"
            className={`p-4 absolute top-0 right-0 ${
              isOpen ? 'block lg:hidden' : 'hidden'
            }`}
            onClick={() => setIsOpen(!isOpen)}
            data-test="close-filter"
          >
            <IconClose aria-label="Close panel" />
          </button>
          {isOpen && (
            <FiltersDrawer filters={filters} appliedFilters={appliedFilters} />
          )}
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </>
  );
}

const getFilterKeyValueFromId = (id: string) => {
  const splitId = id.split('.');
  const key = splitId.slice(0, -1).join('.');
  const value = splitId.slice(-1)[0];
  return [key, value];
};

export function FiltersDrawer({
  filters = [],
  appliedFilters,
}: Omit<Props, 'children'>) {
  const [searchParams, setSearchParams] = useSearchParams();

  const {t} = useTranslation();

  const addFilter = useCallback(
    (id: string) => {
      if (!id) return;
      const [key, value] = getFilterKeyValueFromId(id);
      const isPrice = key === FILTER_PRICE_ID;
      if (isPrice) {
        const [min, max] = value.split('-').map(Number);
        if (min >= 0 && max >= 0) {
          searchParams.set(key, value);
        }
      } else {
        const currentParamValue = searchParams.get(key) || '';
        const newParamValue = `${
          currentParamValue ? `${currentParamValue},` : ''
        }${value}`;
        searchParams.set(key, newParamValue);
      }
      setSearchParams(searchParams, {preventScrollReset: true});
    },
    [appliedFilters, searchParams],
  );

  const removeFilter = useCallback(
    (id: string) => {
      const [key, value] = getFilterKeyValueFromId(id);
      const currentParamValue = searchParams.get(key) || '';
      const paramValues = currentParamValue
        .toLowerCase()
        .split(',')
        .filter(Boolean);
      const newParamValue = paramValues
        .filter((paramValue) => paramValue !== value)
        .join(',');
      if (!newParamValue) {
        searchParams.delete(key);
      } else {
        searchParams.set(key, newParamValue);
      }
      setSearchParams(searchParams, {preventScrollReset: true});
    },
    [appliedFilters, searchParams],
  );

  const filterMarkup = (filter: Filter, option: ParsedValue) => {
    const {isActive, id, parsedInput} = option;

    switch (filter.type) {
      case 'PRICE_RANGE':
        const currentMin = parsedInput.price.min;
        const currentMax = parsedInput.price.max;
        const defaultMin = option?.parsedDefaultInput?.price?.min ?? currentMin;
        const defaultMax = option?.parsedDefaultInput?.price?.max ?? currentMax;

        return (
          <div className="mx-auto w-full max-w-[400px] pb-4 md:pb-2">
            <MultiRangeSlider
              key={`${currentMin}-${currentMax}`}
              canReset={isActive}
              isPrice
              min={defaultMin}
              minValue={currentMin}
              max={defaultMax}
              maxValue={currentMax}
              onSubmit={({min, max}: {min: number; max: number}) => {
                const valueId = `${id}.${min}-${max}`;
                addFilter(valueId);
                if (min === defaultMin && max === defaultMax) {
                  removeFilter(valueId);
                } else {
                  addFilter(valueId);
                }
              }}
              onReset={() => {
                const currentValueId = `${id}.${currentMin}-${currentMax}`;
                removeFilter(currentValueId);
              }}
            />
          </div>
        );

      default:
        return (
          <>
            {filter.id == 'filter.v.option.color' ? (
              <button
                className={`relative inline-block text-xs leading-3 items-center flex-col gap-1 text-center rounded-full overflow-hidden ${
                  isActive ? 'border-[1px] border-black' : ''
                }`}
                aria-label={option.label}
                onClick={() => {
                  if (isActive) {
                    removeFilter(option.id);
                  } else {
                    addFilter(option.id);
                  }
                }}
              >
                <span
                  className={`cursor-pointer w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center ${
                    isActive ? 'border-4 border-white' : ''
                  }`}
                  style={{backgroundColor: nameToHex(option.label)}}
                ></span>
              </button>
            ) : filter.id === 'filter.p.vendor' ? (
              <button
                aria-label={option.label}
                className="w-full flex justify-between items-center py-1"
                onClick={() => {
                  if (isActive) {
                    removeFilter(option.id);
                  } else {
                    addFilter(option.id);
                  }
                }}
              >
                <div className="flex items-center gap-x-3">
                  <input
                    type="checkbox"
                    name={option.label}
                    checked={isActive}
                    onChange={() => {}}
                    aria-label={option.label}
                  />
                  <span>{option.label}</span>
                </div>
                <span className="px-2">{option.count}</span>
              </button>
            ) : (
              <button
                className={`cursor-pointer px-3 border border-gray-600 flex items-center justify-center py-1 hover:bg-black hover:text-white ${
                  isActive ? 'bg-black text-white' : ''
                }`}
                aria-label={option.label}
                onClick={() => {
                  if (isActive) {
                    removeFilter(option.id);
                  } else {
                    addFilter(option.id);
                  }
                }}
              >
                {option.label}
              </button>
            )}
          </>
        );
    }
  };

  return (
    <>
      <nav className="pb-8">
        {appliedFilters.length > 0 ? (
          <div className="pb-8">
            <AppliedFilters appliedFilters={appliedFilters} />
          </div>
        ) : null}

        <Heading
          as="h2"
          className="whitespace-pre-wrap font-bold text-lead pb-4"
        >
          {t('collection.filterBy')}
        </Heading>
        <div className="divide-y">
          {filters.map((filter: Filter) => (
            <Disclosure as="div" key={filter.id} defaultOpen className="w-full">
              {({open}) => {
                return (
                  <FilterOptions
                    open={open}
                    filter={filter}
                    filterMarkup={filterMarkup}
                    appliedFilters={appliedFilters}
                  />
                );
              }}
            </Disclosure>
          ))}
        </div>
      </nav>
    </>
  );
}

function FilterOptions({
  open,
  filter,
  filterMarkup,
  appliedFilters,
}: {
  open: boolean;
  filter: Filter;
  filterMarkup: any;
  appliedFilters: AppliedFilterValue[];
}) {
  const [maxItem, setMaxItem] = useState<number>(LIMITED_OPTIONS);
  const {t} = useTranslation();
  const handleShowMore = () => {
    if (maxItem <= LIMITED_OPTIONS) {
      setMaxItem(filter?.values.length);
    } else {
      setMaxItem(LIMITED_OPTIONS);
    }
  };

  const textButton = useMemo(() => {
    if (maxItem <= LIMITED_OPTIONS) {
      return t('global.showMore');
    }

    return t('global.showLess');
  }, [maxItem]);

  const parsedValues = useMemo<ParsedValue[]>(() => {
    return filter.values.map((value) => {
      return {
        ...value,
        parsedInput: JSON.parse(value.input as string),
      };
    });
  }, [filter.values]);

  const parsedValuesWithIsActive = useMemo<ParsedValue[]>(() => {
    return parsedValues.map((value) => {
      let newValue = value;
      if (value.id === FILTER_PRICE_ID) {
        const activePriceValue = appliedFilters.find(
          (filter) => filter.id === 'filter.v.price',
        );
        const parsedDefaultInput = activePriceValue?.parsedDefaultInput || null;
        const isActive =
          !!parsedDefaultInput && !equal(value.parsedInput, parsedDefaultInput);
        newValue = {...newValue, isActive, parsedDefaultInput};
      } else {
        const isActive = appliedFilters.some((filter) => {
          return equal(filter.parsedInput, value.parsedInput);
        });
        newValue = {...newValue, isActive};
      }
      return newValue;
    });
  }, [appliedFilters, parsedValues]);

  return (
    <>
      <Disclosure.Button className="flex justify-between w-full py-4">
        <p className="font-bold">{filter.label}</p>
        <IconCaret direction={open ? 'up' : 'down'} />
      </Disclosure.Button>
      <Disclosure.Panel key={filter.id}>
        <div
          className={
            (filter.id == 'filter.p.vendor' ? 'flex-col gap-1 ' : 'gap-3 ') +
            'flex flex-wrap text-sm pb-6'
          }
        >
          {parsedValuesWithIsActive?.slice(0, maxItem).map((option: any) => {
            return (
              <div
                key={option.id}
                className={`${
                  filter.type === 'PRICE_RANGE' ? 'min-w-full' : ''
                }`}
              >
                {filterMarkup(filter, option)}
              </div>
            );
          })}
          {filter?.values?.length > LIMITED_OPTIONS && (
            <button
              className="px-4 py-1.5 bg-gray-200 mt-3 block text-center w-full"
              onClick={handleShowMore}
            >
              {textButton}
            </button>
          )}
        </div>
      </Disclosure.Panel>
    </>
  );
}

function AppliedFilters({
  appliedFilters,
}: {
  appliedFilters: AppliedFilterValue[];
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const {t} = useTranslation();

  const removeFilter = useCallback(
    (id: string) => {
      const [key, value] = getFilterKeyValueFromId(id);
      const currentParamValue = searchParams.get(key) || '';
      const paramValues = currentParamValue
        .toLowerCase()
        .split(',')
        .filter(Boolean);
      const newParamValue = paramValues
        .filter((paramValue) => paramValue !== value)
        .join(',');
      if (!newParamValue) {
        searchParams.delete(key);
      } else {
        searchParams.set(key, newParamValue);
      }
      setSearchParams(searchParams, { preventScrollReset: true});
    },
    [searchParams, appliedFilters],
  );
  return (
    <>
      <Heading as="h4" size="lead" className="pb-4">
        {t('collection.appliedFilters')}
      </Heading>
      <div className="flex flex-wrap gap-2 text-sm">
        {appliedFilters.map((filterItem) => {
          let id = filterItem.id;
          let filterLabel = filterItem.filter?.label;
          const [key, value] = Object.entries(filterItem.parsedInput)[0];
          let name;
          if (key === 'price') {
            const keyValue = value as {min: number; max: number};
            name = `$${keyValue.min} - $${keyValue.max}`;
            id = `${id}.${keyValue.min}-${keyValue.max}`;
          } else if (key === 'available') {
            if (value === true) name = 'In stock';
            if (value === false) name = 'Out of stock';
            filterLabel = 'Avail';
          } else if (
            typeof value === 'object' &&
            Object.hasOwn({...value}, 'value')
          ) {
            const keyValue = value as {value: string};
            name = keyValue.value;
          } else {
            name = value as string;
          }

          if (!name || typeof name !== 'string') return null;

          return (
            <button
              onClick={() => removeFilter(id)}
              className="flex gap-1 items-center px-3 py-1 border rounded-full gap"
              key={`${filterItem.filter.label}-${JSON.stringify(
                filterItem.label,
              )}`}
            >
              <div className="flex-1 truncate">
                {filterLabel && (
                  <>
                    <span className="font-bold">{filterLabel}:</span>{' '}
                  </>
                )}
                {name}
              </div>
              <span className="w-4 h-4 flex items-center justify-center pb-0.5">
                <IconXMark />
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function getAppliedFilterLink(
  filter: AppliedFilter,
  params: URLSearchParams,
  location: Location,
) {
  const paramsClone = new URLSearchParams(params);
  Object.entries(filter.filter).forEach(([key, value]) => {
    const fullKey = FILTER_URL_PREFIX + key;
    paramsClone.delete(fullKey, JSON.stringify(value));
  });
  paramsClone.delete('cursor');
  paramsClone.delete('direction');
  return `${location.pathname}?${paramsClone.toString()}`;
}

function getSortLink(
  sort: SortParam,
  params: URLSearchParams,
  location: Location,
) {
  params.set('sort', sort);
  params.delete('cursor');
  params.delete('direction');
  return `${location.pathname}?${params.toString()}`;
}

function getFilterLink(
  rawInput: string | ProductFilter,
  params: URLSearchParams,
  location: ReturnType<typeof useLocation>,
) {
  const paramsClone = new URLSearchParams(params);
  const newParams = filterInputToParams(rawInput, paramsClone);
  newParams.delete('cursor');
  newParams.delete('direction');
  return `${location.pathname}?${newParams.toString()}`;
}

function filterInputToParams(
  rawInput: string | ProductFilter,
  params: URLSearchParams,
) {
  const input =
    typeof rawInput === 'string'
      ? (JSON.parse(rawInput) as ProductFilter)
      : rawInput;

  Object.entries(input).forEach(([key, value]) => {
    if (params.has(`${FILTER_URL_PREFIX}${key}`, JSON.stringify(value))) {
      return;
    }
    if (key === 'price') {
      // For price, we want to overwrite
      params.set(`${FILTER_URL_PREFIX}${key}`, JSON.stringify(value));
    } else {
      params.append(`${FILTER_URL_PREFIX}${key}`, JSON.stringify(value));
    }
  });

  return params;
}

export default function SortMenu() {
  const {t} = useTranslation();
  const [params] = useSearchParams();
  const location = useLocation();

  const items = [
    {
      label: t('collection.featured'),
      key: 'featured',
    },
    {
      label: t('collection.priceLowHigh'),
      key: 'price-low-high',
    },
    {
      label: t('collection.priceHighLow'),
      key: 'price-high-low',
    },
    ...(location.pathname !== '/search'
      ? [
          {
            label: t('collection.bestSelling'),
            key: 'best-selling',
          },
          {
            label: t('collection.newest'),
            key: 'newest',
          },
        ]
      : []),
  ];

  const activeItem = items.find((item) => item.key === params.get('sort'));

  return (
    <Menu as="div" className="relative z-20">
      <Menu.Button className="flex items-center">
        <span className="px-2">
          <span className="px-2 font-medium">{t('collection.sortBy')}</span>
          <span>{(activeItem || items[0]).label}</span>
        </span>
        <IconCaret />
      </Menu.Button>

      <Menu.Items
        as="nav"
        className="absolute right-0 flex flex-col border rounded-sm bg-white divide-y"
      >
        {items.map((item) => (
          <Menu.Item key={item.label}>
            {() => (
              <Link
                className={`block text-sm px-4 py-2 ${
                  activeItem?.key === item.key ? 'font-bold' : 'font-normal'
                }`}
                to={getSortLink(item.key, params, location)}
              >
                {item.label}
              </Link>
            )}
          </Menu.Item>
        ))}
      </Menu.Items>
    </Menu>
  );
}
