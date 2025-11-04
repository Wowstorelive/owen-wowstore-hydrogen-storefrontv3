import { json, type ActionFunctionArgs } from '@shopify/remix-oxygen';

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const data = await request.json();
    
    // Track event (integrate with your analytics)
    console.log('Funnel tracking event:', data);
    
    // TODO: Send to BigQuery, Firebase Analytics, or your analytics platform
    
    return json({ success: true });
  } catch (error) {
    console.error('Error tracking funnel event:', error);
    return json({ error: 'Failed to track event' }, { status: 500 });
  }
}
