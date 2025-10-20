import groq from 'groq';

import {LINK_EXTERNAL} from '../linkExternal';
import {LINK_INTERNAL} from '../linkInternal';
import {PRODUCT_WITH_VARIANT} from '../productWithVariant';

export const MODULE_SELECTED_PRODUCT = groq`
  _key,
  _type,
  title,
  centerTitle,
  margin,
  carousel,
  quickAdd,
  scrollToLoad,
  productCardStyle,
  newProducts,
  showCollectionImage,
  customProducts[]{
    _key,
    productWithVariant{
      ${PRODUCT_WITH_VARIANT}
    }
  },
  itemsPerRow,
  limitItems,
  productsInCollection,
  showCustomProducts,
  countdown,
  start,
  end,
  (productsInCollection) =>{
    collection->{
      store{
        gid
      }
    }
  },
  "viewAllLink": viewAllLink[0] {
    (_type == 'linkExternal') => {
      ${LINK_EXTERNAL}
    },
    (_type == 'linkInternal') => {
      ${LINK_INTERNAL}
    },
  },
`;
