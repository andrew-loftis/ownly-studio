# Ownly Studio Development Guide

## Architecture Overview

This is a **Next.js 16 App Router** project using **React 19** with a premium design system built around "glass morphism" and dark theming. It's a **studio landing page + build configurator** for a web development service business.

### Core Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **State**: Zustand for client state (`authStore`, `buildStore`)
- **Auth**: Firebase Auth with Google OAuth
- **Database**: Firestore for user profiles and data
- **Payments**: Stripe (checkout, subscriptions)
- **Deployment**: Netlify with `@netlify/plugin-nextjs`
- **Animations**: Framer Motion for page transitions and micro-interactions

## Project Structure Patterns

### Key Directories
```
app/                    # Next.js App Router pages
├── api/               # API routes (Stripe, AI, webhooks)
├── build/             # Interactive build configurator
├── examples/          # Dynamic showcase pages
└── account/           # User dashboard

components/
├── ui/                # Base components (Button, etc.)
├── premium/           # Design system components
├── layout/            # Layout-specific components
└── background/        # Visual effects

lib/                   # Business logic
├── authStore.ts       # Zustand auth state
├── pricing.ts         # Bundle pricing logic
├── firebase.ts        # Firebase client config
└── stripe.ts          # Stripe server config
```

### Component Patterns

#### Glass Morphism Design System
All components use CSS custom properties from `styles/globals.css`:
```tsx
// Standard glass surface
<div className="glass-strong rounded-2xl p-6">

// Color system
text-[var(--txt-primary)]     // Headings
text-[var(--txt-secondary)]   // Body text  
text-[var(--txt-tertiary)]    // Captions
bg-[var(--bg-1)]             // Page background
bg-[var(--bg-3)]             // Card surfaces
```

#### Button Component Pattern
```tsx
<Button variant="primary" size="lg">Start Building</Button>
<Button variant="ghost">Learn More</Button>
<Button variant="pill">Filter</Button>
```

#### Premium Component Exports
Use the barrel export from `components/premium/index.ts`:
```tsx
import { CTASection, StatBadge, AccordionCard } from "@/components/premium";
```

### State Management Patterns

#### Auth Store (Zustand)
```tsx
const { user, openModal, signOut } = useAuthStore();

// Guards for Firebase config
if (!auth) {
  set({ error: "Authentication not configured", loading: false });
  return;
}
```

#### Build Store Pattern
```tsx
const { selected, toggle, setCurrentStep } = useBuildStore();
// Always sync with react-hook-form for shareable URLs
setValue("features", newFeatures, { shouldTouch: true });
```

## Development Workflows

### Environment Setup
1. **Required env vars** in `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=
   NEXT_PUBLIC_FIREBASE_APP_ID=
   STRIPE_SECRET_KEY=
   ```

2. **Development**: `npm run dev` (Next.js dev server)
3. **Build**: `npm run build` (includes sitemap generation)
4. **Deploy**: Uses Netlify task `npm run build; netlify deploy --prod`

### Firebase Integration
- **Graceful degradation**: All Firebase calls check if `auth`/`db` exist
- **User docs**: Auto-created in `users/{uid}` collection via `ensureUserDoc()`
- **Error handling**: Friendly messages for common auth error codes

### URL Patterns
- **Middleware**: Rewrites `/examples/{slug}` → `/examples?slug={slug}`
- **Shareable configs**: Build page syncs selections to query params `?f=website,webapp`

## Critical Patterns

### Pricing Logic (`lib/pricing.ts`)
```tsx
// Bundle discounts applied automatically
const quote = price({
  website: true,
  cms: true,      // Triggers 10% website setup discount
  payments: true  // Triggers 10% payments setup discount
});
```

### Animation Standards
- **Page transitions**: Wrapped in `<RouteTransition>` (Framer Motion)
- **Micro-interactions**: `hover:-translate-y-0.5` for tactile buttons
- **Reduced motion**: CSS safeguard in build page for accessibility

### API Route Patterns
```tsx
// /app/api/checkout/route.ts - Stripe integration
// /app/api/ai/polish/route.ts - OpenAI content polish
// Always validate auth and handle missing env vars gracefully
```

### Mobile-First Responsive
- **Mobile tab bar**: `<MobileTabBar>` for mobile navigation
- **Responsive previews**: Build configurator scales preview components on small screens
- **Glass effects**: Adapted for mobile with appropriate backdrop-blur

## Integration Points

### Stripe Checkout Flow
1. Build page → `/api/checkout` → Stripe session
2. Success/cancel webhooks in `/api/hooks/stripe`
3. User subscription status stored in Firestore user doc

### Firebase Auth Flow
1. `AuthEffect.tsx` initializes on mount
2. `AuthModal.tsx` handles sign-in/sign-up
3. `ensureUserDoc()` creates/updates profile on auth change

### Content Management
- **Examples**: Static data in `lib/work.ts`
- **Mini previews**: React components in `components/mini/`
- **Placeholder assets**: All in `public/placeholders/`

## Backend Architecture & Admin System

### Current State
- **Basic admin**: Simple org creation in `/account/admin`
- **Firebase**: User docs with basic roles system
- **Stripe**: Basic checkout with setup/monthly pricing
- **API**: Limited routes for checkout, AI, webhooks

### Target Admin System (Based on ADMIN_EXAMPLES/Greeva)
Multi-tenant SaaS backend with proper client/admin separation:

#### Organization Structure
```tsx
// Orgs collection with role-based access
{
  id: "org-123",
  name: "Client Company",
  adminUids: ["owen-uid"], 
  editorUids: ["staff-uid"],
  clientUids: ["client-uid"],
  subscription: { plan: "pro", active: true },
  projects: [...],
  billing: {...}
}
```

#### Admin Dashboard Features
- **Project Management**: Create/assign projects, track deliverables, timeline views
- **Client Portal**: Restricted view for clients to see their projects/invoices  
- **Billing Integration**: Stripe subscriptions per org, invoice generation
- **Team Management**: Role assignments (admin/editor/client)
- **Analytics**: Revenue, project status, client activity dashboards

### Recommended Backend Improvements

#### 1. Firebase Upgrades
```bash
npm install firebase@latest firebase-admin@latest
# Update to v10+ modular SDK patterns
```

#### 2. Enhanced API Structure
```
app/api/
├── admin/                 # Admin-only endpoints
│   ├── orgs/             # CRUD operations
│   ├── projects/         # Project management
│   ├── billing/          # Invoice generation
│   └── analytics/        # Dashboard data
├── client/               # Client portal endpoints
└── stripe/               # Enhanced Stripe integration
    ├── create-subscription/
    ├── cancel-subscription/
    └── generate-invoice/
```

#### 3. Stripe Integration Enhancements
- **Per-org subscriptions** instead of per-user
- **Invoice generation** for project deliverables
- **Usage-based billing** for add-on features
- **Webhook handling** for subscription status updates

### Key Files to Reference

- `app/build/page.tsx` - Complex state management example
- `components/premium/` - Design system implementation
- `lib/pricing.ts` - Business logic patterns
- `lib/roles.ts` - Current role system (needs expansion)
- `firebase/firestore.rules` - Security rules for multi-tenant access
- `app/account/admin/page.tsx` - Basic admin implementation
- `ADMIN_EXAMPLES/Greeva-Nextjs_v1.0/TS/` - Target admin dashboard features
- `styles/globals.css` - CSS custom properties system
- `middleware.ts` - URL rewriting patterns
- `netlify.toml` - Deployment configuration