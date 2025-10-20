import groq from 'groq';

import {LINK_EXTERNAL} from '../linkExternal';
import {LINK_INTERNAL} from '../linkInternal';

export const MODULE_COLLECTION_GRID = groq`
  _key,
  collectionTitle,
  centerTitle,
  itemsPerRow,
  itemsPerRowTablet,
  itemsPerRowMobile,
  margin,
  fullWidth,
  scrollToLoad,
  collectionItems[] {
    _key,
    "image": {
      "url": collectionBanner.asset->.url,
      "altText": collectionBanner.asset->.originalFilename,
      "width": collectionBanner.asset->.metadata.dimensions.width,
      "height": collectionBanner.asset->.metadata.dimensions.height,
    },
    desktopRatio,
    mobileRatio,
    mainTitle,
    "viewAllLink": viewAllLink[0] {
      (_type == 'linkExternal') => {
        ${LINK_EXTERNAL}
      },
      (_type == 'linkInternal') => {
        ${LINK_INTERNAL}
      },
    },
    childItems[] {
      (_type == 'linkExternal') => {
        ${LINK_EXTERNAL}
      },
      (_type == 'linkInternal') => {
        ${LINK_INTERNAL}
      },
    }
  }
`;
