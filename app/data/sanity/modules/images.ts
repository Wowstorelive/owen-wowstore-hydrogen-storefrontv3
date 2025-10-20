import groq from 'groq';

import {MODULE_IMAGE} from './image';

export const MODULE_IMAGES = groq`
  _key,
  "fullWidth": select(
    count(modules) > 1 => true,
    fullWidth,
  ),
  layout,
  modules[] {
    _key,
    ${MODULE_IMAGE()}
  }
`;
