import type {ActionFunctionArgs} from '@remix-run/server-runtime';

interface FormData {
  email: string;
}

export async function action({request, context}: ActionFunctionArgs) {
  const formData = await request.json();
  const email = String((formData as FormData).email);

  const CUSTOMER_CREATE_MUTATION = `
      mutation customerCreate($input: CustomerInput!) {
        customerCreate(input: $input) {
          customer {
            email
          }
          userErrors {
            field
            message
          }
        }
      }`;

  const variables: {variables: object | null} = {
    variables: {
      input: {
        email,
        emailMarketingConsent: {
          consentUpdatedAt: '2023-01-01T12:00:00Z',
          marketingOptInLevel: 'SINGLE_OPT_IN',
          marketingState: 'SUBSCRIBED',
        },
      },
    },
  };

  const response: any = await context.admin(
    CUSTOMER_CREATE_MUTATION,
    variables,
  );

  return response;
}
