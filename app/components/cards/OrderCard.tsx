import {flattenConnection, Image} from '@shopify/hydrogen';
import {useTranslation} from 'react-i18next';

import type {OrderCardFragment} from 'customer-accountapi.generated';
import {Heading, Text} from '~/components/elements/Text';
import {Link} from '~/components/elements/Link';
import {statusMessage} from '~/lib/utils';

export function OrderCard({order}: {order: OrderCardFragment}) {
  const {t} = useTranslation();
  if (!order?.id) return null;
  const [legacyOrderId, key] = order!.id!.split('/').pop()!.split('?');
  const lineItems = flattenConnection(order?.lineItems);
  const fulfillmentStatus = flattenConnection(order?.fulfillments)[0]?.status;

  const url = key
    ? `/account/orders/${legacyOrderId}?${key}`
    : `/account/orders/${legacyOrderId}`;

  return (
    <li className="grid text-center border rounded">
      <Link
        className="grid items-center gap-4 p-4 md:gap-6 md:p-6 md:grid-cols-2"
        to={url}
        prefetch="intent"
      >
        {lineItems[0].image && (
          <div className="card-image aspect-square bg-primary/5">
            <Image
              width={168}
              height={168}
              className="w-full fadeIn cover"
              alt={lineItems[0].image.altText ?? 'Order image'}
              src={lineItems[0].image.url}
            />
          </div>
        )}
        <div
          className={`flex-col justify-center text-left ${
            !lineItems[0].image && 'md:col-span-2'
          }`}
        >
          <Heading as="h3" format size="copy">
            {lineItems.length > 1
              ? `${lineItems[0].title} +${lineItems.length - 1} more`
              : lineItems[0].title}
          </Heading>
          <dl className="grid grid-gap-1">
            <dt className="sr-only">{t('order.orderId')}</dt>
            <dd>
              <Text size="fine" color="subtle">
                {t('order.orderNo')} {order.number}
              </Text>
            </dd>
            <dt className="sr-only">{t('order.orderDate')}</dt>
            <dd>
              <Text size="fine" color="subtle">
                {new Date(order.processedAt).toDateString()}
              </Text>
            </dd>
            {fulfillmentStatus && (
              <>
                <dt className="sr-only">{t('account.fulfillmentStatus')}</dt>
                <dd className="mt-2">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      fulfillmentStatus === 'SUCCESS'
                        ? 'bg-green-200 text-green-800'
                        : 'bg-gray-300 text-gray-300'
                    }`}
                  >
                    <Text size="fine">{statusMessage(fulfillmentStatus)}</Text>
                  </span>
                </dd>
              </>
            )}
          </dl>
        </div>
      </Link>
      <div className="self-end border-t">
        <Link
          className="block w-full p-2 text-center bg-black text-white"
          to={url}
          prefetch="intent"
        >
          <span>
            {t('button.viewDetails')}
          </span>
        </Link>
      </div>
    </li>
  );
}
