import groq from 'groq';

import {LINK_EXTERNAL} from './linkExternal';
import {LINK_INTERNAL} from './linkInternal';
import {IMAGE} from './image';

export const MAIN_MENU = groq`
  _id,
  position,
  "mainLink": mainLink[0] {
    (_type == 'linkExternal') => {
      ${LINK_EXTERNAL}
    },
    (_type == 'linkInternal') => {
      ${LINK_INTERNAL}
    },
  },
  fullWidth,
  customWidth,
  linksColumn,
  dropdownPosition,
  brandSection[] {
    _key,
    image{
      ${IMAGE}
    },
    "brandLink": links[0] {
      (_type == 'linkExternal') => {
        ${LINK_EXTERNAL}
      },
      (_type == 'linkInternal') => {
        ${LINK_INTERNAL}
      },
    }
  },
  linkSection[] {
    _key,
    bannerPosition,
    "mainLink": mainLink[0] {
      (_type == 'linkExternal') => {
        ${LINK_EXTERNAL}
      },
      (_type == 'linkInternal') => {
        ${LINK_INTERNAL}
      },
    },
    "image": menuBanner{
      ${IMAGE}
    },
    "subLink" : subLink[]{
      (_type == 'linkExternal') => {
        ${LINK_EXTERNAL}
      },
      (_type == 'linkInternal') => {
        ${LINK_INTERNAL}
      }, 
    }
  },
  promoSection[] {
    _key,
    image{
      ${IMAGE}
    },
    "promoLink": links[0] {
      (_type == 'linkExternal') => {
        ${LINK_EXTERNAL}
      },
      (_type == 'linkInternal') => {
        ${LINK_INTERNAL}
      },
    }
  }
  | order(position)
`;
