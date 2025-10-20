import groq from 'groq';

import {LINK_EXTERNAL} from '../linkExternal';
import {LINK_INTERNAL} from '../linkInternal';

export const MODULE_VIDEO_BACKGROUND = groq`
  _key,
  margin,
  scrollToLoad,
  titleFirst,
  titleSecond,
  caption,
  url,
  height,
  fullWidth,
  buttonStyle,
  "buttonLink": links[0] {
    (_type == 'linkExternal') => {
      ${LINK_EXTERNAL}
    },
    (_type == 'linkInternal') => {
      ${LINK_INTERNAL}
    },
  }
`;
