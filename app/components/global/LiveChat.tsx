import {useEffect, useState} from 'react';
import TawkMessengerReact from '@tawk.to/tawk-messenger-react';

export function LiveChat({propertyId, widgetId} : {propertyId: string; widgetId: string}) {
  const [activeTawk, setActiveTawk] = useState(false);

  useEffect(() => {
    window.setTimeout(function () {
      setActiveTawk(true);
    }, 5000);
  });

  if(!activeTawk) {
    return null;
  }

  const onLoad = () => {
    // eslint-disable-next-line no-console
    console.log('onLoad works!');
  };

  return (
    <TawkMessengerReact
      propertyId={propertyId}
      widgetId={widgetId}
      onLoad={onLoad}
    />
  )
}
