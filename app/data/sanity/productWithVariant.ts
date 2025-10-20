import groq from 'groq';

export const PRODUCT_WITH_VARIANT = groq`
  product->{
    _id,
    "available": !store.isDeleted && store.status == 'active',
    "gid": store.gid,
    "slug": store.slug.current,
    "variantGid": coalesce(^.variant->store.gid, store.variants[0]->store.gid),
    "previewImageUrl": store.previewImageUrl,
    "variants": store.variants[0]->{
      "compareAtPrice": store.compareAtPrice,
      "price": store.price,
      "sku": store.sku,
      "title": store.title,
    },
    "vendor": store.vendor,
    "title": store.title
  }
`;