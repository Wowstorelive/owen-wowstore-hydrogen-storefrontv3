import {json, type ActionArgs} from '@shopify/remix-oxygen';
import { collection, query, where, getDocs, limit, orderBy, startAfter } from 'firebase/firestore';

export async function action({request, context}: ActionArgs) {
  const {firestore} = context;
  const [payload]: any = await Promise.all([request.json()]);

  const {productHandle, from, to, limit: queryLimit} = payload;

  const productReviewRef = collection(firestore, 'product_review');

  const q = query(productReviewRef, where('productHandle', '==', productHandle), orderBy('createdAt', 'desc'), limit(queryLimit));

  const querySnapshot = await getDocs(q);
  const reviewProduct = querySnapshot.docs.map(doc => doc.data());

  return json(reviewProduct);
}
