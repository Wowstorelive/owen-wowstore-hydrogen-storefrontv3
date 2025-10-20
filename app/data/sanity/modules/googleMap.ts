import groq from 'groq';

export const MODULE_GOOGLE_MAP = groq`
    _key,
    latitude,
    longitude,
    zoom,
    height,
    margin
`;
