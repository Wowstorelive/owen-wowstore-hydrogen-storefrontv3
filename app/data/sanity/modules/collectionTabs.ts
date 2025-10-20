import groq from 'groq';

export const MODULE_COLLECTION_TABS = groq`
  _key,
  _type,
  title,
  centerTitle,
  margin,
  carousel,
  quickAdd,
  itemsPerRow,
  itemsPerRowTablet,
  itemsPerRowMobile,
  productCardStyle,
  scrollMobile,
  scrollToLoad,
  limitItems,
  "collections": collection[]{
    _key,
    "title": collection->.store.title,
  },
  viewAll
`;
