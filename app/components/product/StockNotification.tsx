import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {CustomInput} from '~/components/elements/CustomInput';
import {ValidateEmail} from '~/lib/utils';

export function StockNotification({selectedVariant}: {selectedVariant: any}) {
  const [email, setEmail] = useState('');

  const [formSending, setFormSending] = useState(false);
  const [isFormSent, setIsFormSent] = useState(false);
  const [formCheck, setFormCheck] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const {t} = useTranslation();

  const handleSubmitForm = async () => {
    setFormCheck(true);
    if (!ValidateEmail(email)) {
      setErrorMessage(t('errorMesg.invalidEmail'));
      return;
    }

    setFormCheck(false);
    setFormSending(true);

    const variantID = selectedVariant?.id.split('/').pop();
    const productID = selectedVariant?.product?.id.split('/').pop();

    const url = '/api/backinstock';
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        variantID,
        productID,
        email
      }),
    };

    const {response} = await fetch(url, options)
      .then((res: any) => {
        if(!res.ok) {
          setErrorMessage(t('errorMesg.wrong'));
          setFormSending(false);
          return;
        }
        setEmail('');
        setIsFormSent(true);
        return res.json();
      })

    if (response && response.status !== 'OK') {
      setErrorMessage(
        response?.errors?.base
          ? response?.errors?.base[0]
          : `${t('errorMesg.invalidEmail')}`,
      );
      setEmail('');
    } else {
      setErrorMessage('');
    }

    setFormSending(false);
  };

  return (
    <div className="bg-gray-100 p-6">
      <p>
        <strong>{t('product.stockNotifHeading')}</strong>
      </p>
      <p className="mb-4 text-sm">{t('product.stockNotifMessage')}</p>
      <div className="flex flex-col md:flex-row items-start">
        <CustomInput
          label={t('fields.insertEmail')}
          isRequire={true}
          showValidMessage={false}
          value={email}
          check={formCheck}
          isFormSent={isFormSent}
          setValue={setEmail}
          setFormCheck={setFormCheck}
          validate={ValidateEmail}
          className="px-4 rounded-none"
        />
        <div className="flex items-center justify-center w-full md:w-auto min-w-28">
          <div
            className={`bg-black text-white font-medium w-full cursor-pointer py-3 px-2 select-none text-center ${
              formSending ? 'pointer-events-none' : ''
            }`}
            onClick={handleSubmitForm}
            aria-hidden="true"
          >
            {formSending ? t('button.sending') : t('button.subscribe')}
          </div>
        </div>
      </div>
      {!isFormSent && errorMessage.length > 0 && (
        <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
      )}
      {isFormSent && (
        <>
          {errorMessage.length > 0 ? (
            <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
          ) : (
            <p className="mt-2 text-sm text-green-600">
              {t('product.stockNotifSuccess')}
            </p>
          )}
        </>
      )}
    </div>
  );
}
