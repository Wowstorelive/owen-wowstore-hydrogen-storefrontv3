import {type ActionArgs} from '@shopify/remix-oxygen';

export async function action({request, context}: ActionArgs) {
  const [payload]: any = await Promise.all([request.json()]);

  const {email, orderId} = payload;

  const query = (email: string, orderId: string) => `
    {
      orders(first: 1, query: "(email:${email}) AND (name:${orderId}") {
        edges {
          node {
            fulfillments {
              fulfillmentLineItems(first: 10) {
                edges {
                  node {
                    id
                    lineItem {
                      refundableQuantity
                      product {
                        images(first: 1) {
                          nodes {
                            url
                          }
                        }
                      }
                      title
                      quantity
                      variant {
                        title
                        id
                        selectedOptions {
                          name
                          value
                        }
                        price
                      }
                    }
                  }
                }
              }
            }
            billingAddress {
              address1
              address2
              province
              country
              city
              provinceCode
              zip
              lastName
              firstName
              phone
            }
            shippingAddress{
              address1
              address2
              province
              country
              city
              provinceCode
              zip
              lastName
              firstName
              phone
            }
            currentTotalTaxSet {
              presentmentMoney {
                amount
               currencyCode 
              }
              shopMoney{
                amount
                currencyCode
              }
            }
            currentTotalPriceSet {
              presentmentMoney {
                amount
               currencyCode 
              }
              shopMoney{
                amount
                currencyCode
              }
            }
            currentSubtotalPriceSet {
              presentmentMoney {
                amount
               currencyCode 
              }
              shopMoney{
                amount
                currencyCode
              }
            }
            totalShippingPriceSet {
              presentmentMoney {
                amount
                 currencyCode 
              }
              shopMoney{
                amount
                currencyCode
              }
            }
            paymentGatewayNames
            id
            name
            email
            createdAt
            customer {
              id
              email
            }
          }
        }
      }
    }
  `;

  const response: any = await context.admin(query(email, orderId), {});

  const orders =
    response.data && response.data.orders && response.data.orders.edges
      ? response.data.orders.edges
      : [];

  return orders;
}
