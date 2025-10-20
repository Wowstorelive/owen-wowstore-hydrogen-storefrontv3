import groq from 'groq';

export const NOT_FOUND_PAGE = groq`
  body,
  "collectionGid": collection->store.gid,
  title
`;
