export const CUSTOMER_INFO_QUERY = `#graphql
  query Customerinfo {
    customer {
      firstName
      lastName
      emailAddress {
        emailAddress
      }
    }
  }
` as const;
