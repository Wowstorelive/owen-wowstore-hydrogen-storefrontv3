import {useState, useEffect} from 'react';

export const useOnScreen = (ref: any) => {
  const [isIntersecting, setIntersecting] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) =>
      setIntersecting(entry.isIntersecting),
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
  }, [ref]);

  return isIntersecting;
};
