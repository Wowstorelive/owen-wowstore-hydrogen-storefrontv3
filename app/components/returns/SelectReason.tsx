import {useContext, useEffect, useState} from 'react';
import {toast} from 'react-hot-toast';
import {useTranslation} from 'react-i18next';
import {CustomInput as Input} from '~/components/elements/CustomInput';
import {IconXMark} from '~/components/elements/Icon';
import {ReturnContext} from './ReturnForm';
import {getBase64} from '~/lib/utils';

export function SelectReason() {
  const {
    setStep,
    orderInfo,
    selectedItems,
    selectedImages,
    imageUpload,
    setSelectedImages,
    setImageUpload,
    message,
    setMessage,
  } = useContext(ReturnContext);

  const maxImagesUpload = 5;
  const MAX_FILE_SIZE = 5000; // 5MB
  const {t} = useTranslation();

  const [formCheck, setFormCheck] = useState(false);
  const [formSending, setFormSending] = useState(false);
  const [onChangeImageUpload, setOnChangeImageUpload] = useState([])

  const checkFileSize = (imageUpload: any) => {
    let flag = 0;
    for (const file of imageUpload) {
      if((file.size / 1000) > MAX_FILE_SIZE) {
        flag = 1;
      }
    }

    return flag ? false : true;
  }

  //SUBMIT RETURN REQUEST
  const handleSubmit = async () => {
    setFormCheck(true);
    if (message === '') {
      toast.error(t('errorMesg.tellReason'));
      return;
    }
    if (!checkFileSize(imageUpload)) {
      toast.error(t('errorMesg.returnImageLimit'));
      return
    }

    setFormSending(true);

    const orderId = orderInfo.node.id;

    const returnLineItems = selectedItems.map((item: any) => {
      return {
        fulfillmentLineItemId: item.node.id,
        quantity: item.node.lineItem.refundableQuantity,
        returnReason: 'OTHER',
        customerNote: message,
      };
    });

    const url = '/api/createReturn';
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        orderName: orderInfo.node.name,
        returnLineItems,
        files: imageUpload
      }),
    };

    const response: any = await fetch(url, options)
      .then((res) => res.json())
      .catch((err) => err);

    if(response.data?.returnRequest?.userErrors[0]?.message) {
      toast.error(response.data?.returnRequest?.userErrors[0].message);
      setFormSending(false);
      return;
    }
    if (response.data?.returnRequest?.return) {
      setFormSending(false);
      setStep((prev: number) => ++prev);
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  };

  const handleRemoveImage = (url: string, index :number) => {
    const newArrayUpload = [...onChangeImageUpload];
    newArrayUpload.splice(index, 1);
    setOnChangeImageUpload(newArrayUpload);

    URL.revokeObjectURL(url);
    setSelectedImages((prev: string[]) => prev.filter((item) => item !== url));
  };

  useEffect(() => {
    const fileArray = Promise.all(([...onChangeImageUpload] || []).map(async (file) => {
      const {type, name, size} = file;
      const fileImageToBase64 = await getBase64(file);
      return {
        type,
        name,
        size,
        fileImageToBase64
      }
    }));

    fileArray.then(v => Promise.all(v)).then(v => setImageUpload(v)).catch(err => console.error(err));
  },[onChangeImageUpload]);

  return (
    <div className="text-md">
      <div className="text-xl font-semibold text-center">
        {t('order.orderNo')} {orderInfo.node.name}
      </div>
      <div className="text-center">
        {new Date(orderInfo.node.createdAt).toDateString()}
      </div>
      <div className="w-full mx-auto pb-3">
        <div className="py-3 font-semibold">{t('page.selectedItems')}</div>
        <div className="gap-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {selectedItems.map((fulfillmentLineItem: any) => {
            const lineItem = fulfillmentLineItem.node.lineItem;
            const image = {url: '', altText: ''};

            try {
              image.url = lineItem.product.images.nodes[0].url;
              image.altText = lineItem.product.images.nodes[0].altText;
            } catch (error) {}

            const selectedOptions = lineItem.variant.selectedOptions;
            return (
              <div key={lineItem.variant.id} className={`flex flex-col gap-1`}>
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
                <div className="text-sm">
                  {t('global.qty')}: {lineItem.quantity}
                </div>
                {selectedOptions.map(
                  (option: any) =>
                    option.value !== 'Default Title' && (
                      <div key={option.value} className="text-sm">
                        {option.name}: {option.value}
                      </div>
                    ),
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <div className="mb-4">{t('errorMesg.provideMore')}</div>
          <Input
            type="textarea"
            label={t('fields.yourReason')}
            invalidMessage={t('errorMesg.tellReason')}
            isRequire={true}
            value={message}
            check={formCheck}
            setValue={setMessage}
            setFormCheck={setFormCheck}
            validate={(value: string) => value !== ''}
          />
        </div>

        <div className="mt-8">
          <div className="mb-4 font-semibold">
            {t('page.attachImages')}
          </div>

          <div className="gap-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
            {selectedImages.map((blobUrl: any, index: number) => {
              return (
                <div key={index} className="aspect-square relative">
                  <img
                    className="w-full h-full fadeIn object-cover border border-gray-200"
                    draggable="false"
                    alt="Order"
                    src={blobUrl}
                  />
                  <span
                    className="bg-white absolute right-3 top-3 p-1 pt-0 border cursor-pointer"
                    onClick={() => {
                      handleRemoveImage(blobUrl, index);
                    }}
                    aria-label="Remove image"
                  >
                    <IconXMark className="-ml-1" />
                  </span>
                </div>
              );
            })}
            {selectedImages.length < maxImagesUpload && (
              <>
                <label
                  htmlFor="file-upload"
                  className="aspect-square border border-gray-200 flex items-center justify-center font-light text-4xl cursor-pointer select-none"
                >
                  +
                </label>
                <input
                  type="file"
                  id="file-upload"
                  accept="image/png, image/gif, image/jpeg"
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    setOnChangeImageUpload((preFiles) => [...files, ...preFiles]);
                    
                    const slotRemaining =
                      maxImagesUpload - selectedImages.length;

                    const blobs = Array.from(files)
                      .slice(0, slotRemaining)
                      .map((file: any) => URL.createObjectURL(file));
                      setSelectedImages((prev: string[]) => [...prev, ...blobs]);
                  }}
                  multiple
                />
              </>
            )}
          </div>
        </div>

        <div className="flex gap-4 justify-center mt-8 pt-8">
          <button
            className="text-center border border-black rounded py-2 px-10 cursor-pointer"
            onClick={() => {
              setStep((prev: number) => --prev);
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
            onClick={handleSubmit}
          >
            {formSending ? t('global.loading') : t('button.submit')}
          </button>
        </div>
      </div>
    </div>
  );
}
