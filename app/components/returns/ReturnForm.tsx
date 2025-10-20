import {useState, createContext} from 'react';
import {useTranslation} from 'react-i18next';
import {PageHeader} from '../elements/Text';
import {CreateReturn} from './CreateReturn';
import {SelectItems} from './SelectItems';
import {SelectReason} from './SelectReason';
import {Complete} from './Complete';

export const ReturnContext = createContext<any>(null);

export function ReturnForm() {
  const {t} = useTranslation();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');

  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageUpload, setImageUpload] = useState([]);
  const [orderInfo, setOrderInfo] = useState(null);
  const [message, setMessage] = useState('');

  const context = {
    step,
    setStep,
    email,
    setEmail,
    orderId,
    setOrderId,
    orderInfo,
    setOrderInfo,
    selectedItems,
    setSelectedItems,
    selectedImages,
    setSelectedImages,
    imageUpload,
    setImageUpload,
    message,
    setMessage,
  };

  return (
    <ReturnContext.Provider value={context}>
      {step === 1 && (
        <FormLayout stepTitle={t('page.returnHeading')}>
          <CreateReturn />
        </FormLayout>
      )}
      {step === 2 && (
        <FormLayout stepTitle={t('page.returnHeading2')}>
          <SelectItems />
        </FormLayout>
      )}
      {step === 3 && (
        <FormLayout stepTitle={t('page.returnHeading3')}>
          <SelectReason />
        </FormLayout>
      )}
      {step === 4 && (
        <FormLayout stepTitle={t('page.returnHeading4')}>
          <Complete />
        </FormLayout>
      )}
    </ReturnContext.Provider>
  );
}

function FormLayout({
  stepTitle,
  children,
}: {
  stepTitle: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHeader heading={stepTitle} className="p-0 justify-center" />
      <div className="max-w-6xl mx-auto">{children}</div>
    </>
  );
}
