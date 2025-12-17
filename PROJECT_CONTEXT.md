# PROJECT CONTEXT — Classic Bakery

## Overview
Project Classic Bakery terdiri dari 3 repo/folder utama:
1. `FRONTEND-CLASSIC-BAKERY` — Next.js, TypeScript
2. `ADMIN-CLASSIC-BAKERY` — React (Vite), TypeScript
3. `BACKEND-CLASSIC-BAKERY` — Node.js, Express.js, Firebase (Firestore)

---

## How to Run (Development)

Semua repo menjalankan development server dengan perintah:
```bash
npm run dev
```
Ports
Backend berjalan di port: 5013
Backend Base URL (local): http://localhost:5013
Folder Structure

1) FRONTEND-CLASSIC-BAKERY (Next.js + TypeScript)

```bash
FRONTEND-CLASSIC-BAKERY/
├─ .next/
├─ app/
│  ├─ about/
│  │  └─ page.tsx
│  ├─ auth/
│  │  └─ login/
│  │     ├─ LoginPage.module.scss
│  │     └─ page.tsx
│  ├─ cart/
│  │  ├─ CartPage.module.scss
│  │  └─ page.tsx
│  ├─ components/
│  │  ├─ about/
│  │  │  ├─ brandOverview/
│  │  │  │  ├─ BrandOverviewSection.module.scss
│  │  │  │  └─ BrandOverviewSection.tsx
│  │  │  └─ ctaAbout/
│  │  │     ├─ CtaAboutSection.module.scss
│  │  │     └─ CtaAboutSection.tsx
│  │  ├─ contact/
│  │  │  ├─ businessHours/
│  │  │  │  ├─ BusinessHoursSection.module.scss
│  │  │  │  └─ BusinessHoursSection.tsx
│  │  │  └─ ctaContact/
│  │  │     ├─ CtaContactSection.module.scss
│  │  │     └─ ctaContactSection.tsx
│  │  ├─ ctaHome/
│  │  │  ├─ CtaHomeSection.module.scss
│  │  │  └─ CtaHomeSection.tsx
│  │  ├─ faq/
│  │  │  ├─ FAQSection.module.scss
│  │  │  ├─ FAQSection.tsx
│  │  │  ├─ FAQSection2.module.scss
│  │  │  └─ FAQSection2.tsx
│  │  ├─ featuredProducts/
│  │  │  ├─ FeaturedProductsPreview.module.scss
│  │  │  └─ FeaturedProductsPreview.tsx
│  │  ├─ footer/
│  │  │  ├─ Footer.module.scss
│  │  │  └─ Footer.tsx
│  │  ├─ heroSection/
│  │  │  ├─ HeroSection.module.scss
│  │  │  └─ HeroSection.tsx
│  │  ├─ navbar/
│  │  │  ├─ Navbar.module.scss
│  │  │  └─ Navbar.tsx
│  │  ├─ reviews/
│  │  │  ├─ ReviewsSection.module.scss
│  │  │  └─ ReviewsSection.tsx
│  │  ├─ termConditionSection/
│  │  │  ├─ TermConditionSection.module.scss
│  │  │  └─ TermConditionSection.tsx
│  │  ├─ whyChooseUs/
│  │  │  ├─ WhyChooseUsSection.module.scss
│  │  │  └─ WhyChooseUsSection.tsx
│  │  └─ LayoutWithNav.tsx
│  ├─ contact/
│  │  └─ page.tsx
│  ├─ context/
│  │  └─ RootProviders.tsx
│  ├─ faq/
│  │  └─ page.tsx
│  ├─ policies/
│  │  └─ page.tsx
│  ├─ products/
│  │  ├─ page.tsx
│  │  └─ ProductsPage.module.scss
│  ├─ styles/
│  │  ├─ _variables.scss
│  │  └─ _globals.scss
│  ├─ favicon.ico
│  ├─ globals.css
│  ├─ globals.scss
│  ├─ layout.tsx
│  └─ page.tsx
├─ lib/
│  ├─ apiClient.ts
│  └─ productsApi.ts
├─ node_modules/
├─ public/
│  └─ images/
│     ├─ kue-bolu-1.png
│     ├─ kue-bolu-2.png
│     ├─ kue-bolu-3.png
│     ├─ kue-bolu-4.png
│     ├─ kue-bolu-5.png
│     ├─ kue-bolu-6.png
│     ├─ logo-classic-bakery-cake.png
│     ├─ logo-classic-bakery-circle.png
│     ├─ toko-classic-bakery-1.png
│     ├─ file.svg
│     ├─ globe.svg
│     ├─ google.svg
│     ├─ next.svg
│     ├─ vercel.svg
│     └─ window.svg
├─ .env.local
├─ .gitignore
├─ eslint.config.mjs
├─ next-env.d.ts
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ README.md
└─ tsconfig.json

```
2) ADMIN-CLASSIC-BAKERY (React Vite + TypeScript)

```bash
ADMIN-CLASSIC-BAKERY/
├─ node_modules/
├─ public/
│  ├─ images/
│  │  └─ logo-classic-bakery-...   (nama file terpotong di screenshot)
│  └─ vite.svg
├─ src/
│  ├─ assets/
│  │  └─ react.svg
│  ├─ components/
│  │  ├─ footer/
│  │  ├─ navbar/
│  │  │  ├─ Navbar.module.scss
│  │  │  └─ Navbar.tsx
│  │  ├─ sidebar/
│  │  │  ├─ Sidebar.module.scss
│  │  │  └─ Sidebar.tsx
│  │  └─ ProtectedRoute.tsx
│  ├─ context/
│  │  └─ AuthContext.tsx
│  ├─ lib/
│  │  ├─ apiClient.ts
│  │  ├─ firebase.ts
│  │  └─ fontawesome.ts
│  ├─ pages/
│  │  ├─ LoginPage.tsx
│  │  └─ ProductsPage.tsx
│  ├─ utils/
│  │  └─ uploadImages.ts
│  ├─ App.tsx
│  ├─ main.tsx
│  ├─ styles.css
│  └─ styles/
│     ├─ _globals.scss
│     ├─ _responsive.scss
│     └─ _variables.scss
├─ .env.local
├─ .gitignore
├─ cors.json
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ README.md
└─ tsconfig.app.json

```
3) BACKEND-CLASSIC-BAKERY (Node.js + Express + Firebase)

```bash
BACKEND-CLASSIC-BAKERY/
├─ node_modules/
├─ src/
│  ├─ config/
│  │  ├─ env.js
│  │  └─ firebase.js
│  ├─ controllers/
│  │  ├─ CategoryController.js
│  │  ├─ ProductController.js
│  │  └─ sampleController.js
│  ├─ middlewares/
│  │  ├─ requireAdmin.js
│  │  └─ requireAuth.js
│  ├─ routes/
│  │  ├─ categoryRoutes.js
│  │  ├─ productRoutes.js
│  │  └─ sampleRoutes.js
│  ├─ scripts/
│  │  └─ seedProducts.js
│  ├─ index.js
│  └─ tools/
│     └─ setAdmin.js
├─ .env
├─ package-lock.json
└─ package.json

```
## API Documentation
- Postman Doc: https://documenter.getpostman.com/view/9505978/2sB3dTuUWM#63e69182-b8b2-4b58-a3a2-7497d31eddd0
- Postman Collection file: classic bakery.postman_collection.json

## Backend Details (Node.js + Express + Firebase)
### Local Server
- Base URL: http://localhost:5013
- API Prefix: /api
### Authentication & Authorization
### Firebase Auth (ID Token)
Backend menggunakan Firebase Admin untuk verifikasi token.
#### Header yang dibutuhkan:
- Authorization: Bearer <Firebase_ID_Token>
#### Middleware:
- requireAuth:
  - Verifikasi Firebase ID Token (authAdmin.verifyIdToken)
  - Attach user info ke req.user:
    - uid, email, name, role
  - role diambil dari Firebase custom claims (decoded.role), default "user"
- requireAdmin:
  - Dipakai untuk proteksi route admin-only (detail logic ada di file src/middlewares/requireAdmin.js)

Catatan:
- Endpoint Products (POST/PUT/DELETE) saat ini wajib requireAuth + requireAdmin.
- Endpoint Categories saat ini belum diproteksi auth.
### API Endpoints (Current)
#### Products — /api/products
Routes: src/routes/productRoutes.js
- GET /api/products
  - Public
  - Query params:
    - search (optional) — substring search in-memory pada name + shortDescription
    - category (optional)
    - limit (optional, default 20, max 100)
    - startAfterName (optional) — cursor pagination berbasis name (orderBy name)
  - Response:
    - { success, data: Product[], nextCursor }
- GET /api/products/:id
  - Public
  - Response:
    - { success, data: Product }
- POST /api/products
  - Admin-only: requireAuth + requireAdmin
  - Body (required):
    - name, shortDescription, category, price
  - Body (optional):
    - description, images, isActive
  - Validasi:
    - price harus number dan > 0
  - Auto:
    - slug dibuat dari name
    - createdAt, updatedAt (ISO string)
- PUT /api/products/:id
  - Admin-only: requireAuth + requireAdmin
  - Partial update
  - Validasi:
    - kalau price ada → harus number dan > 0
  - Auto:
    - updatedAt (ISO string)
- DELETE /api/products/:id
  - Admin-only: requireAuth + requireAdmin
  - Soft delete:
    - set isActive = false
    - update updatedAt

---

#### Categories — /api/categories

Routes: src/routes/categoryRoutes.js
- GET /api/categories
  - Public
  - Query params:
    - limit (optional, max 100)
    - search (optional) — prefix search in-memory pada name (case-insensitive)
    - activeOnly ("true" | "false", default "true")
  - Response:
    - { success, data: Category[], nextCursor: null }
- GET /api/categories/:id
  - Public
  - Response:
    - { success, data: Category }
- POST /api/categories
  - Public (belum ada requireAuth)
  - Body:
    - name (required)
    - slug (optional; jika kosong → generate dari name)
    - description (optional)
    - isActive (optional, default true)
  - Auto:
    - createdAt, updatedAt (number, epoch ms)
- PUT /api/categories/:id
  - Public (belum ada requireAuth)
  - Partial update fields:
    - name, slug, description, isActive
  - Auto:
    - updatedAt (epoch ms)
- DELETE /api/categories/:id
  - Public (belum ada requireAuth)
  - Soft delete:
    - isActive = false
    - set deletedAt (epoch ms)
    - update updatedAt (epoch ms)

---

### Firestore Data Model (Inferred from Controllers)
#### Collection: products
Document shape (normalized by controller):
- name: string
- slug: string
- shortDescription: string
- description: string
- price: number
- category: string
- images: array of { url: string, isPrimary: boolean }
- isActive: boolean
- createdAt: string (ISO)
- updatedAt: string (ISO)
Notes:
- Query list products selalu where("isActive", "==", true) + orderBy("name")
- Pagination cursor memakai value field name

### Collection: categories
Document shape:
- name: string
- slug: string
- description: string
- isActive: boolean
- createdAt: number (epoch ms)
- updatedAt: number (epoch ms)
- deletedAt: number (epoch ms, only after delete)
Notes:
- List categories bisa filter isActive == true (default)
- Search prefix dilakukan in-memory setelah fetch

---

#### Known Inconsistencies / TODO
 - Timestamp format beda: Products pakai ISO string, Categories pakai epoch ms (perlu distandarkan).
 - Security: Category create/edit/delete masih public (mungkin perlu requireAuth + requireAdmin juga).
 - Pastikan requireAdmin.js sesuai dengan custom claims role dari Firebase.
 - Dokumentasikan env variables untuk tiap repo (frontend/admin/backend).
