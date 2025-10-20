import {useState, useContext} from 'react';
import {useTranslation} from 'react-i18next';
import {CustomInput as Input} from '~/components/elements/CustomInput';
import {ValidateEmail} from '~/lib/utils';
import {OrderTrackingContext} from './OrderTrackingForm';

export function CheckOrder() {
  const [formCheck, setFormCheck] = useState(false);
  const [formSending, setFormSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const {t} = useTranslation();
  const {setStep, email, setEmail, orderId, setOrderId, setOrderInfo} =
    useContext(OrderTrackingContext);

  const handleNextStep = async () => {
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
      setErrorMessage(t('errorMesg.invalidEmailOrder'));
      return;
    }

    setOrderInfo(orderInfo);
    setStep((prev: number) => ++prev);
  };

  return (
    <div className="text-center text-md flex flex-col gap-4 max-w-lg mx-auto">
      <div className="flex flex-col gap-4 items-center justify-center">
        <p className="mb-4">{t('page.orderTrakingText')}</p>
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
        {errorMessage.length > 0 && (
          <p className="text-sm text-red-500">{errorMessage}</p>
        )}
        <div
          className={`w-full bg-black text-white border border-black rounded p-3 cursor-pointer ${
            formSending ? 'pointer-events-none' : ''
          }`}
          onClick={handleNextStep}
          aria-hidden="true"
        >
          {formSending ? t('global.loading') : t('button.track')}
        </div>
      </div>
    </div>
  );
}
