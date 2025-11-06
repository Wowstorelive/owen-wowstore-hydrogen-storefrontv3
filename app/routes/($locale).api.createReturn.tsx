import {json, type ActionArgs} from '@shopify/remix-oxygen';
// import { base64ToArrayBuffer } from '~/lib/utils';
// import { v4 as uuidv4 } from 'uuid';
// import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function action({request, context}: ActionArgs) {
  // TODO: Migrate to PostgreSQL - Firebase not compatible with Oxygen edge workers
  return json({
    error: 'Returns feature temporarily unavailable. Migrating to PostgreSQL.',
    status: 'coming_soon'
  }, { status: 503 });

  // const {env, firebaseStorage} = context;
  const [payload]: any = await Promise.all([request.json()]);
  const {orderId, returnLineItems, files, orderName} = payload;

  const query = `
    mutation ReturnRequest($input: ReturnRequestInput!) {
      returnRequest(input: $input) {
        userErrors {
          field
          message
        }
        return {
          id
          status
          returnLineItems(first: 1) {
            edges {
              node {
                id
                returnReason
                customerNote
              }
            }
          }
          order {
            id
          }
        }
      }
    }
  `;

  const response: any = await context.admin(query, {
    variables: {
      input: {
        orderId,
        returnLineItems,
      }
    }
  });

  if(response.data?.returnRequest?.return) {
    const dataImages = Promise.all(files.map(async (file: any) => {
      const base64Image = file.fileImageToBase64.split('base64,')[1]
      const imageArrayBuffer = base64ToArrayBuffer(base64Image)

      const storage = getStorage(firebaseStorage);
      const storageRef = ref(storage, `${orderName.replace("#", "")}/${uuidv4()}_${file.name}`);

      try {
        const snapshot = await uploadBytes(storageRef, imageArrayBuffer, { contentType: file.type });
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
      } catch (error) {
        console.log('error', error);
        return null;
      }
    }));
    return response;
  }

  if(response.data?.returnRequest?.userErrors) {
    return response;
  }

  return null;
}
