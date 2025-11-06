# Required Environment Variables for Oxygen

## ⚠️ Critical - Store Won't Work Without These

Go to: **Shopify Admin → Headless → Settings → Environment Variables**

Add ALL of these variables (copy from your `.env` file):

### Shopify Configuration
```bash
PUBLIC_STORE_DOMAIN=dtf2yg-gg.myshopify.com
PUBLIC_CHECKOUT_DOMAIN=wowstore.live
SHOP_ID=1000059146
```

### API Tokens
```bash
PUBLIC_STOREFRONT_API_TOKEN=your-storefront-api-token
PRIVATE_ADMIN_API_TOKEN=your-admin-api-token
PRIVATE_ADMIN_API_VERSION=2025-01
```

### Session & Security
```bash
SESSION_SECRET=your-session-secret-key
```

### Customer Accounts
```bash
PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID=your-client-id
PUBLIC_CUSTOMER_ACCOUNT_API_URL=https://shopify.com/your-client-id
```

### Sanity CMS (if you use it)
```bash
PUBLIC_SANITY_PROJECT_ID=your-project-id
PUBLIC_SANITY_DATASET=production
PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_API_TOKEN=your-sanity-token
```

## 🔄 After Adding Variables

1. Save all environment variables
2. Go to **Deployments**
3. Click **Redeploy** or trigger new deployment
4. Wait 2-3 minutes for redeployment

## ✅ How to Verify

After redeployment, the store should load without 500 errors.

If errors persist, check:
1. All variables are spelled correctly (case-sensitive!)
2. No extra spaces in values
3. All required variables are present
4. Sanity CMS credentials (if applicable)

## 📞 Still Having Issues?

Check Oxygen logs in Shopify Admin → Headless → Deployments → View Logs
