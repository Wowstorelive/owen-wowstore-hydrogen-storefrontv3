import {useState, useContext} from 'react';
import {useTranslation} from 'react-i18next';
import {CustomInput as Input} from '~/components/elements/CustomInput';
import {ValidateEmail} from '~/lib/utils';
import {ReturnContext} from './ReturnForm';

export function CreateReturn() {
  const [formCheck, setFormCheck] = useState(false);
  const [formSending, setFormSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const {t} = useTranslation();
  const {
    setStep,
    email,
    setEmail,
    orderId,
    setOrderId,
    setOrderInfo,
    setSelectedItems,
    setSelectedImages,
  } = useContext(ReturnContext);

  const handleNextStep = async () => {
    setSelectedItems([]);
    setSelectedImages((prev: string[]) => {
      prev.forEach((url) => {
        URL.revokeObjectURL(url);
      });

      return [];
    });
    setFormCheck(true);
    if (!ValidateEmail(email) || orderId === '') {
      return;
    }
    setFormSending(true);

    const url = '/api/order';
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email,
        orderId,
      }),
    };

    const response: any = await fetch(url, options)
      .then((res) => res.json())
      .catch((err) => err);

    setFormSending(false);

    const orderInfo = response[0];
    const isValidInfo = orderInfo && orderInfo.node.fulfillments[0];

    if (!isValidInfo) {
      setErrorMessage(t('errorMesg.invalidEmailOrder'));
      return;
    }

    const fulfillmentLineItems =
      orderInfo.node.fulfillments[0].fulfillmentLineItems.edges;

    const fulfillmentLineItemsRefundable = fulfillmentLineItems.filter(
      ({node}: any) => node.lineItem.refundableQuantity,
    );

    if (!fulfillmentLineItemsRefundable.length) {
      setErrorMessage(t('errorMesg.nonRefundable'));
      return;
    }

    setOrderInfo(orderInfo);
    setStep((prev: number) => ++prev);
  };

  return (
    <div className="text-center text-md flex flex-col gap-4 max-w-3xl mx-auto">
      <p>{t('page.returnText')}</p>
      <div className="my-4 flex flex-col gap-4 items-center justify-center">
        <p className="font-medium">{t('page.returnEnterEmail')}</p>
        <div className="w-full md:w-2/3 mx-auto">
          <Input
            label={t('fields.emailAddress')}
            invalidMessage={t('errorMesg.invalidEmail')}
            isRequire={true}
            value={email}
            check={formCheck}
            setValue={setEmail}
            setFormCheck={setFormCheck}
            validate={ValidateEmail}
          />
        </div>
        <div className="w-full md:w-2/3 mx-auto">
          <Input
            label={t('fields.orderId')}
            invalidMessage={t('errorMesg.orderIdEmpty')}
            isRequire={true}
            value={orderId}
            check={formCheck}
            setValue={setOrderId}
            setFormCheck={setFormCheck}
            validate={(value: string) => value !== ''}
          />
        </div>
        {errorMessage.length > 0 && (
          <p className="text-sm text-red-500">{errorMessage}</p>
        )}
        <div
          className={`w-full md:w-2/3 bg-black text-white border border-black rounded p-3 cursor-pointer ${
            formSending ? 'pointer-events-none' : ''
          }`}
          onClick={handleNextStep}
          aria-hidden="true"
        >
          {formSending ? t('global.loading') : t('button.submit')}
        </div>
      </div>
      <p>{t('page.returnNote')}</p>
    </div>
  );
}
