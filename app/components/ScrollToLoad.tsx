import {useRef, useState, useEffect} from 'react';

import {useOnScreen} from '~/hooks/useOnScreen';

export function ScrollToLoad({
  customClass,
  children,
}: {
  customClass?: string;
  children: any;
}) {
  const refItem = useRef();
  const [isRef, setIsRef] = useState(false);
  const refValue = useOnScreen(refItem);

  useEffect(() => {
    if (!isRef) {
      setIsRef(refValue);
    }
  }, [isRef, refValue]);

  return renderModuleSection(refItem, isRef, customClass, children);
}

function renderModuleSection(
  refCurrent: any,
  isShow: any,
  customClass: any,
  children: any,
) {
  return (
    <section
      ref={refCurrent}
      className={`${customClass ? customClass : 'min-h-72 lg:min-h-96'}`}
    >
      {isShow && (
        <div className="inline-block w-full animated fadeIn">{children}</div>
      )}
    </section>
  );
}
