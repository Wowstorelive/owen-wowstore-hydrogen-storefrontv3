import {createContext, useState, useContext, useEffect} from 'react';

const StoreContext = createContext([]) as any;
const {Provider} = StoreContext;

export function StoreContextProvider({children}: {children: any}) {
  const [wishlist, setWishlist] = useState<any>([]);
  const [compareList, setCompareList] = useState<any>([]);
  const [subcription, setSubcription] = useState<string>();

  useEffect(() => {
    const wishlistLocal = localStorage.getItem('wishlist') || '[]';
    const compareLocal = localStorage.getItem('compare') || '[]';

    setWishlist(JSON.parse(wishlistLocal));
    setCompareList(JSON.parse(compareLocal));
  }, []);

  const wishlistCounter = wishlist.length ?? 0;
  const compareCounter = compareList.length ?? 0;

  const contextValue = {
    wishlistCounter,
    wishlist,
    setWishlist,
    compareCounter,
    compareList,
    setCompareList,
    setSubcription,
    subcription
  };

  return <Provider value={contextValue}>{children}</Provider>;
}

export const useStoreContext = () => useContext(StoreContext);
