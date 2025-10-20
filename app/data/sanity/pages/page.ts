import groq from 'groq';

import {MODULES} from '../modules';
import {SEO} from '../seo';

export const PAGE = groq`
  modules[] {
    ${MODULES}
  },
  ${SEO},
  title,
  showTitle,
  centerTitle,
  language
`;
