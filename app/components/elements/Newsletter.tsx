import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ValidateEmail} from '~/lib/utils';
import {IconClose} from '~/components/elements/Icon';

export function Newsletter({inputClass = 'border-0 py-3'}: {inputClass?: any}) {
  const [emailInput, setEmailInput] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [resetForm, setResetForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const {t} = useTranslation();

  const handleSubmitEmail = async () => {
    if (!ValidateEmail(emailInput)) {
      setErrorMessage(t('errorMesg.invalidEmail'));
      return;
    }

    setEmailSending(true);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({email: emailInput}),
      });

      if (response.ok) {
        const data: any = await response.json();

        if (data.error) {
          setErrorMessage(data.error);
        } else {
          setIsEmailSent(true);
        }
      }
    } catch (error: any) {
      setErrorMessage(`Failed to create customer: ${error.message}`);
    }

    setEmailSending(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSubmitEmail();
    }
  };

  return (
    <div className="w-full">
      <div
        className={`${
          emailSending ? 'pointer-events-none opacity-80' : 'opacity-100'
        } flex flex-col justify-center md:flex-row relative newsletter-input`}
      >
        <input
          type="text"
          disabled={emailSending}
          value={emailInput}
          placeholder={t('fields.emailAddress')}
          className={
            inputClass +
            ' w-full px-4 font-normal bg-white rounded-full text-black md:rounded-br-none md:rounded-tr-none'
          }
          onChange={(e) => {
            setEmailInput(e.target.value);
          }}
          onKeyDown={handleKeyDown}
        />
        <button
          className="bg-red-600 rounded-3xl h-12 md:rounded-bl-none md:rounded-tl-none w-full mt-4 md:mt-0 md:w-28"
          onClick={handleSubmitEmail}
        >
          <span className="text-sm font-medium leading-6 text-white uppercase">
            {t('global.join')}
          </span>
        </button>
      </div>
      {!isEmailSent && errorMessage.length > 0 && (
        <p className="mt-2 text-sm text-red-500 px-6">{errorMessage}</p>
      )}
      {isEmailSent && (
        <div className={resetForm === false ? 'block' : 'hidden'}>
          <div className="fixed z-50 top-0 left-0 right-0 bottom-0 m-auto max-w-md max-h-56 p-6">
            <div className="bg-white text-black relative w-full h-full p-6 rounded flex flex-col items-center justify-center text-center">
              <h3 className="text-xl font-bold mb-2 uppercase">
                {t('successMesg.newsletterSuccess')}
              </h3>
              <p>{t('successMesg.newsletterMessage')}</p>
              <span
                onClick={(e) => setResetForm(true)}
                className="p-2 cursor-pointer absolute top-0 right-0"
                aria-hidden="true"
              >
                <IconClose />
              </span>
            </div>
          </div>
          <div className="fixed z-40 bg-black opacity-50 w-full h-full top-0 left-0">
            &nbsp;
          </div>
        </div>
      )}
    </div>
  );
}
