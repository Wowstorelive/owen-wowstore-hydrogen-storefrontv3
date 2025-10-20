import {json, type ActionArgs} from '@shopify/remix-oxygen';
import { base64ToArrayBuffer } from '~/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';

export async function action({request, context}: ActionArgs) {
  const {env, firestore, firebaseStorage} = context;

  const [payload]: any = await Promise.all([request.json()]);

  const {reviews, review, nickname, summary, product, rating, email, files} = payload;

  const dataImages = Promise.all((files || [])?.map(async (file: any) => {
    const base64Image = file.fileImageToBase64.split('base64,')[1]
    const imageArrayBuffer = base64ToArrayBuffer(base64Image)

    const storage = getStorage(firebaseStorage);
    const storageRef = ref(storage, `${uuidv4()}_${file.name}`);

    try {
      const snapshot = await uploadBytes(storageRef, imageArrayBuffer, { contentType: file.type });
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.log('error', error);
      return null;
    }
  }))

  const arrayFileImages = await dataImages.then(v => Promise.all(v)).then(v => v.filter(Boolean)).catch(err => {
    console.error(err)
    return null
  });

  const averageRating =
    (reviews.reduce((total: any, item: any) => {
      return total + Number(item.rating);
    }, 0) +
      rating) /
    (reviews.length + 1);

  const metafields = [
    {
      key: 'rating_count',
      namespace: 'custom',
      ownerId: product.id,
      type: 'number_integer',
      value: String(reviews.length + 1),
    },
    {
      key: 'review',
      namespace: 'custom',
      ownerId: product.id,
      type: 'rating',
      value: JSON.stringify({
        scale_min: 1,
        scale_max: 5,
        value: averageRating,
      }),
    },
  ];

  const response = await context.admin(MUTATE_METAFIELD, {
    variables: {
      metafields
    },
  });

  let dataReviewError = null;
  try {
    await addDoc(collection(firestore, 'product_review'), {
      productId: product.id,
      productHandle: product.handle,
      rating,
      title: summary,
      description: review,
      customer: {
        name: nickname,
        email,
      },
      createdAt: new Date(),
      images: arrayFileImages || []
    });
  } catch (error) {
    dataReviewError = error;
  }

  if(!dataReviewError && response) {
    return {
      response: {
        ...response,
        data: {
          metafieldsSet: {
            metafields: [
              ...metafields, 
              {
                key: 'review_content',
                namespace: 'custom',
                ownerId: product.id,
                type: 'json',
                value: JSON.stringify([
                  {
                    rating,
                    title: summary,
                    description: review,
                    customer: {
                      name: nickname,
                      email,
                    },
                    images: arrayFileImages,
                    createdAt: new Date(),
                    deletedAt: null,
                  },
                ]),
              },
            ]
          }
        }
      }
    }
  }

  return {error: dataReviewError};
}

const MUTATE_METAFIELD = `
  mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        key
        namespace
        value
        createdAt
        updatedAt
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;
