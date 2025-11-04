# 🌊 Owen WowStore Hydrogen Storefront v3

**AI-Powered Funnel System with Winter Theme & Ocean Conservation**

[![Shopify Hydrogen](https://img.shields.io/badge/Shopify-Hydrogen-7AB55C?logo=shopify)](https://hydrogen.shopify.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)

## ✨ Features

- 🎯 **AI-Powered Funnels** - Dynamic quiz-to-checkout journeys with Vertex AI personalization
- ❄️ **Winter Theme** - Animated snowfall canvas background
- 🌊 **Ocean Conservation** - Integrated WowMoment impact tracking for Ocean Conservancy
- 🎨 **Framer Motion** - Smooth, professional animations
- 📱 **Mobile-First** - Fully responsive with Tailwind CSS
- 📊 **Analytics Ready** - Built-in event tracking API
- 🚀 **Production-Ready** - Optimized for Shopify Oxygen deployment

## 🏗️ Architecture
```
app/
├── routes/
│   ├── funnel.$code.tsx       # Dynamic funnel routing
│   └── api.funnel.track.tsx   # Analytics endpoint
├── components/
│   ├── funnel/
│   │   ├── FunnelStage.tsx    # Multi-stage components
│   │   └── FunnelProgress.tsx # Animated progress tracker
│   └── winter/
│       └── WinterBackground.tsx # Canvas snowfall
└── lib/
    └── vertexai/
        └── personalizer.ts     # AI personalization engine
```

## 🚀 Quick Start
```bash
# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Deploy to Shopify Oxygen
npm run deploy
```

## 🎯 Funnel System

### Creating a Funnel

1. **Shopify Admin** → Settings → Custom Data → Metaobjects
2. Create "Funnel" type with fields:
   - `name` (Single line text)
   - `stages` (JSON)
   - `theme` (JSON)
3. Create a funnel entry with handle like `winter-ocean-2025`

### Access Funnels
```
https://your-store.com/funnel/winter-ocean-2025
https://your-store.com/funnel/your-custom-code
```

### Example Configuration
```json
{
  "name": "Winter Ocean Bundle",
  "stages": [
    {
      "id": "quiz-1",
      "name": "What matters to you?",
      "type": "quiz",
      "content": {
        "question": "What ocean issue concerns you most?",
        "options": [
          {
            "label": "Plastic Pollution",
            "description": "Help clean our oceans"
          },
          {
            "label": "Marine Life Protection",
            "description": "Save endangered species"
          }
        ]
      }
    },
    {
      "id": "product-1",
      "name": "Your Perfect Match",
      "type": "product",
      "content": {
        "name": "Ocean Conservation Bundle",
        "price": "49.99",
        "image": "/products/ocean-bundle.jpg",
        "description": "Every purchase plants coral & removes plastic"
      }
    }
  ],
  "theme": {
    "primaryColor": "#3B82F6",
    "secondaryColor": "#8B5CF6"
  }
}
```

## 🎨 Stage Types

- **Quiz** - Interactive questionnaires with branching logic
- **Product** - Product showcase with add-to-cart
- **Upsell** - Time-limited offers and bundles
- **Checkout** - Seamless checkout integration

## 📊 Analytics

Track funnel events via API:
```typescript
POST /api/funnel/track
Content-Type: application/json

{
  "event": "stage_complete",
  "stageId": "quiz-1",
  "funnelCode": "winter-ocean-2025",
  "data": {
    "answer": "plastic_pollution",
    "timestamp": "2025-11-04T13:48:00Z"
  }
}
```

## 🌍 Ocean Conservation

Every funnel purchase contributes to:
- 🌊 Ocean Conservancy donations
- 🪸 Coral restoration projects  
- ♻️ Plastic removal from oceans
- 🐠 Marine life protection programs

## 🔧 Tech Stack

- **Shopify Hydrogen** - React-based Shopify framework
- **Remix** - Full-stack web framework
- **Framer Motion** - Animation library
- **Lucide React** - Modern icon library
- **Tailwind CSS** - Utility-first CSS
- **Vertex AI** - Google Cloud AI (ready for integration)
- **TypeScript** - Type-safe JavaScript

## 🔐 Environment Variables
```env
PUBLIC_STOREFRONT_API_TOKEN=your_shopify_token
PUBLIC_STORE_DOMAIN=your-store.myshopify.com
VERTEX_AI_PROJECT_ID=wowstore-ai-media-agent
VERTEX_AI_LOCATION=europe-west4
```

## 📦 What's Included

- ✅ 6 production-ready components (576 lines of code)
- ✅ Dynamic funnel routing with Shopify integration
- ✅ Animated UI with Framer Motion
- ✅ Winter-themed canvas animations
- ✅ Vertex AI personalization (stub ready)
- ✅ Analytics tracking endpoint
- ✅ TypeScript for type safety
- ✅ Mobile-responsive design

## 🤝 Contributing

Built with ❤️ for ocean conservation by [WowStore.live](https://wowstore.live)

## 📄 License

Private - All Rights Reserved © 2025 WowStore

---

**Committed to protecting our oceans, one purchase at a time** 🌊
