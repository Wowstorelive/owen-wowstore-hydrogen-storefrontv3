/// <reference types="vite/client" />
/// <reference types="@shopify/remix-oxygen" />
/// <reference types="@shopify/oxygen-workers-types" />

import type {
  WithCache,
  HydrogenCart,
  HydrogenSessionData,
} from '@shopify/hydrogen';
import type {Storefront, CustomerAccount} from '~/lib/type';
import type {AppSession} from '~/lib/session.server';
// import type {Sanity} from 'hydrogen-sanity'; // TODO: Removed Sanity CMS - using custom CMS

declare global {
  /**
   * A global `process` object is only available during build to access NODE_ENV.
   */
  const process: {env: {NODE_ENV: 'production' | 'development'}};

  /**
   * Declare expected Env parameter in fetch handler.
   */
  interface Env {
    SESSION_SECRET: string;
    PUBLIC_STOREFRONT_API_TOKEN: string;
    PRIVATE_STOREFRONT_API_TOKEN: string;
    PUBLIC_STORE_DOMAIN: string;
    PUBLIC_STOREFRONT_ID: string;
    PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID: string;
    PUBLIC_CUSTOMER_ACCOUNT_API_URL: string;
    PUBLIC_CHECKOUT_DOMAIN: string;
    PRIVATE_ADMIN_API_TOKEN: string;
    PRIVATE_ADMIN_API_VERSION: string;
    // TODO: Removed Sanity CMS - using custom CMS
    // SANITY_PROJECT_ID: string;
    // SANITY_DATASET: string;
    // SANITY_API_VERSION: string;
    SENDGRID_API_KEY: string;
    SUPABASE_URL: string;
    SUPABASE_API_KEY: string;
    SUPABASE_PREFIX_BUCKET: string;
    SUPABASE_BUCKET_IMAGE_REVIEW: string;
    SUPABASE_BUCKET_RETURNS: string;
    // PostgreSQL/PostgREST configuration
    POSTGREST_URL?: string;
    POSTGREST_API_KEY?: string;
  }
}

declare module '@shopify/remix-oxygen' {
  /**
   * Declare local additions to the Remix loader context.
   */
  export interface AppLoadContext {
    waitUntil: ExecutionContext['waitUntil'];
    session: AppSession;
    storefront: Storefront;
    customerAccount: CustomerAccount;
    admin: AdminClient;
    // TODO: Removed Sanity CMS - using custom CMS
    // sanity: Sanity;
    cart: HydrogenCart;
    env: Env;
  }

  /**
   * Declare local additions to the Remix session data.
   */
  interface SessionData extends HydrogenSessionData {}
}

// Needed to make this file a module.
export {};
