import groq from 'groq';

import {IMAGE} from '../image';

export const MODULE_IMAGE_WITH_TEXT = groq`
  _key,
  imagePosition,
  scrollToLoad,
  textContent,
  customClass,
  margin,
  maxWidth,
  textAlign,
  banner{
    ${IMAGE}
  }
`;
