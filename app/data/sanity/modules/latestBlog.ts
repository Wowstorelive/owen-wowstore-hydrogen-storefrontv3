import groq from 'groq';

import {LINK_EXTERNAL} from '../linkExternal';
import {LINK_INTERNAL} from '../linkInternal';

export const MODULE_LATEST_BLOG = groq`
  _key,
  blogTitle,
  centerTitle,
  limit,
  margin,
  scrollMobile,
  scrollToLoad,
  "viewAllLink": viewAllLink[0] {
    (_type == 'linkExternal') => {
      ${LINK_EXTERNAL}
    },
    (_type == 'linkInternal') => {
      ${LINK_INTERNAL}
    },
  }
`;
