import type {
  ProductFragment,
  SellingPlanGroupFragment,
  SellingPlanFragment,
} from 'storefrontapi.generated';
import {useEffect, useMemo} from 'react';
import {useLocation, useNavigate} from '@remix-run/react';
import { useStoreContext } from '~/components/global/StoreContext';
import { BoxIcon, ClockIcon, IconShipping } from '~/components/elements/Icon';
import {Text} from '~/components/elements/Text';
import {Link} from '~/components/elements/Link';

import { useTranslation } from 'react-i18next';
import { Money } from '@shopify/hydrogen';

/* Enriched sellingPlan type including isSelected and url */
export type SellingPlan = SellingPlanFragment & {
  isSelected: boolean;
  url: string;
};

/* Enriched sellingPlanGroup type including enriched SellingPlan nodes */
export type SellingPlanGroup = Omit<
  SellingPlanGroupFragment,
  'sellingPlans'
> & {
  sellingPlans: {
    nodes: SellingPlan[];
  };
};

export function SellingPlanSelector({
  sellingPlanGroups,
  selectedSellingPlan,
  paramKey = 'selling_plan',
  variants
}: {
  sellingPlanGroups: ProductFragment['sellingPlanGroups'];
  selectedSellingPlan: SellingPlanFragment | null;
  paramKey?: string;
  variants: any;
}) {
  const {t} = useTranslation();

  const {subcription, setSubcription} = useStoreContext() as any;

  const {search, pathname} = useLocation();
  const params = new URLSearchParams(search);
  const navigate = useNavigate();
  const dataSellingPlans = useMemo(
    () =>
      // @ts-ignore
      sellingPlanGroups?.nodes?.map((sellingPlanGroup: SellingPlanGroup) => {
        // Augmnet each sellingPlan node with isSelected and url
        const sellingPlans = sellingPlanGroup.sellingPlans.nodes
          .map((sellingPlan) => {
            if (!sellingPlan?.id) {
              // @ts-ignore
              console.warn(
                'SellingPlanSelector: sellingPlan.id is missing in the product query',
              );
              return null;
            }
            if (!sellingPlan.id) return null;
            params.set(paramKey, sellingPlan.id);
            sellingPlan.isSelected = selectedSellingPlan?.id === sellingPlan.id;
            sellingPlan.url = `${pathname}?${params.toString()}`;
            return sellingPlan as SellingPlan;
          })
          .filter(Boolean);
        sellingPlanGroup.sellingPlans.nodes = sellingPlans;

        return {sellingPlanGroup, selectedSellingPlan};
      }),
    [sellingPlanGroups],
  );

  const sellingPlanGroup = useMemo(() => {
    const sellingPlan = dataSellingPlans?.find((item) => item.sellingPlanGroup.name == subcription);

    return sellingPlan?.sellingPlanGroup;
  },[subcription, dataSellingPlans]);

  useEffect(() => {
    if(sellingPlanGroups && sellingPlanGroups?.nodes.length > 0) {
      setSubcription(sellingPlanGroups.nodes[0].name);
    }
  },[]);

  useEffect(() => {
    if(sellingPlanGroup?.sellingPlans && subcription !== 'oneTimePurchase') {
      navigate(sellingPlanGroup?.sellingPlans?.nodes[0].url, {preventScrollReset: true});
    }
  },[subcription]);

  return (
    <div className="flex flex-col gap-3 border border-black rounded-md justify-between p-3">
      <p>
        <strong>{t('product.subscribeAndSave')}:</strong>
      </p>
      <div className="grid grid-cols-2 gap-3 justify-between">
        {
          dataSellingPlans ? dataSellingPlans.map((dataSellingPlan, index) => {
            return (
              // <div className="flex">
                <div
                  className={`sellingOption flex  flex-col justify-between text-center items-center p-2 py-5 border-2 rounded-md cursor-pointer ${subcription == dataSellingPlan.sellingPlanGroup.name ? 'border-black' : 'border-gray-400 opacity-60'}`}
                  onClick={() => setSubcription(dataSellingPlan.sellingPlanGroup.name)}
                  key={index}
                  >
                  <span className="relative">
                    <ClockIcon className="w-7 h-7 absolute top-2 left-1.5" />
                    <IconShipping className="w-14 h-14" />
                  </span>
                  <p className={`${subcription ? 'text-black' : ''} font-medium leading-tight`}>{dataSellingPlan.sellingPlanGroup.name}</p>
                </div>
              // </div>
            )
          }) : null
        }
        <div
          className={`sellingOption flex w-full gap-3 justify-center text-center items-center p-2 py-3 border-2 rounded-md cursor-pointer ${subcription == 'oneTimePurchase' ? 'border-black' : 'border-gray-400 opacity-60'} ${dataSellingPlans.length % 2 !== 0 ? 'flex-col' : ''}`}
          onClick={() => setSubcription('oneTimePurchase')}
        >
        <BoxIcon className="w-12 h-12" />
        <p className={`${subcription == 'oneTimePurchase' ? 'text-black' : ''} font-medium leading-tight`}>{t('product.oneTimePurchase')}</p>
      </div>
      </div>
      
      <div>
        {
          sellingPlanGroup || variants ? (
            <SellingPlanGroup 
              sellingPlanGroup={sellingPlanGroup}
              sellingPlanAllocations={variants[0]?.sellingPlanAllocations}
          />
          ) : null
        }
      </div>
    </div>
  )
}

export function SellingPlanGroup({
  sellingPlanGroup,
  sellingPlanAllocations
}: {
  sellingPlanGroup: SellingPlanGroup;
  sellingPlanAllocations: any;
}) {
  const plans = sellingPlanGroup?.sellingPlans.nodes?.map((item) => {
    const price = sellingPlanAllocations?.nodes.find((plan: any) => plan.sellingPlan.id == item.id);
    return {
      ...item,
      price: price ? price.priceAdjustments[0] : []
    }
  });

  return (
    <div>
      <div className="flex flex-col gap-2">
        {
          plans?.map((sellingPlan) => {
            return (
              <Link
                key={sellingPlan.id}
                prefetch="intent"
                to={sellingPlan.url}
                className={`flex border rounded-md inline-block p-4 py-2 leading-none hover:no-underline cursor-pointer transition-all duration-200
                  ${
                    sellingPlan.isSelected
                      ? "border-black"
                      : "border-black-100"
                  }`}
                preventScrollReset
                replace
              >
                <div className="flex gap-2 w-full justify-between items-center">
                    {
                      sellingPlan.options.map((option: any, index: number) => {
                          return (
                            <p key={index} className="w-full md-max:text-sm">
                              {option.value}
                            </p>
                          )
                        },
                      )
                    }
                    {/* sellingPlanAllocations */}
                  <SellingPlanPrice
                    selectedSellingPlan={sellingPlan}
                    type="small"
                  />
                </div>
              </Link>
            );
          })
        }
      </div>
    </div>
  );
}

type SellingPlanPrice = {
  amount: number;
  currencyCode: CurrencyCode;
};

function SellingPlanPrice({
  selectedSellingPlan,
  type,
}: {
  selectedSellingPlan: SellingPlanFragment;
  type?: string;
}) {
  const sellingPlanPrice = selectedSellingPlan.price;

  return (
    <div className={`${type === 'small' ? 'text-xl font-semibold' : 'text-xl font-semibold my-4'}`}>
        <Text as="h2" className="flex gap-2 items-center">
          <Money
            data={{
              amount: `${sellingPlanPrice.price.amount}`,
              currencyCode: sellingPlanPrice.price.currencyCode,
            }}
            as="span"
            className={`${type === 'small' ? 'text-md' : 'text-2xl'}`}
            data-test="price"
          />
          {sellingPlanPrice && (
            <Money
              data={{
                amount: `${sellingPlanPrice.compareAtPrice.amount}`,
                currencyCode: sellingPlanPrice.compareAtPrice.currencyCode,
              }}
              as="span"
              className="opacity-70 font-normal line-through"
            />
          )}
        </Text>
      </div>
  );
}