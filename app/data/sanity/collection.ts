import groq from 'groq';
import {MODULES} from './modules';

export const COLLECTION = groq`
  _id,
  seo,
  modules[] {
    ${MODULES}
  },
  colorTheme {
    "backgroundColor": background[0].hex,
    "textColor": textColor[0].hex,
  },
  "gid": store.gid,
  "slug": "/collections/" + store.slug.current,
  "title": store.title,
  "vector": vector.asset->url,
`;
