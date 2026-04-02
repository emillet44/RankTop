# Project Overview: digbtt (Ranktop)

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database & ORM:** PostgreSQL (Neon) with Prisma
- **Styling:** Tailwind CSS
- **Authentication:** Next-Auth (NextAuth.js)
- **Search:** Algolia (AlgoliaSearch, React InstantSearch)
- **Cloud Services:** Google Cloud Platform (Storage, Cloud Tasks)
- **Media Processing:** FFmpeg (Client-side/Node)
- **Data Fetching:** SWR & Next.js Server Actions

## Folder Structure
- `app/`: Contains the App Router pages (`page.tsx`), layouts, and API routes (`api/`).
- `components/`: React UI components.
  - `serverActions/`: Dedicated folder for Next.js Server Actions (`'use server'`).
  - `headers/`: Header variants for different sections.
  - `search/`: Algolia search integration components.
- `lib/`: Shared libraries and utility functions (e.g., `prisma.ts`, `auth-helpers.ts`).
- `prisma/`: Prisma schema and database migrations.
- `public/`: Static assets like fonts and images.
- `types/`: Custom TypeScript type definitions.

## Coding Patterns
- **Server-First Logic:** Heavy reliance on Next.js Server Actions for database operations and business logic.
- **Hybrid Components:** Clear separation between Client Components (`'use client'`) for interactivity and Server Components for initial rendering.
- **Service Layering:** Utilities for signed URLs, Auth, and Prisma are centralized in `lib/`.
- **Search Integration:** Search is offloaded to Algolia with synchronization triggers.
- **Naming Conventions:** 
  - Components: PascalCase (e.g., `PostList.tsx`).
  - Server Actions & Utilities: camelCase (e.g., `loadposts.ts`).

## Tools
- **UI Validation:** Always use **Playwright** to check `http://localhost:3000` for any UI-related tasks or visual verification.
