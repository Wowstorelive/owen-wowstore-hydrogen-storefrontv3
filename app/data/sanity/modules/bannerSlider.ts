import groq from 'groq';

import {LINK_EXTERNAL} from '../linkExternal';
import {LINK_INTERNAL} from '../linkInternal';

export const MODULE_BANNER_SLIDER = groq`
  _key,
  itemsPerSlider,
  sliderTitle,
  margin,
  fullWidth,
  autoPlay,
  scrollToLoad,
  loop,
  "viewAllLink": viewAllLink[0] {
    (_type == 'linkExternal') => {
      ${LINK_EXTERNAL}
    },
    (_type == 'linkInternal') => {
      ${LINK_INTERNAL}
    },
  },
  banners[] {
    _key,
    "image": {
      "url": banner.asset->.url,
      "altText": banner.asset->.originalFilename,
      "width": banner.asset->.metadata.dimensions.width,
      "height": banner.asset->.metadata.dimensions.height,
    },
    desktopRatio,
    mobileRatio,
    title,
    titleLine2,
    caption,
    text,
    maxwidthContent,
    textPosition,
    "textColor": textColor[0].hex,
    showButton,
    buttonStyle,
    buttonText,
    "link": link[0] {
      (_type == 'linkExternal') => {
        ${LINK_EXTERNAL}
      },
      (_type == 'linkInternal') => {
        ${LINK_INTERNAL}
      },
    }
  }
`;
