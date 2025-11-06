# PostgreSQL + PostgREST Setup for Hydrogen

Complete guide to set up PostgreSQL database with PostgREST REST API for your Hydrogen storefront.

## Architecture

```
Hydrogen Storefront (Oxygen Edge Workers)
    ↓ HTTP/fetch() API calls
PostgREST API (GKE Cluster)
    ↓ PostgreSQL protocol
PostgreSQL Database (GKE Cluster)
```

**Why this architecture?**
- ✅ **Oxygen Compatible**: Uses only fetch() API (Web Standard)
- ✅ **No Node.js APIs**: Works in edge worker runtime
- ✅ **Fast**: Direct database access via REST
- ✅ **Scalable**: PostgREST is stateless and horizontally scalable
- ✅ **Secure**: Row-level security in PostgreSQL

---

## Step 1: Set Up PostgreSQL Database

### 1.1 Connect to your PostgreSQL instance

```bash
# If using Cloud SQL or managed PostgreSQL
gcloud sql connect YOUR_INSTANCE_NAME --user=postgres

# Or connect directly
psql -h YOUR_HOST -U YOUR_USER -d postgres
```

### 1.2 Create database and user

```sql
-- Create database
CREATE DATABASE hydrogen_db;

-- Create roles
CREATE ROLE web_anon NOLOGIN;
CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD 'your-secure-password';
GRANT web_anon TO authenticator;

-- Connect to the new database
\c hydrogen_db

-- Run migrations
\i migrations/001_create_reviews_schema.sql
\i migrations/002_create_returns_schema.sql
```

### 1.3 Grant permissions

```sql
-- Grant permissions to web_anon role
GRANT USAGE ON SCHEMA public TO web_anon;
GRANT SELECT, INSERT ON product_reviews TO web_anon;
GRANT SELECT, INSERT ON review_images TO web_anon;
GRANT SELECT ON reviews_with_images TO web_anon;
GRANT SELECT, INSERT, UPDATE ON returns TO web_anon;
GRANT SELECT, INSERT ON return_items TO web_anon;
GRANT SELECT, INSERT ON return_images TO web_anon;
GRANT SELECT ON returns_with_details TO web_anon;
```

---

## Step 2: Deploy PostgREST to GKE

### 2.1 Update the secret in `k8s/postgrest-deployment.yaml`

```yaml
stringData:
  # Update with your actual connection string
  db-uri: "postgres://authenticator:your-password@postgres-service:5432/hydrogen_db"
```

### 2.2 Deploy to Kubernetes

```bash
# Apply the deployment
kubectl apply -f k8s/postgrest-deployment.yaml

# Check deployment status
kubectl get pods -l app=postgrest
kubectl logs -l app=postgrest

# Check service
kubectl get svc postgrest
```

### 2.3 Expose PostgREST (choose one option)

**Option A: Internal only (recommended for security)**
```bash
# PostgREST is already accessible within cluster at:
# http://postgrest:3000
```

**Option B: Expose via Load Balancer**
```bash
# Create load balancer service
kubectl expose deployment postgrest --type=LoadBalancer --port=80 --target-port=3000
```

**Option C: Expose via Ingress (recommended for production)**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: postgrest-ingress
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - api.yourdomain.com
    secretName: postgrest-tls
  rules:
  - host: api.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: postgrest
            port:
              number: 3000
```

### 2.4 Test PostgREST

```bash
# From within the cluster
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- \
  curl http://postgrest:3000/product_reviews

# From outside (if exposed)
curl https://api.yourdomain.com/product_reviews
```

---

## Step 3: Configure Hydrogen Environment Variables

### 3.1 Add to `.env` file (local development)

```bash
# PostgreSQL/PostgREST configuration
POSTGREST_URL=http://postgrest:3000
# POSTGREST_API_KEY=your-jwt-token  # Optional: for authentication
```

### 3.2 Add to Oxygen Environment Variables

1. Go to Shopify Admin → Headless → Settings
2. Add environment variables:
   - `POSTGREST_URL`: Your PostgREST URL (e.g., `https://api.yourdomain.com`)
   - `POSTGREST_API_KEY`: (Optional) JWT token for authentication

---

## Step 4: Migrate Data from Firebase (Optional)

If you have existing Firebase data:

### 4.1 Export Firebase data

```javascript
// Run this script in your Firebase project
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

async function exportReviews() {
  const snapshot = await db.collection('product_review').get();
  const reviews = [];

  snapshot.forEach(doc => {
    reviews.push(doc.data());
  });

  console.log(JSON.stringify(reviews, null, 2));
}

exportReviews();
```

### 4.2 Import to PostgreSQL

```javascript
// Import script (run with Node.js)
const reviews = require('./firebase-export.json');

async function importReviews() {
  for (const review of reviews) {
    await fetch('https://api.yourdomain.com/product_reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: review.productId,
        product_handle: review.productHandle,
        rating: review.rating,
        title: review.title,
        description: review.description,
        customer_name: review.customer.name,
        customer_email: review.customer.email,
        created_at: review.createdAt,
      }),
    });
  }
}

importReviews();
```

---

## Step 5: Deploy Hydrogen with PostgreSQL

### 5.1 Build and test locally

```bash
npm run build
npm run dev

# Test reviews API
curl -X POST http://localhost:3000/api/reviewProduct \
  -H "Content-Type: application/json" \
  -d '{"product":{"id":"123","handle":"test"},"rating":5,"title":"Great!","description":"Love it"}'
```

### 5.2 Deploy to Oxygen

```bash
# Option 1: Via Shopify Admin (GitHub integration)
# Push to main branch, Shopify auto-deploys

# Option 2: Via CLI
npx shopify hydrogen deploy --token $SHOPIFY_HYDROGEN_DEPLOYMENT_TOKEN
```

---

## API Endpoints

PostgREST automatically creates REST endpoints from your database schema:

### Reviews

```bash
# Get reviews for a product
GET /reviews_with_images?product_handle=eq.my-product&order=created_at.desc

# Create a review
POST /product_reviews
{
  "product_id": "gid://shopify/Product/123",
  "product_handle": "my-product",
  "rating": 5,
  "title": "Great product",
  "description": "I love it!",
  "customer_name": "John Doe",
  "customer_email": "john@example.com"
}

# Add review images
POST /review_images
{
  "review_id": "uuid-here",
  "image_url": "https://..."
}
```

### Returns

```bash
# Get returns for an order
GET /returns_with_details?order_id=eq.12345

# Create a return
POST /returns
{
  "order_id": "gid://shopify/Order/123",
  "order_name": "#1001",
  "customer_email": "customer@example.com",
  "reason": "Size too small",
  "status": "pending"
}
```

---

## Security Best Practices

1. **Use HTTPS**: Always use TLS for PostgREST
2. **Implement JWT Authentication**: Add JWT validation in PostgREST
3. **Row-Level Security**: Use PostgreSQL RLS policies
4. **Rate Limiting**: Add rate limiting to your ingress
5. **Network Policies**: Restrict PostgREST to only accept traffic from Oxygen IPs

### Example: JWT Authentication

```sql
-- Create JWT validation function
CREATE OR REPLACE FUNCTION public.check_auth()
RETURNS void AS $$
BEGIN
  IF current_setting('request.jwt.claims', true)::json->>'role' IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
END;
$$ LANGUAGE plpgsql;
```

---

## Monitoring

### Check PostgREST logs

```bash
kubectl logs -f deployment/postgrest
```

### Monitor PostgreSQL

```bash
# Check active connections
kubectl exec -it postgres-pod -- psql -U postgres -c "SELECT * FROM pg_stat_activity;"

# Check table sizes
kubectl exec -it postgres-pod -- psql -U postgres hydrogen_db -c "\dt+"
```

---

## Troubleshooting

### PostgREST returns 404

- Check if tables exist: `\dt` in psql
- Verify permissions: `\dp` in psql
- Check PostgREST logs

### Connection refused

- Verify PostgreSQL is running
- Check PostgreSQL connection string
- Verify network policies allow traffic

### Slow queries

- Add indexes to frequently queried columns
- Use `EXPLAIN ANALYZE` to optimize queries
- Consider connection pooling (pgBouncer)

---

## Performance Optimization

1. **Connection Pooling**: Use pgBouncer between PostgREST and PostgreSQL
2. **Caching**: Add Redis/Varnish in front of PostgREST
3. **CDN**: Use CDN for static image URLs
4. **Indexes**: Ensure proper indexes on foreign keys and query columns
5. **Horizontal Scaling**: Scale PostgREST replicas based on load

---

## Cost Optimization

- Use Google Cloud SQL for managed PostgreSQL
- Start with db-f1-micro for testing ($7/month)
- Scale to db-n1-standard-1 for production (~$50/month)
- PostgREST is lightweight (128MB RAM sufficient)
- Total estimated cost: $60-100/month for small-medium store

---

## Support

For issues or questions:
1. Check PostgREST docs: https://postgrest.org
2. Check PostgreSQL docs: https://postgresql.org
3. Review Hydrogen docs: https://shopify.dev/docs/storefronts/headless/hydrogen

---

## Next Steps

1. ✅ Set up PostgreSQL database
2. ✅ Deploy PostgREST to GKE
3. ✅ Configure Hydrogen environment variables
4. ✅ Test API endpoints
5. ✅ Migrate Firebase data (if applicable)
6. ✅ Deploy to Oxygen
7. 🎉 Enjoy your edge-compatible database!
