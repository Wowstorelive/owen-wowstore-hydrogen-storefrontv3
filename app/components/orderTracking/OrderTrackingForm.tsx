import {useState, createContext} from 'react';
import {CheckOrder} from './CheckOrder';
import {Order} from './Order';

export const OrderTrackingContext = createContext<any>(null);

export function OrderTrackingForm() {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');

  const [orderInfo, setOrderInfo] = useState(null);

  const context = {
    step,
    setStep,
    email,
    setEmail,
    orderId,
    setOrderId,
    orderInfo,
    setOrderInfo,
  };

  return (
    <OrderTrackingContext.Provider value={context}>
      {step === 1 && (
        <FormLayout>
          <CheckOrder />
        </FormLayout>
      )}
      {step === 2 && (
        <FormLayout>
          <Order />
        </FormLayout>
      )}
    </OrderTrackingContext.Provider>
  );
}

function FormLayout({children}: {children: React.ReactNode}) {
  return <div className="max-w-6xl mx-auto">{children}</div>;
}
