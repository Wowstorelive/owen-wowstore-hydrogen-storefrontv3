import groq from 'groq';

import {PRODUCT_WITH_VARIANT} from './productWithVariant';

export const PRODUCT_HOTSPOT = groq`
  _key,
  "spotBg": spotBg[0].hex,
  "spotColor": spotColor[0].hex,
  "product": productWithVariant {
    ...${PRODUCT_WITH_VARIANT}
  },
  x,
  y
`;
