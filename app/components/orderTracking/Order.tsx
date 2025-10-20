import {useContext} from 'react';
import {Image} from '@shopify/hydrogen';
import {useTranslation} from 'react-i18next';
import {CompleteIcon} from '~/components/elements/Icon';
import {Link} from '~/components/elements/Link';
import {Button} from '~/components/elements/Button';

import {OrderTrackingContext} from './OrderTrackingForm';

export function Order() {
  const {orderInfo} = useContext(OrderTrackingContext);
  const {t} = useTranslation();
  const {node} = orderInfo;

  const currencyMoney = (money: number, currency: string) => {
    const convert = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    });

    return convert.format(money);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-3/5 flex flex-col gap-y-6">
        <div className="flex gap-4 items-center">
          <CompleteIcon className="!w-10 !h-10 fill-blue-800" />
          <div className="">
            <p className="text-sm text-gray-600">
              {t('order.orderNo')} {node.name}
            </p>
            <p className="text-xl font-semibold">
              {t('global.thankYou')} {node.billingAddress?.firstName}!
            </p>
          </div>
        </div>
        <div className="p-4 border border-solid border-gray-300 rounded-md">
          <p className="text-xl mb-2">{t('order.orderConfirmed')}</p>
          <p className="text-sm text-gray-600">{t('order.orderReceived')}</p>
        </div>
        <div className="p-4 border border-solid border-gray-300 rounded-md">
          <p className="text-xl mb-2">{t('order.orderDetails')}</p>
          <div className="flex flex-row gap-4">
            <div className="flex flex-col w-1/2 gap-y-5">
              <div>
                <p className="text-base mb-2">{t('order.contactInfo')}</p>
                <p className="text-sm text-gray-600">{node.email}</p>
              </div>
              <div>
                <p className="text-base mb-2">{t('order.shippingAddress')}</p>
                <ul className="flex flex-col gap-y-1">
                  <li>
                    <p className="text-sm text-gray-600">
                      {node?.shippingAddress?.firstName +
                        node.shippingAddress?.lastName}
                    </p>
                  </li>
                  <li>
                    <p className="text-sm text-gray-600">
                      {node?.shippingAddress?.address1}
                    </p>
                  </li>
                  <li>
                    <p className="text-sm text-gray-600">
                      {node?.shippingAddress?.address2}
                    </p>
                  </li>
                  <li>
                    <p className="text-sm text-gray-600">
                      {node?.shippingAddress?.city + node.shippingAddress?.zip}
                    </p>
                  </li>
                  <li>
                    <p className="text-sm text-gray-600">
                      {node?.shippingAddress?.country}
                    </p>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col w-1/2 gap-y-5">
              <div>
                <p className="text-base mb-2">{t('order.paymentMethods')}</p>
                <p className="text-sm text-gray-600">
                  {node.paymentGatewayNames}
                </p>
              </div>
              <div>
                <p className="text-base mb-2">{t('order.paymentAddress')}</p>
                <ul className="flex flex-col gap-y-1">
                  <li>
                    <p className="text-sm text-gray-600">
                      {node?.billingAddress?.firstName +
                        node.billingAddress?.lastName}
                    </p>
                  </li>
                  <li>
                    <p className="text-sm text-gray-600">
                      {node?.billingAddress?.address1}
                    </p>
                  </li>
                  <li>
                    <p className="text-sm text-gray-600">
                      {node?.billingAddress?.address2}
                    </p>
                  </li>
                  <li>
                    <p className="text-sm text-gray-600">
                      {node?.billingAddress?.city + node.billingAddress?.zip}
                    </p>
                  </li>
                  <li>
                    <p className="text-sm text-gray-600">
                      {node?.billingAddress?.country}
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between flex-col md:flex-row gap-2 items-center">
          <div>
            <span className="text-gray-600">{t('global.needHelp')}</span>
            <Link
              to={`/pages/contact`}
              className="text-blue-700"
              prefetch="intent"
            >
              {t('global.contactUs')}
            </Link>
          </div>
          <div>
            <Button
              to="/"
              width="auto"
              className="bg-blue-600 text-white inline-block rounded font-medium text-center py-3 px-6"
            >
              {t('global.continueShopping')}
            </Button>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-2/5 flex flex-col gap-y-7 bg-gray-100 p-6 justify-between">
        <div className="flex flex-col gap-y-4 max-h-[500px] overflow-y-auto pt-4">
          {node?.fulfillments[0]?.fulfillmentLineItems.edges?.map(
            (item: any, index: number) => {
              return (
                <div key={index} className="flex gap-x-4 justify-between">
                  <div className="flex gap-x-4">
                    <div className="min-w-20 md:min-w-24 relative">
                      <Image
                        src={
                          item?.node?.lineItem?.product?.images?.nodes[0]?.url
                        }
                        alt={item?.node?.lineItem?.title}
                        className="object-cover object-center aspect-square w-full border border-gray-300 rounded-md"
                        width={110}
                        height={110}
                      />
                      <span className="absolute w-6 h-6 text-white text-center bg-gray-500 rounded-full top-0 right-0 rtl:left-0 rtl:right-auto translate-x-1/2 -translate-y-1/2">
                        {item.node.lineItem.quantity}
                      </span>
                    </div>
                    <div className="flex flex-col justify-start">
                      <p className="font-medium">
                        {item.node?.lineItem?.title}
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        {item.node?.lineItem?.variant?.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <p>
                      {currencyMoney(
                        item.node?.lineItem?.variant?.price,
                        'USD',
                      )}
                    </p>
                  </div>
                </div>
              );
            },
          )}
        </div>
        <div className="flex flex-col gap-y-1 justify-between border-t border-solid border-gray-300">
          <div className="flex justify-between mt-3">
            <p>{t('global.subtotal')}</p>
            <p>
              {currencyMoney(
                node.currentSubtotalPriceSet.presentmentMoney.amount,
                node.currentSubtotalPriceSet.presentmentMoney.currencyCode,
              )}
            </p>
          </div>
          <div className="flex justify-between">
            <p>{t('product.shipping')}</p>
            <p>
              {parseFloat(node.totalShippingPriceSet.presentmentMoney.amount)
                ? currencyMoney(
                    node.totalShippingPriceSet.presentmentMoney.amount,
                    node.totalShippingPriceSet.presentmentMoney.currencyCode,
                  )
                : t('order.calculateNextStep')}
            </p>
          </div>
          <div className="flex justify-between">
            <p>{t('global.tax')}</p>
            <p>
              {currencyMoney(
                node.currentTotalTaxSet.presentmentMoney.amount,
                node.currentTotalTaxSet.presentmentMoney.currencyCode,
              )}
            </p>
          </div>
        </div>
        <div className="border-t border-solid border-gray-300">
          <div className="flex justify-between mt-3">
            <p>{t('global.total')}</p>
            <p>
              <span className="text-xl font-semibold">
                {currencyMoney(
                  node.currentTotalPriceSet.presentmentMoney.amount,
                  node.currentTotalPriceSet.presentmentMoney.currencyCode,
                )}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
