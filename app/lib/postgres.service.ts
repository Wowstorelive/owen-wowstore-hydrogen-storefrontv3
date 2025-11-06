/**
 * PostgreSQL Service Layer for Hydrogen
 * Uses PostgREST REST API to interact with PostgreSQL from Oxygen edge workers
 * Compatible with edge runtime (uses fetch() only)
 */

export interface ReviewData {
  productId: string;
  productHandle: string;
  rating: number;
  title: string;
  description: string;
  customerName: string;
  customerEmail: string;
  images?: string[];
}

export interface ReturnData {
  orderId: string;
  orderName: string;
  customerEmail?: string;
  customerName?: string;
  reason?: string;
  items: ReturnItem[];
  images?: string[];
}

export interface ReturnItem {
  lineItemId: string;
  productId?: string;
  productTitle?: string;
  variantId?: string;
  variantTitle?: string;
  quantity: number;
  reason?: string;
}

export class PostgresService {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`PostgreSQL API error: ${response.status} ${error}`);
    }

    return response.json();
  }

  /**
   * Create a new product review
   */
  async createReview(reviewData: ReviewData) {
    // First, create the review
    const review = await this.request('/product_reviews', {
      method: 'POST',
      body: JSON.stringify({
        product_id: reviewData.productId,
        product_handle: reviewData.productHandle,
        rating: reviewData.rating,
        title: reviewData.title,
        description: reviewData.description,
        customer_name: reviewData.customerName,
        customer_email: reviewData.customerEmail,
      }),
      headers: {
        'Prefer': 'return=representation',
      },
    });

    // If there are images, create them
    if (reviewData.images && reviewData.images.length > 0 && review[0]?.id) {
      const images = reviewData.images.map(url => ({
        review_id: review[0].id,
        image_url: url,
      }));

      await this.request('/review_images', {
        method: 'POST',
        body: JSON.stringify(images),
      });
    }

    return review[0];
  }

  /**
   * Get reviews for a product
   */
  async getReviews(productHandle: string, limit = 10, offset = 0) {
    const params = new URLSearchParams({
      product_handle: `eq.${productHandle}`,
      order: 'created_at.desc',
      limit: String(limit),
      offset: String(offset),
    });

    return this.request(`/reviews_with_images?${params}`);
  }

  /**
   * Get review statistics for a product
   */
  async getReviewStats(productHandle: string) {
    const reviews = await this.request(
      `/product_reviews?product_handle=eq.${productHandle}&select=rating`
    );

    const total = reviews.length;
    const sum = reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
    const average = total > 0 ? sum / total : 0;

    return {
      total,
      average,
      ratings: {
        1: reviews.filter((r: any) => r.rating === 1).length,
        2: reviews.filter((r: any) => r.rating === 2).length,
        3: reviews.filter((r: any) => r.rating === 3).length,
        4: reviews.filter((r: any) => r.rating === 4).length,
        5: reviews.filter((r: any) => r.rating === 5).length,
      },
    };
  }

  /**
   * Create a return request
   */
  async createReturn(returnData: ReturnData) {
    // First, create the return
    const returnRecord = await this.request('/returns', {
      method: 'POST',
      body: JSON.stringify({
        order_id: returnData.orderId,
        order_name: returnData.orderName,
        customer_email: returnData.customerEmail,
        customer_name: returnData.customerName,
        reason: returnData.reason,
        status: 'pending',
      }),
      headers: {
        'Prefer': 'return=representation',
      },
    });

    const returnId = returnRecord[0]?.id;

    if (!returnId) {
      throw new Error('Failed to create return');
    }

    // Create return items
    if (returnData.items && returnData.items.length > 0) {
      const items = returnData.items.map(item => ({
        return_id: returnId,
        line_item_id: item.lineItemId,
        product_id: item.productId,
        product_title: item.productTitle,
        variant_id: item.variantId,
        variant_title: item.variantTitle,
        quantity: item.quantity,
        reason: item.reason,
      }));

      await this.request('/return_items', {
        method: 'POST',
        body: JSON.stringify(items),
      });
    }

    // Create return images
    if (returnData.images && returnData.images.length > 0) {
      const images = returnData.images.map(url => ({
        return_id: returnId,
        image_url: url,
      }));

      await this.request('/return_images', {
        method: 'POST',
        body: JSON.stringify(images),
      });
    }

    return returnRecord[0];
  }

  /**
   * Get return by ID
   */
  async getReturn(returnId: string) {
    const returns = await this.request(`/returns_with_details?id=eq.${returnId}`);
    return returns[0] || null;
  }

  /**
   * Get returns by order ID
   */
  async getReturnsByOrder(orderId: string) {
    return this.request(`/returns_with_details?order_id=eq.${orderId}`);
  }

  /**
   * Update return status
   */
  async updateReturnStatus(returnId: string, status: string) {
    return this.request(`/returns?id=eq.${returnId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
      headers: {
        'Prefer': 'return=representation',
      },
    });
  }
}

/**
 * Create PostgresService instance from environment variables
 */
export function createPostgresService(env: Env): PostgresService {
  const baseUrl = env.POSTGREST_URL || 'http://postgrest:3000';
  const apiKey = env.POSTGREST_API_KEY;

  return new PostgresService(baseUrl, apiKey);
}
