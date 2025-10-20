import groq from 'groq';

import {SEO} from '../seo';

export const STORE_LOCATOR = groq`
  _type,
  modules[] {
    stores[] {
      _key,
      _type,
      latitude,
      longitude,
      phoneNumber,
      storeAddress,
      storeEmail,
      storeName,
      website,
      storeImage {
        _type,
        "image": {
          "url": asset->.url,
          "altText": asset->.originalFilename,
          "width": asset->.metadata.dimensions.width,
          "height": asset->.metadata.dimensions.height,
        }
      },
    },
  },
  title,
  showTitle,
  centerTitle,
  ${SEO}
`;

export const STORE_LOCATOR_SEARCH_BY_NAME = (name: string) => {
  return `
    _type,
    modules[] {
      stores[storeName match '${name}^'] {
        _key,
        _type,
        latitude,
        longitude,
        phoneNumber,
        storeAddress,
        storeEmail,
        storeName,
        website,
        storeImage {
          _type,
          "image": {
            "url": asset->.url,
            "altText": asset->.originalFilename,
            "width": asset->.metadata.dimensions.width,
            "height": asset->.metadata.dimensions.height,
          }
        },
      },
    },
    ${SEO}
`;
};