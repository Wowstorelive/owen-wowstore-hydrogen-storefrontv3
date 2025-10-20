import {type ActionArgs} from '@shopify/remix-oxygen';
import config from 'theme.config';

export async function action({request}: ActionArgs) {
  const [payload]: any = await Promise.all([request.json()]);

  const {variantID, email, productID} = payload;

  const url = `https://app.backinstock.org/stock_notification/create.json`;

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
  };

  const params = new URLSearchParams({
      shop: config.storeDomain,
      "notification[email]": email,
      "notification[product_no]": productID,
      "notification[quantity_required]": 1,
      "notification[accepts_marketing]": true,
      "notification[customer_utc_offset]": 10800,
      "variant[variant_no]": variantID
  })

  const response = await fetch(`${url}?${params}`, options)

  if (response.status === 200) {
    return {
      message: 'Success',
    }
  }

  return response?.error;
}