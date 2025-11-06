# Hydrogen Storefront Deployment Checklist

Complete deployment checklist for your Shopify Hydrogen storefront with PostgreSQL backend.

---

## ✅ Phase 1: Deploy Store (Core Functionality) - **DO THIS FIRST**

### Step 1.1: Deploy to Oxygen

**Option A: Via Shopify Admin (Recommended)**
1. Go to `https://admin.shopify.com/store/dtf2yg-gg`
2. Navigate to **Sales Channels** → **Headless** or **Hydrogen**
3. Click **Settings** → **Deployments**
4. Connect GitHub repository:
   - Repository: `Wowstorelive/owen-wowstore-hydrogen-storefrontv3`
   - Branch: `main`
5. Shopify will auto-deploy!

**Option B: Via CLI**
```bash
# Get deployment token from Shopify Admin first
export SHOPIFY_HYDROGEN_DEPLOYMENT_TOKEN="your-token"
npx shopify hydrogen deploy --token $SHOPIFY_HYDROGEN_DEPLOYMENT_TOKEN
```

### Step 1.2: Configure Oxygen Environment Variables

Add these in Shopify Admin → Headless → Settings → Environment Variables:

```
# Copy from your .env file - DO NOT commit actual values to git!
PUBLIC_STORE_DOMAIN=your-store.myshopify.com
PUBLIC_CHECKOUT_DOMAIN=yourdomain.com
PUBLIC_STOREFRONT_API_TOKEN=your-storefront-token
SESSION_SECRET=your-session-secret
PRIVATE_ADMIN_API_TOKEN=your-admin-token
PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID=your-client-id
PUBLIC_CUSTOMER_ACCOUNT_API_URL=your-customer-account-url
PRIVATE_ADMIN_API_VERSION=2025-01
SHOP_ID=your-shop-id
```

### Step 1.3: Verify Deployment

- [ ] Store loads at `https://wowstore.live`
- [ ] Products display correctly
- [ ] Collections work
- [ ] Cart functionality works
- [ ] Checkout redirects properly
- [ ] Search works
- [ ] Customer login/signup works
- [ ] Multi-language switching works

**At this point, your store is LIVE and operational!** 🎉

---

## 📊 Phase 2: Set Up PostgreSQL (Reviews & Returns)

### Step 2.1: Set Up PostgreSQL Database

```bash
# Connect to your GKE PostgreSQL instance
gcloud sql connect YOUR_INSTANCE_NAME --user=postgres

# Or connect directly
psql -h YOUR_HOST -U YOUR_USER -d postgres
```

Run the following SQL:

```sql
-- Create database
CREATE DATABASE hydrogen_db;

-- Create roles
CREATE ROLE web_anon NOLOGIN;
CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD 'CHANGE-THIS-PASSWORD';
GRANT web_anon TO authenticator;

-- Connect to the new database
\c hydrogen_db

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Step 2.2: Run Database Migrations

```bash
# From your local machine, run migrations
psql -h YOUR_HOST -U authenticator -d hydrogen_db < database/migrations/001_create_reviews_schema.sql
psql -h YOUR_HOST -U authenticator -d hydrogen_db < database/migrations/002_create_returns_schema.sql
```

### Step 2.3: Grant Permissions

```sql
\c hydrogen_db

GRANT USAGE ON SCHEMA public TO web_anon;
GRANT SELECT, INSERT ON product_reviews TO web_anon;
GRANT SELECT, INSERT ON review_images TO web_anon;
GRANT SELECT ON reviews_with_images TO web_anon;
GRANT SELECT, INSERT, UPDATE ON returns TO web_anon;
GRANT SELECT, INSERT ON return_items TO web_anon;
GRANT SELECT, INSERT ON return_images TO web_anon;
GRANT SELECT ON returns_with_details TO web_anon;
```

### Step 2.4: Verify Database Setup

```sql
-- Check tables were created
\dt

-- Should see:
--  product_reviews
--  review_images
--  returns
--  return_items
--  return_images

-- Check views
\dv

-- Should see:
--  reviews_with_images
--  returns_with_details
```

---

## 🚀 Phase 3: Deploy PostgREST API

### Step 3.1: Update PostgREST Configuration

Edit `database/k8s/postgrest-deployment.yaml`:

```yaml
stringData:
  # Update with your actual connection string
  db-uri: "postgres://authenticator:YOUR-PASSWORD@YOUR-POSTGRES-HOST:5432/hydrogen_db"
```

### Step 3.2: Deploy to GKE

```bash
# Apply the deployment
kubectl apply -f database/k8s/postgrest-deployment.yaml

# Check deployment status
kubectl get pods -l app=postgrest
kubectl logs -l app=postgrest

# Check service
kubectl get svc postgrest
```

### Step 3.3: Test PostgREST

```bash
# Test from within cluster
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- \
  curl http://postgrest:3000/product_reviews

# Should return: []
```

### Step 3.4: Expose PostgREST (Choose One)

**Option A: Internal Only** (if Hydrogen and PostgREST in same cluster)
```
# Already accessible at: http://postgrest:3000
POSTGREST_URL=http://postgrest:3000
```

**Option B: External Load Balancer**
```bash
kubectl expose deployment postgrest --type=LoadBalancer --port=80 --target-port=3000
kubectl get svc postgrest  # Get EXTERNAL-IP
POSTGREST_URL=http://EXTERNAL-IP
```

**Option C: Ingress with Domain** (Recommended for production)
```bash
# Apply ingress configuration (see database/README.md)
# Then use:
POSTGREST_URL=https://api.yourdomain.com
```

---

## 🔗 Phase 4: Connect Hydrogen to PostgreSQL

### Step 4.1: Add PostgreSQL Environment Variables to Oxygen

In Shopify Admin → Headless → Settings → Environment Variables, add:

```
POSTGREST_URL=http://postgrest:3000
# or https://api.yourdomain.com if using ingress
```

### Step 4.2: Test API Integration (Optional - For Later)

The routes are currently disabled. To enable:

1. Update `app/routes/($locale).api.reviewProduct.tsx`
2. Update `app/routes/($locale).api.createReturn.tsx`
3. Update `app/routes/($locale).api.paginationFirebase.tsx`
4. Update `app/routes/($locale).products.$productHandle.tsx`

See `database/README.md` for detailed instructions on updating routes.

---

## 📦 Phase 5: Migrate Firebase Data (Optional)

If you have existing Firebase reviews/returns data:

### Step 5.1: Export Firebase Data

```javascript
// Run in Firebase project
const admin = require('firebase-admin');
admin.initializeApp();

async function exportReviews() {
  const snapshot = await admin.firestore().collection('product_review').get();
  const reviews = snapshot.docs.map(doc => doc.data());
  console.log(JSON.stringify(reviews, null, 2));
}

exportReviews();
```

### Step 5.2: Import to PostgreSQL

```bash
# Use the provided import script or PostgREST API
# See database/README.md for detailed instructions
```

---

## ✅ Verification Checklist

### Core Store (Phase 1)
- [ ] Homepage loads
- [ ] Product pages display
- [ ] Collections page works
- [ ] Cart functionality
- [ ] Checkout works
- [ ] Search functionality
- [ ] Customer accounts
- [ ] Multi-language
- [ ] Store locator
- [ ] Order tracking

### PostgreSQL Infrastructure (Phase 2-3)
- [ ] PostgreSQL database created
- [ ] Tables and views exist
- [ ] Permissions granted
- [ ] PostgREST deployed to GKE
- [ ] PostgREST accessible (test with curl)
- [ ] Environment variables set in Oxygen

### Reviews & Returns (Phase 4 - When Ready)
- [ ] Create review works
- [ ] View reviews works
- [ ] Create return works
- [ ] View returns works
- [ ] Images upload correctly

---

## 🔐 Security Checklist

- [ ] PostgreSQL uses strong password
- [ ] PostgREST uses JWT authentication (if external)
- [ ] All connections use TLS/HTTPS
- [ ] Environment variables not in git
- [ ] Database backups configured
- [ ] Rate limiting configured on ingress
- [ ] Network policies restrict traffic

---

## 📊 Monitoring Setup

### Application Monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure logging aggregation
- [ ] Set up uptime monitoring

### Database Monitoring
- [ ] Monitor PostgreSQL connections
- [ ] Track query performance
- [ ] Set up alerts for high load

### PostgREST Monitoring
- [ ] Monitor API response times
- [ ] Track error rates
- [ ] Set up health check alerts

---

## 🚨 Troubleshooting

### Store not loading
1. Check Oxygen deployment status in Shopify Admin
2. Check environment variables are set
3. Check browser console for errors
4. Review Oxygen logs

### PostgREST connection errors
1. Verify PostgreSQL is running
2. Check connection string is correct
3. Verify network policies allow traffic
4. Check PostgREST logs: `kubectl logs -l app=postgrest`

### Reviews/Returns not working
1. Verify PostgREST_URL is set in Oxygen
2. Test PostgREST endpoint directly
3. Check database permissions
4. Review application logs

---

## 📞 Support Resources

- **Hydrogen Docs**: https://shopify.dev/docs/storefronts/headless/hydrogen
- **PostgREST Docs**: https://postgrest.org
- **PostgreSQL Docs**: https://postgresql.org
- **GitHub Issues**: https://github.com/Wowstorelive/owen-wowstore-hydrogen-storefrontv3/issues

---

## 🎯 Success Criteria

Your deployment is successful when:

✅ Store is live and operational
✅ All core features work
✅ PostgreSQL database is set up
✅ PostgREST API is deployed
✅ Connection between Hydrogen and PostgreSQL tested

**Current Status:**
- ✅ Store built and ready to deploy
- ✅ Firebase features disabled
- ✅ PostgreSQL infrastructure created
- ⏳ Waiting for deployment
- ⏳ PostgreSQL setup needed
- ⏳ PostgREST deployment needed

---

## Next Steps

1. **Deploy store now** (Phase 1) - Get store live!
2. **Set up PostgreSQL** (Phase 2) - When ready for reviews/returns
3. **Deploy PostgREST** (Phase 3) - Connect to database
4. **Enable reviews/returns** (Phase 4) - Update routes when ready

🎉 **You're all set to launch!**
