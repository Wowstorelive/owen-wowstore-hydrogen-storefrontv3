import clsx from 'clsx';
import {json, redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction} from '@remix-run/react';
import {Money, Image, flattenConnection} from '@shopify/hydrogen';
import type {FulfillmentStatus} from '@shopify/hydrogen/customer-account-api-types';
import {useTranslation} from 'react-i18next';
import type {OrderFragment} from 'customer-accountapi.generated';
import i18next from '~/i18next.server';
import {statusMessage} from '~/lib/utils';

import {Heading, PageHeader, Text} from '~/components/elements/Text';
import {Link} from '~/components/elements/Link';

import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: `Order ${data?.order?.name}`}];
};

export async function loader({request, context, params}: LoaderFunctionArgs) {
  if (!params.id) {
    return redirect(params?.locale ? `${params.locale}/account` : '/account');
  }

  const locale = context.storefront.i18n.language.toLowerCase();
  const t = await i18next.getFixedT(locale);

  const queryParams = new URL(request.url).searchParams;
  const orderToken = queryParams.get('key');

  try {
    const orderId = orderToken
      ? `gid://shopify/Order/${params.id}?key=${orderToken}`
      : `gid://shopify/Order/${params.id}`;

    const {data, errors} = await context.customerAccount.query(
      CUSTOMER_ORDER_QUERY,
      {variables: {orderId}},
    );

    if (errors?.length || !data?.order || !data?.order?.lineItems) {
      throw new Error('order information');
    }

    const order: OrderFragment = data.order;

    const lineItems = flattenConnection(order.lineItems);

    const discountApplications = flattenConnection(order.discountApplications);

    const firstDiscount = discountApplications[0]?.value;

    const discountValue =
      firstDiscount?.__typename === 'MoneyV2' && firstDiscount;

    const discountPercentage =
      firstDiscount?.__typename === 'PricingPercentageValue' &&
      firstDiscount?.percentage;

    const fulfillments = flattenConnection(order.fulfillments);

    const fulfillmentStatus = fulfillments.length > 0 ? fulfillments[0].status : ('OPEN' as FulfillmentStatus);

    return json(
      {
        order,
        lineItems,
        discountValue,
        discountPercentage,
        fulfillmentStatus,
      },
    );
  } catch (error) {
    throw new Response(error instanceof Error ? error.message : undefined, {
      status: 404,
    });
  }
}

export default function OrderRoute() {
  const {order, lineItems, discountValue, discountPercentage, fulfillmentStatus} = useLoaderData<typeof loader>();
  const {t} = useTranslation();

  return (
    <div>
      <PageHeader heading={t('order.orderDetails')}>
        <Link to="/account">
          <Text color="subtle">{t('order.returnAccount')}</Text>
        </Link>
      </PageHeader>
      <div className="container p-6 lg:p-12 lg:py-6">
        <div>
          <Text as="h3" size="lead">
            {t('order.orderNo')} {order.name}
          </Text>
          <Text className="mt-2" as="p">
            {t('order.placedOn')} {new Date(order.processedAt!).toDateString()}
          </Text>
          <div className="grid items-start gap-4 md:grid-cols-4 md:gap-8 lg:gap-16 sm:divide-y sm:divide-gray-200">
            <table className="min-w-full my-8 divide-y divide-gray-300 md:col-span-3">
              <thead>
                <tr className="align-baseline ">
                  <th
                    scope="col"
                    className="pb-4 pl-0 pr-3 font-semibold text-left"
                  >
                    {t('global.product')}
                  </th>
                  <th
                    scope="col"
                    className="hidden px-4 pb-4 font-semibold text-right sm:table-cell md:table-cell"
                  >
                    {t('global.price')}
                  </th>
                  <th
                    scope="col"
                    className="hidden px-4 pb-4 font-semibold text-right sm:table-cell md:table-cell"
                  >
                    {t('global.quantity')}
                  </th>
                  <th
                    scope="col"
                    className="px-4 pb-4 font-semibold text-right"
                  >
                    {t('global.total')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lineItems.map((lineItem) => (
                  <tr key={lineItem.id}>
                    <td className="w-full py-4 pl-0 pr-3 align-top sm:align-middle max-w-0 sm:w-auto sm:max-w-none">
                      <div className="flex gap-6">
                        {lineItem?.image && (
                          <div className="w-24 card-image aspect-square">
                            <Image
                              data={lineItem.image}
                              width={96}
                              height={96}
                            />
                          </div>
                        )}
                        <div className="flex-col justify-center hidden lg:flex">
                          <Text as="p">{lineItem.title}</Text>
                          <Text size="fine" className="mt-1" as="p">
                            {lineItem.variantTitle}
                          </Text>
                        </div>
                        <dl className="grid">
                          <dt className="sr-only">Product</dt>
                          <dd className="truncate lg:hidden">
                            <Heading size="copy" format as="h3">
                              {lineItem.title}
                            </Heading>
                            <Text size="fine" className="mt-1">
                              {lineItem.variantTitle}
                            </Text>
                          </dd>
                          <dt className="sr-only">{t('global.price')}</dt>
                          <dd className="truncate sm:hidden">
                            <Text size="fine" className="mt-4">
                              <Money data={lineItem.price!} />
                            </Text>
                          </dd>
                          <dt className="sr-only">{t('global.quantity')}</dt>
                          <dd className="truncate sm:hidden">
                            <Text className="mt-1" size="fine">
                              {t('global.qty')}: {lineItem.quantity}
                            </Text>
                          </dd>
                        </dl>
                      </div>
                    </td>
                    <td className="hidden px-3 py-4 text-right align-top sm:align-middle sm:table-cell">
                      <Money data={lineItem.price!} />
                    </td>
                    <td className="hidden px-3 py-4 text-right align-top sm:align-middle sm:table-cell">
                      {lineItem.quantity}
                    </td>
                    <td className="px-3 py-4 text-right align-top sm:align-middle sm:table-cell">
                      <Text>
                        <Money data={lineItem.totalDiscount!} />
                      </Text>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {((discountValue && discountValue.amount) ||
                  discountPercentage) && (
                  <tr>
                    <th
                      scope="row"
                      colSpan={3}
                      className="hidden pt-6 pl-6 pr-3 font-normal text-right sm:table-cell md:pl-0"
                    >
                      <Text>{t('global.discounts')}</Text>
                    </th>
                    <th
                      scope="row"
                      className="pt-6 pr-3 font-normal text-left sm:hidden"
                    >
                      <Text>{t('global.discounts')}</Text>
                    </th>
                    <td className="pt-6 pl-3 pr-4 font-medium text-right text-green-700 md:pr-3">
                      {discountPercentage ? (
                        <span className="text-sm">
                          -{discountPercentage}% OFF
                        </span>
                      ) : (
                        discountValue && <Money data={discountValue!} />
                      )}
                    </td>
                  </tr>
                )}
                <tr>
                  <th
                    scope="row"
                    colSpan={3}
                    className="hidden pt-6 pl-6 pr-3 font-normal text-right sm:table-cell md:pl-0"
                  >
                    <Text>{t('global.subtotal')}</Text>
                  </th>
                  <th
                    scope="row"
                    className="pt-6 pr-3 font-normal text-left sm:hidden"
                  >
                    <Text>{t('global.subtotal')}</Text>
                  </th>
                  <td className="pt-6 pl-3 pr-4 text-right md:pr-3">
                    <Money data={order.subtotal!} />
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    colSpan={3}
                    className="hidden pt-4 pl-6 pr-3 font-normal text-right sm:table-cell md:pl-0"
                  >
                    {t('global.tax')}
                  </th>
                  <th
                    scope="row"
                    className="pt-4 pr-3 font-normal text-left sm:hidden"
                  >
                    <Text>{t('global.tax')}</Text>
                  </th>
                  <td className="pt-4 pl-3 pr-4 text-right md:pr-3">
                    <Money data={order.totalTax!} />
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    colSpan={3}
                    className="hidden pt-4 pl-6 pr-3 font-semibold text-right sm:table-cell md:pl-0"
                  >
                    {t('global.total')}
                  </th>
                  <th
                    scope="row"
                    className="pt-4 pr-3 font-semibold text-left sm:hidden"
                  >
                    <Text>{t('global.total')}</Text>
                  </th>
                  <td className="pt-4 pl-3 pr-4 font-semibold text-right md:pr-3">
                    <Money data={order.totalPrice!} />
                  </td>
                </tr>
              </tfoot>
            </table>
            <div className="sticky border-none top-nav md:my-8">
              <Heading size="copy" className="font-semibold" as="h3">
                {t('order.shippingAddress')}
              </Heading>
              {order?.shippingAddress ? (
                <ul className="mt-6">
                  <li>
                    <Text>{order.shippingAddress.name}</Text>
                  </li>
                  {order?.shippingAddress?.formatted ? (
                    order.shippingAddress.formatted.map((line: string) => (
                      <li key={line}>
                        <Text>{line}</Text>
                      </li>
                    ))
                  ) : (
                    <></>
                  )}
                </ul>
              ) : (
                <p className="mt-3">{t('order.noShippingAddress')}</p>
              )}
              <Heading size="copy" className="mt-8 font-semibold" as="h3">
                {t('order.status')}
              </Heading>
              {fulfillmentStatus && (
                <div
                  className={clsx(
                    `mt-3 px-3 py-1 text-xs font-medium rounded-full inline-block w-auto`,
                    fulfillmentStatus === 'SUCCESS'
                      ? 'bg-green-200 text-green-800'
                      : 'bg-primary/20 text-primary/50',
                  )}
                >
                  <Text size="fine">{statusMessage(fulfillmentStatus!)}</Text>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
