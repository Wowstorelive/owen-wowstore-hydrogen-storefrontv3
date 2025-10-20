import groq from 'groq';

import {HERO_COLLECTION} from '../heroes/collection';
import {MODULES} from '../modules';
import {SEO_SHOPIFY} from '../seoShopify';

export const COLLECTION_PAGE = groq`
  _id,
  (showHero == true) => {
    hero {
      ${HERO_COLLECTION}
    },
  },
  modules[] {
    ${MODULES}
  },
  ${SEO_SHOPIFY},
  "slug": store.slug.current,
  "sortOrder": store.sortOrder,
  "title": store.title,
`;
