# Development Checklist

## Phase 1: Project Setup & Infrastructure

- [x] Initialize Next.js 15 project with App Router and TypeScript
- [x] Configure Tailwind CSS
- [x] Install and configure shadcn/ui
- [x] Set up ESLint and Prettier
- [x] Set up Prisma ORM
- [x] Configure PostgreSQL connection (Supabase/local Docker)
- [x] Define database schema (Poems, Genres, Tags, Books, Comments, Subscribers, Campaigns, Users)
- [x] Run initial migration
- [x] Seed database with sample data
- [x] Set up environment variables (.env.example)
- [x] Configure Vercel project

## Phase 2: Authentication

- [x] Install and configure Auth.js
- [x] Set up Google OAuth provider
- [x] Create auth API routes
- [x] Implement session management
- [x] Create role-based access (Admin, Reader)
- [x] Protect admin routes with middleware

## Phase 3: Database & Data Layer

- [x] Create Prisma models for all entities
- [ ] Set up data access functions (queries/mutations)
- [ ] Implement PostgreSQL Full Text Search for poems
- [x] Add database indexes for performance

## Phase 4: Public Website - Layout & Navigation

- [x] Create root layout with metadata
- [x] Build header/navigation component
- [x] Build footer component
- [x] Create mobile-responsive navigation
- [x] Set up global styles and typography

## Phase 5: Public Pages - Home

- [x] Build Home page layout
- [x] Author introduction section
- [ ] Featured poems section (display 3 featured poems on home)
- [ ] Latest poems section
- [ ] Featured book section
- [ ] Newsletter signup section

## Phase 6: Public Pages - Poems

- [x] Poems listing page with like & comment count icons
- [x] Poem detail page with sidebar (likes + comments)
- [ ] Poems pagination
- [ ] Genre filter on poems listing
- [ ] Tag filter on poems listing
- [x] Language filter on poems listing (All/English/Hindi/Marathi)
- [ ] Search functionality (PostgreSQL FTS)
- [ ] Related poems section on detail page

## Phase 7: Public Pages - Genres

- [ ] Genres listing page
- [ ] Genre detail page (poems by genre)

## Phase 8: Public Pages - Books

- [ ] Books listing page
- [ ] Book detail page
- [ ] Book status display (Coming Soon / Available / Archived)
- [ ] Purchase link integration

## Phase 9: Public Pages - Static

- [x] About Author page
- [x] Contact page
- [ ] Newsletter subscription page

## Phase 10: SEO & Metadata

- [ ] Configure metadata for all pages (title, description, canonical)
- [ ] Add Open Graph metadata
- [ ] Add Twitter card metadata
- [ ] Add structured data (JSON-LD) for poems
- [ ] Add structured data for books
- [ ] Generate sitemap.xml
- [ ] Generate robots.txt

## Phase 11: Comments & Likes System

- [x] Like model & API route (toggle like/unlike per poem)
- [x] Like button with user popup on poem detail page
- [x] Like & comment counts on poems listing cards
- [x] Comment form component (authenticated users only)
- [x] Display approved comments on poem detail sidebar
- [x] Submit comment API route
- [x] Comment like model & API route (per-comment likes)
- [x] Comment like button on each comment
- [ ] Comment moderation in admin (Pending/Approved/Rejected)

## Phase 12: Newsletter System

- [ ] Subscriber signup form
- [ ] Email verification flow
- [ ] Configure Resend integration
- [ ] Subscription confirmation email
- [ ] Unsubscribe functionality

## Phase 13: Admin Dashboard - Layout

- [x] Admin layout with tab navigation
- [x] Dashboard overview page (stats: total/published/drafts/featured)
- [x] Admin route protection (role-based in layout)

## Phase 14: Admin - Poems Management

- [x] Poems list with publish/draft status badges
- [x] Create poem form (title, content, language, publish toggle)
- [x] Edit poem form (pre-filled)
- [x] Publish/unpublish poem toggle action
- [x] Featured poem toggle (max 3 featured, with dashboard slots view)
- [x] Delete poem with confirmation
- [x] View published poem link
- [ ] Genre & tag assignment in poem forms
- [ ] Cover image upload
- [ ] SEO fields in poem forms
- [ ] Poem preview
- [ ] "Notify Subscribers" option on publish

## Phase 15: Admin - Books Management

- [ ] Books list
- [ ] Create book form
- [ ] Edit book form
- [ ] Delete book action
- [ ] Book status management

## Phase 16: Admin - Comments Management

- [ ] Comments list with status filters
- [ ] Approve comment action
- [ ] Reject comment action
- [ ] Delete comment action

## Phase 17: Admin - Newsletter Management

- [ ] Subscribers list
- [ ] Create campaign form (subject, content)
- [ ] Campaign preview
- [ ] Send campaign action
- [ ] Campaign delivery history
- [ ] Campaign status management (Draft/Scheduled/Sent)

## Phase 18: Performance & Accessibility

- [ ] Optimize images (next/image, proper sizes)
- [ ] Implement proper loading states
- [ ] Add error boundaries
- [ ] Audit accessibility (ARIA, keyboard navigation, contrast)
- [ ] Test mobile responsiveness
- [ ] Lighthouse performance audit

## Phase 19: Deployment & Production

- [ ] Configure Vercel deployment
- [ ] Set production environment variables
- [ ] Configure custom domain
- [ ] Test production build locally
- [ ] Deploy to Vercel
- [ ] Verify all features in production

## Phase 20: Polish & Launch

- [ ] Final design review
- [ ] Content review
- [ ] Cross-browser testing
- [ ] Final SEO audit
- [ ] Launch
