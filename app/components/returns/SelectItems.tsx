import {useContext} from 'react';
import {useTranslation} from 'react-i18next';
import {ReturnContext} from './ReturnForm';

export function SelectItems() {
  const {setStep, orderInfo, selectedItems, setSelectedItems} =
    useContext(ReturnContext);

  const fulfillmentLineItems =
    orderInfo.node.fulfillments[0].fulfillmentLineItems.edges;
  const {t} = useTranslation();

  return (
    <div className="text-md">
      <div className="text-xl font-semibold text-center">
        {t('order.orderNo')} {orderInfo.node.name}
      </div>
      <div className="text-center">
        {new Date(orderInfo.node.createdAt).toDateString()}
      </div>
      <div className="w-full mx-auto pb-3">
        <div className="py-4 flex justify-between items-center">
          <span>{t('global.items')}</span>
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => {
              setSelectedItems((prev: any) =>
                prev.length === fulfillmentLineItems.length
                  ? []
                  : fulfillmentLineItems,
              );
            }}
            aria-hidden="true"
          >
            <span>{t('global.selectAll')}</span>
            <input
              type="checkbox"
              onChange={() => {}}
              checked={fulfillmentLineItems.length === selectedItems.length}
              className="rounded text-black"
            />
          </div>
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {fulfillmentLineItems.map((fulfillmentLineItem: any) => {
            const image = {url: '', altText: ''};
            const lineItem = fulfillmentLineItem.node.lineItem;

            try {
              image.url = lineItem.product.images.nodes[0].url;
              image.altText = lineItem.product.images.nodes[0].altText;
            } catch (error) {}

            const selectedOptions = lineItem.variant.selectedOptions;

            const {refundableQuantity} = lineItem;

            return (
              !!refundableQuantity && (
                <div
                  key={fulfillmentLineItem.node.id}
                  className="flex flex-col gap-1 relative cursor-pointer"
                  onClick={() => {
                    setSelectedItems((prev: any) => {
                      const isSelected = prev.some(
                        (item: any) =>
                          item.node.id === fulfillmentLineItem.node.id,
                      );
                      return isSelected
                        ? prev.filter(
                            (item: any) =>
                              item.node.id !== fulfillmentLineItem.node.id,
                          )
                        : [...prev, fulfillmentLineItem];
                    });
                  }}
                  aria-hidden="true"
                >
                  {image.url && (
                    <img
                      className="aspect-square fadeIn cover"
                      draggable="false"
                      alt={image.altText ?? 'Order image'}
                      src={image.url}
                    />
                  )}
                  <div className="pt-3 pb-1 font-medium text-sm">
                    {lineItem.title}
                  </div>
                  <div className="text-sm">Qty: {lineItem.quantity}</div>
                  {selectedOptions.map(
                    (option: any) =>
                      option.value !== 'Default Title' && (
                        <div key={option.value} className="text-sm">
                          {option.name}: {option.value}
                        </div>
                      ),
                  )}

                  <input
                    type="checkbox"
                    onChange={() => {}}
                    checked={selectedItems.some(
                      (item: any) =>
                        item.node.id === fulfillmentLineItem.node.id,
                    )}
                    className="absolute top-4 left-4 rounded text-black"
                  />
                </div>
              )
            );
          })}
        </div>
        <div className="flex gap-4 justify-center mt-8 border-t pt-8">
          <button
            className="text-center border border-black rounded py-2 px-10 cursor-pointer"
            onClick={() => {
              setStep((prev: number) => --prev);
              window.scrollTo({top: 0, behavior: 'smooth'});
            }}
            aria-hidden="true"
          >
            {t('global.back')}
          </button>
          <button
            className={`text-center ${
              selectedItems.length === 0
                ? 'bg-gray-300 text-gray-500 select-none border-gray-300 pointer-events-none'
                : 'bg-black border-black text-white'
            } border rounded py-2 px-10`}
            onClick={() => {
              setStep((prev: number) => ++prev);
              window.scrollTo({top: 0, behavior: 'smooth'});
            }}
          >
            {t('global.next')}
          </button>
        </div>
      </div>
    </div>
  );
}
