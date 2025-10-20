import groq from 'groq';

import {LINK_EXTERNAL} from '../linkExternal';
import {LINK_INTERNAL} from '../linkInternal';

export const MODULE_FEATURED_POLICIES = groq`
  _key,
  policiesTitle,
  margin,
  scrollToLoad,
  itemsPerRow,
  policiesStyle,
  policies[] {
    _key,
    "imageUrl": policiesImage.asset->.url,
    "imageDimensions": policiesImage.asset->.metadata.dimensions,
    caption,
    title,
    "links": links[0] {
      (_type == 'linkExternal') => {
        ${LINK_EXTERNAL}
      },
      (_type == 'linkInternal') => {
        ${LINK_INTERNAL}
      },
    }
  }
`;
