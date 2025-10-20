import groq from 'groq';

import {LINK_EXTERNAL} from './linkExternal';
import {LINK_INTERNAL} from './linkInternal';

export const SANITY_SETTINGS = groq`
  _id,
  header {
    "favicon": {
      "url": favicon.asset->.url,
    },
    "logo": {
      "url": logo.asset->.url,
      "altText": logo.asset->.originalFilename,
      "width": logo.asset->.metadata.dimensions.width,
      "height": logo.asset->.metadata.dimensions.height,
    },
    "logoWhite": {
      "url": logoWhite.asset->.url,
      "altText": logoWhite.asset->.originalFilename,
      "width": logoWhite.asset->.metadata.dimensions.width,
      "height": logoWhite.asset->.metadata.dimensions.height,
    },
    topLinks[] {
      (_type == 'linkExternal') => {
        ${LINK_EXTERNAL}
      },
      (_type == 'linkInternal') => {
        ${LINK_INTERNAL}
      },
    }
  },
  footer {
    "columnLinks": columnLinks[] {
      _key,
      "mainLink": mainLink[0] {
        (_type == 'linkExternal') => {
          ${LINK_EXTERNAL}
        },
        (_type == 'linkInternal') => {
          ${LINK_INTERNAL}
        },
      },
      "subLink": subLink[] {
        (_type == 'linkExternal') => {
          ${LINK_EXTERNAL}
        },
        (_type == 'linkInternal') => {
          ${LINK_INTERNAL}
        },
      }
    },
  },
  search {
    trendingLinks[] {
      (_type == 'linkExternal') => {
        ${LINK_EXTERNAL}
      },
      (_type == 'linkInternal') => {
        ${LINK_INTERNAL}
      },
    },
    collectionLinks[] {
      (_type == 'linkExternal') => {
        ${LINK_EXTERNAL}
      },
      (_type == 'linkInternal') => {
        ${LINK_INTERNAL}
      },
    },
  },
  countdownTimer {
    "countdownStatus": status,
    "countdownTitle": title,
    "countdownSubtitle": subtitle,
    "countdownButton": showButton,
    buttonText,
    "backgroundColor": background[0].hex,
    "textColor": textColor[0].hex,
    "buttonBackground": buttonBackground[0].hex,
    "buttonTextColor": buttonTextColor[0].hex,
    "buttonLink": links[0] {
      (_type == 'linkExternal') => {
        ${LINK_EXTERNAL}
      },
      (_type == 'linkInternal') => {
        ${LINK_INTERNAL}
      },
    },
    "countdownDateStart": start,
    "countdownDateEnd": end,
  },
  newsletter {
    "showPopup": showPopup,
    "heading": heading,
    "description": desc,
    "backgroundColor": background[0].hex,
    "textColor": textColor[0].hex,
    "banner": {
      "url": banner.asset->.url,
      "altText": banner.asset->.originalFilename,
      "width": banner.asset->.metadata.dimensions.width,
      "height": banner.asset->.metadata.dimensions.height,
    },
  },
  social {
    facebook,
    instagram,
    pinterest,
    twitter,
    youtube,
  },
  sizeGuide,
  embedCode,
  other {
    address1,
    address2,
    email,
    phoneNumber,
    shippingText,
    storeDomain,
    storeName,
    "paymentImage": {
      "url": paymentImage.asset->.url,
      "altText": paymentImage.asset->.originalFilename,
      "width": paymentImage.asset->.metadata.dimensions.width,
      "height": paymentImage.asset->.metadata.dimensions.height,
    },
  }
`;
