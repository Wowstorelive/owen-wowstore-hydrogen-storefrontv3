import {useState} from 'react';
import {useTranslation} from 'react-i18next';

import {IconClose} from '~/components/elements/Icon';
import {CustomInput} from '~/components/elements/CustomInput';
import {Heading} from '~/components/elements/Text';
import {Button} from '~/components/elements/Button';

import {ValidateEmail} from '~/lib/utils';

export function ContactForm({contactForm}: {contactForm: any}) {
  const {formTitle, textDescription} = contactForm;
  const fullWidth = false;
  const {t} = useTranslation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [botField, setBotField] = useState('');

  const [formSending, setFormSending] = useState(false);
  const [isFormSent, setIsFormSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formCheck, setFormCheck] = useState(false);

  const handleSubmitForm = async () => {
    setFormCheck(true);
    if (
      firstName === '' ||
      lastName === '' ||
      message === '' ||
      !ValidateEmail(email)
    ) {
      setErrorMessage(t('errorMesg.invalidForm'));
      return;
    }
    if (botField !== "") {
      console.log('Bot detected. Form not submitted.');
      return;
    }
    setFormCheck(false);
    setFormSending(true);

    const url = `/api/contact`;

    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        message,
      }),
    };

    try {
      await fetch(url, options).then((result) => {
        if (result.status === 200 || result.statusText === 'OK') {
          setFirstName('');
          setLastName('');
          setEmail('');
          setMessage('');
          setErrorMessage('');
          setIsFormSent(true);
          setFormSending(false);
        } else {
          setFormSending(false);
        }
      });
    } catch (error) {
      setFormSending(false);
    }
  };

  return (
    <div
      className={`${
        fullWidth ? 'container' : 'w-full mx-auto lg:w-1/2 px-6'
      } flex flex-col gap-6`}
    >
      <Heading
        className="text-2xl font-semibold text-center text-heading3"
        as="h3"
      >
        {formTitle}
      </Heading>
      <div className="text-md text-center mb-2">{textDescription}</div>

      <div className="flex gap-4">
        <CustomInput
          label={t('fields.firstName')}
          invalidMessage={t('errorMesg.fieldEmpty')}
          isRequire={true}
          value={firstName}
          check={formCheck}
          isFormSent={isFormSent}
          setValue={setFirstName}
          setFormCheck={setFormCheck}
          validate={(value: string) => value !== ''}
        />
        <CustomInput
          label={t('fields.lastName')}
          invalidMessage={t('errorMesg.fieldEmpty')}
          isRequire={true}
          value={lastName}
          check={formCheck}
          isFormSent={isFormSent}
          setValue={setLastName}
          setFormCheck={setFormCheck}
          validate={(value: string) => value !== ''}
        />
      </div>
      <CustomInput
        label={t('fields.email')}
        invalidMessage={t('errorMesg.invalidEmail')}
        isRequire={true}
        value={email}
        check={formCheck}
        isFormSent={isFormSent}
        setValue={setEmail}
        setFormCheck={setFormCheck}
        validate={ValidateEmail}
      />
      <CustomInput
        type="textarea"
        label={t('fields.yourMessage')}
        invalidMessage={t('errorMesg.fieldEmpty')}
        isRequire={true}
        value={message}
        check={formCheck}
        isFormSent={isFormSent}
        setValue={setMessage}
        setFormCheck={setFormCheck}
        validate={(value: string) => value !== ''}
      />

      {/* This for bot */}
      <div className="overflow-hidden h-1 -mt-8" style={{textIndent: '100%'}}>
        <input
          name="email"
          type="text"
          placeholder="Do not fill this"
          autoComplete="off"
          tabIndex="1"
          onChange={(e) => {
            setBotField(e.target.value)
          }}
        />
      </div>

      <Button
        className={`font-normal uppercase rounded select-none btn-primary ${
          formSending ? 'pointer-events-none' : ''
        }`}
        onClick={handleSubmitForm}
      >
        {formSending ? t('button.sending') : t('button.submit')}
      </Button>
      {errorMessage && formCheck && (
        <p className="text-red-600 text-sm">{errorMessage}</p>
      )}
      {isFormSent && (
        <div>
          <div className="fixed z-50 top-0 left-0 right-0 bottom-0 m-auto max-w-md max-h-52 bg-white text-center p-6 rounded flex items-center justify-center">
            <div>
              <h3 className="text-xl font-bold">
                {t('successMesg.contactHeading')}
              </h3>
              <p>{t('successMesg.contactText')}</p>
              <span
                onClick={(e) => setIsFormSent(false)}
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
