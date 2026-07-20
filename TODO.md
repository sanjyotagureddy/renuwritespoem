# Development Checklist

This checklist reflects the current repository state after review. Checked items
are already represented in the app; unchecked items are remaining product, UX,
admin, and technical work.

## Phase 1: Project Setup & Infrastructure

- [x] Initialize Next.js 15 project with App Router and TypeScript
- [x] Configure Tailwind CSS
- [x] Install and configure shadcn/ui
- [x] Set up ESLint and Prettier
- [x] Set up Prisma ORM
- [x] Configure PostgreSQL connection
- [x] Define database schema for users, poems, genres, tags, books, comments, subscribers, campaigns, orders, audio, invites, contact messages, attribution logs
- [x] Run initial and follow-up migrations
- [x] Seed database with sample data
- [x] Set up environment variables
- [x] Configure Vercel-oriented build/deployment scripts
- [x] Update README docs to reflect current features and admin modules
- [ ] Clean up or document legacy migrations if they are still needed

## Phase 2: Authentication & Access Control

- [x] Install and configure Auth.js
- [x] Set up Google OAuth provider
- [x] Create auth API routes
- [x] Implement session management
- [x] Create ADMIN and READER roles
- [x] Protect admin routes with middleware in production
- [x] Add admin layout role check
- [x] Add admin UI for user and role management
- [ ] Fail safely in production if auth secrets are missing
- [ ] Revisit development auto-admin behavior before launch
- [x] Implement manual credentials-based authentication & account lifecycle:
  - [x] Add optional `passwordHash` field to `User` model in Prisma schema (passwords must be stored encrypted/hashed)
  - [x] Add `PasswordResetToken` model (or fields) for account recovery
  - [x] Run database migration to update schema
  - [x] Configure `CredentialsProvider` in Auth.js options (`src/lib/auth.ts`)
  - [x] Set up password encryption/hashing configuration (e.g., salt rounds or pepper/secret key) in environment variables
  - [x] Implement secure password encryption/hashing (using `bcryptjs` or `argon2`) for database storage and verification
  - [x] Create manual registration (Sign Up) flow:
    - [x] Design/build SignUp page UI with validation (Name, Email, Password, Confirm Password)
    - [x] Implement server action/API for registration validation & user creation
    - [x] Generate and send verification email with token on registration
    - [x] Create verification page/route to process token and mark user as verified
  - [x] Create password reset / recovery flow:
    - [x] Design/build "Forgot Password" page to request reset link
    - [x] Implement server action/API to generate recovery token and send email
    - [x] Design/build "Reset Password" page to validate token and set new password securely
  - [x] Update `/login` page:
    - [x] Integrate credentials login form alongside Google Sign-In button
    - [x] Implement error handling for invalid credentials, unverified accounts, or disabled users
  - [x] Integrate verification/credentials state in Admin UI:
    - [x] Display email verification status (verified vs pending credentials) in Users table
    - [x] Add admin option to manually trigger/resend verification email or send password reset link

## Phase 3: Database & Data Layer

- [x] Create Prisma models for all main entities
- [x] Add database indexes for common queries
- [x] Add poem views tracking
- [x] Add invite and attribution models
- [x] Add unsubscribe suppression model
- [x] Set up reusable data access functions for repeated query/mutation patterns
- [x] Implement PostgreSQL full-text search for poems
- [ ] Add audit fields/logs for important admin actions
- [ ] Add stronger subscriber/campaign delivery models if campaign sending is built

## Phase 4: Public Layout & Navigation

- [x] Create root layout with metadata
- [x] Build header/navigation component
- [x] Build footer component
- [x] Create mobile-responsive navigation
- [x] Set up global styles and typography
- [x] Add floating social links
- [x] Add invited-reader welcome banner
- [x] Add active navigation state
- [ ] Review floating UI overlap on small screens

## Phase 5: Home Page

- [x] Build home page layout
- [x] Add author welcome / hero slide
- [x] Add featured book support in homepage carousel
- [x] Add latest audio support in homepage carousel
- [x] Add featured poem support in homepage carousel
- [x] Add reader testimonials/reactions section
- [ ] Add visible latest poems section below hero
- [ ] Add visible featured books section below hero
- [ ] Add visible latest audio section below hero
- [ ] Add homepage newsletter/signup section
- [ ] Reduce reliance on carousel-only discovery
- [ ] Add clearer primary calls to action for reading, buying, and subscribing


## Phase 6: Public Poems

- [x] Poems listing page
- [x] Poem detail page with sidebar actions
- [x] Like and comment counts on poem cards
- [x] Poem views display
- [x] Poems pagination
- [x] Page size selector
- [x] Language filter
- [x] Genre filter
- [x] Tag filter
- [x] Popular/newest/most-read sorting
- [x] Reading time display
- [x] Multilingual font handling for English, Hindi, and Marathi
- [x] Open Graph image route for poems
- [ ] Search functionality with PostgreSQL full-text search
- [ ] Related poems section on detail page
- [ ] Curated collections or mood-based browsing
- [ ] Better empty-state suggestions when filters return no results

## Phase 7: Public Genres

- [x] Genres listing page
- [x] Show published poem counts per genre
- [x] Show recent poems inside each genre card
- [x] Link genre cards to filtered poem results
- [ ] Dedicated genre detail pages
- [ ] Genre-specific metadata and Open Graph content

## Phase 8: Books & Orders

- [x] Books listing page
- [x] Book detail page
- [x] Book status display: Coming Soon, Available, Archived
- [x] Featured book display
- [x] Book like and comment support
- [x] Book views display
- [x] Book sharing and invite support
- [x] Purchase flow for available books
- [x] Payment screenshot upload
- [x] Order creation with idempotency key
- [x] Order confirmation emails
- [x] Order numbers
- [x] Payment screenshot admin access
- [x] Order status and tracking fields
- [x] Book JSON-LD structured data
- [x] Book Open Graph image route
- [x] Add buyer-facing order lookup/status page
- [x] Add order cancellation/refund notes if needed
- [ ] Add inventory or stock count if physical copies are limited

## Phase 9: Audio

- [x] Audio listing/player page
- [x] Custom audio client/player
- [x] Audio admin CRUD
- [x] Audio likes
- [x] Audio comments
- [x] Audio comment likes
- [x] Audio plays/views tracking
- [x] Audio Open Graph image route
- [ ] Dedicated audio detail pages if sharing individual tracks matters
- [ ] Audio search/filtering
- [ ] Transcript or lyrics field for SEO/accessibility

## Phase 10: Static Pages & Contact

- [/] About author page (Upgrading to Premium Dynamic Story page)
- [x] Contact page
- [x] Contact form
- [x] Contact message admin inbox
- [x] Admin reply-note/replied tracking
- [x] AI-assisted reply generation endpoint
- [x] Newsletter subscription/preferences page
- [x] Privacy policy page
- [x] Terms/refund/shipping policy pages for book purchases

## Phase 11: SEO & Metadata

- [x] Configure base metadata
- [x] Add per-page metadata for major public pages
- [x] Add Open Graph metadata
- [x] Add Twitter card metadata
- [x] Add homepage Website and Person JSON-LD
- [x] Add book JSON-LD
- [x] Add breadcrumb JSON-LD for books
- [x] Generate sitemap.xml
- [x] Generate robots.txt
- [x] Add Open Graph image routes for poems, books, and audio
- [ ] Add poem JSON-LD structured data
- [ ] Add canonical handling for filtered poem URLs where needed
- [ ] Final SEO audit before launch

## Phase 12: Comments & Likes

- [x] Poem like model and API route
- [x] Poem like button with user popup
- [x] Book like model and API route
- [x] Audio like model and API route
- [x] Comment form components for authenticated users
- [x] Display approved comments
- [x] Submit comment API routes for poems, books, and audio
- [x] Comment like models and API routes
- [x] Admin comments moderation page
- [x] Status filters for pending, approved, rejected, all
- [x] Approve/reject/delete/pin moderation actions
- [x] Basic tone check before publishing comments
- [x] Decide final comment policy: all pending by default vs auto-approve clean comments
- [x] Align admin copy with actual comment approval behavior
- [ ] Add stronger spam controls and abuse reporting
- [ ] Add user-level moderation history

## Phase 13: Newsletter & Subscriber System

- [x] Subscriber model exists
- [x] Campaign model exists
- [x] Unsubscribed email suppression model exists
- [x] Unsubscribe endpoint exists for invite suppression
- [x] Analytics counts new subscribers
- [x] Public subscriber signup form
- [x] Subscriber signup API route
- [x] Email verification flow
- [x] Subscription confirmation email
- [x] Subscriber preferences page
- [x] Proper newsletter unsubscribe flow for subscribers
- [x] Resubscribe flow
- [x] Duplicate email handling and normalized email storage
- [x] Admin subscribers list
- [x] Subscriber search and filters: verified, unverified, unsubscribed
- [x] Subscriber export CSV
- [x] Manual add/remove subscriber actions
- [x] Subscriber source tracking

## Phase 14: Campaign Management

- [x] Admin campaigns list
- [x] Create campaign form with subject and body
- [x] Campaign rich text or markdown editor
- [x] Campaign preview
- [x] Send test email
- [x] Send campaign to verified subscribers
- [x] Delivery history
- [x] Campaign status management: Draft, Scheduled, Sending, Sent, Failed
- [x] Unsubscribe links in every campaign email
- [x] Suppression check before sending
- [x] Basic analytics: sent, failed, opened/clicked if provider supports it
- [x] Optional "notify subscribers" action when publishing a poem, book, or audio item

## Phase 15: User / Reader Management

- [x] User model exists
- [x] Google sign-in creates reader accounts
- [x] Role is attached to session
- [x] Signup source field exists
- [x] Users can like, comment, and send invites
- [x] Admin users list
- [x] User search by name/email
- [x] User detail page
- [x] Show user role, signup source, joined date, comments, likes, invites, and orders
- [x] Promote/demote user role from admin UI
- [x] Disable or flag abusive users
- [x] View user moderation history
- [ ] Reader profile/account page
- [x] Reader liked/saved content pagination
- [x] Reader comment history pagination
- [ ] Reader invite history
- [ ] Reader order history
- [ ] Reader newsletter preferences

## Phase 16: Admin Dashboard & Navigation

- [x] Admin layout with grouped navigation
- [x] Dashboard overview page
- [x] Poem stats
- [x] Book stats
- [x] Featured poem slots
- [x] Featured book summary
- [x] Recent poems and books
- [x] Cache clear button
- [x] Admin route protection
- [x] Admin analytics page
- [x] Admin invite monitoring page
- [x] Add Users nav item
- [x] Add Subscribers nav item
- [x] Add Campaigns nav item
- [x] Consider moving admin navigation to a sidebar as modules grow
- [x] Make admin sidebar navigation sections collapsible (accordion behavior, allowing max 1-2 open groups simultaneously)
- [ ] Add global admin search
- [ ] Add admin activity/audit log

## Phase 17: Admin Content Management

- [x] Poems list with server-side pagination and publish/draft status badges
- [x] Create/edit/delete poems
- [x] Publish/unpublish poem toggle
- [x] Featured poem toggle with max 3 featured
- [x] Genre assignment in poem forms
- [x] Tag assignment in poem forms
- [x] Cover image field support
- [x] Font field support
- [x] Genres admin page
- [x] Create/edit/delete genres
- [x] Books list with server-side pagination
- [x] Create/edit/delete books
- [x] Book status management
- [x] Featured book toggle
- [x] Book cover, price, discount, and shipping fields
- [x] Audio list
- [x] Create/edit/delete audio
- [ ] Tag management admin page
- [ ] SEO fields in poem/book forms
- [ ] Poem/book/audio preview mode
- [ ] Bulk actions for publish/unpublish/tag
- [ ] Inventory/stock fields for books if needed

## Phase 18: Admin Orders

- [x] Orders list
- [x] Order status summary counts
- [x] Buyer details display
- [x] Shipping address display
- [x] Payment screenshot link
- [x] Update order status
- [x] Tracking provider/number/url fields
- [x] Admin notes
- [x] Order filters and search
- [ ] Export orders CSV
- [ ] Print packing slip / shipping label helper
- [ ] Buyer-facing order status page

## Phase 19: Admin Contacts & Moderation

- [x] Contact messages list
- [x] Unreplied messages badge in admin navigation
- [x] Reply note / replied tracking
- [x] Comment moderation hub
- [x] Cross-content comment moderation for poems, books, and audio
- [ ] Contact message search and filters
- [ ] Spam detection for contact form
- [ ] User-level moderation tools

## Phase 20: Growth, Invites & Analytics

- [x] Invite modal
- [x] Invite API route
- [x] Invite email sending
- [x] Daily invite limit
- [x] Lifetime invite limit
- [x] Suppressed email check
- [x] Invites admin monitoring page
- [x] Top inviters display
- [x] Attribution log API
- [x] Signup attribution API
- [x] Analytics dashboard
- [x] Clicks/signups by source table
- [x] Weekly invite/subscriber snapshot
- [x] Top shared poems
- [x] Track invite clicks and accepted signups end-to-end
- [ ] Add conversion funnel: visit -> signup -> subscribe -> order
- [ ] Add per-content analytics detail pages
- [ ] Add UTM/source builder for sharing links

## Phase 21: Performance, Reliability & Accessibility

- [x] Use next/image in major visual surfaces
- [x] Add error pages/global error handling
- [x] Add cache layer for homepage and book details
- [x] Add Vercel Analytics and Speed Insights
- [x] Respect prefers-reduced-motion in global CSS
- [x] Add basic rate limiting helper
- [x] Run production build locally and fix any issues
- [x] Run TypeScript check
- [x] Run lint check
- [x] Add automated tests for key flows
- [ ] Audit accessibility: keyboard navigation, focus states, ARIA, contrast
- [ ] Test mobile responsiveness across public and admin pages
- [ ] Lighthouse performance audit
- [ ] Review large client components and carousel motion performance
- [x] Handle undefined cached values gracefully during schema changes
- [ ] Improve cache invalidation after content edits

## Phase 22: Code Quality & Maintainability

- [x] Add Zod schemas for API and server action validation
- [x] Reduce duplication across poem/book/audio comment APIs
- [x] Reduce duplication across like APIs
- [x] Split large UI components where they have grown too complex
- [x] Add tests for orders, invites, auth roles, comments, and unsubscribe tokens
- [x] Standardize icon usage
- [x] Review manual SVGs and replace with consistent icon components where practical
- [ ] Add CI checks for typecheck, lint, and build

## Phase 23: Deployment & Production

- [x] Vercel-oriented config and scripts exist
- [x] Production migration deploy script exists
- [x] Environment variable examples exist
- [ ] Confirm production environment variables
- [ ] Configure custom domain
- [ ] Test production build locally
- [ ] Deploy to Vercel
- [ ] Verify auth callback URLs
- [ ] Verify email sending in production
- [ ] Verify database migrations in production
- [ ] Verify book order flow in production
- [ ] Verify admin access in production

## Phase 24: Legal, Trust & Launch

- [x] Privacy policy
- [x] Terms of use
- [x] Shipping/refund policy for books
- [x] Contact/support policy
- [x] Newsletter consent copy
- [ ] Final content review
- [ ] Final UI/UX review
- [ ] Cross-browser testing
- [x] Final SEO audit
- [ ] Launch checklist
- [ ] Launch

## Phase 25: Premium Story-Driven Author Page & Admin Controls

- [x] Design and implement dynamic story layout on the public `/about` page:
  - [x] Add "Why I Write" section focusing on the author's message and core drive
  - [x] Add "My Writing Journey" vertical timeline or narrative layout
  - [x] Add "My Inspiration" section highlighting elements of love, nature, life, and spirituality
  - [x] Add "Awards & Publications" credentials gallery
  - [x] Add "Interviews & Press" links/media embeds
  - [x] Add "Behind the Scenes" / "Writing Desk" personal section
  - [x] Add a collated Gallery of 6-8 images:
    - [x] Create a masonry-style auto-collating layout (auto-grouping portrait and landscape images into a unified stack rather than single lines)
- [x] Implement Admin Dashboard controls to manage the Author Page:
  - [x] Create content forms to edit story sections (Why I Write, Journey, Inspiration text blocks)
  - [x] Build a multi-image upload and arrangement utility for the Gallery, Behind the Scenes, and Writing Desk blocks
  - [x] Provide options to toggle/hide optional sections on demand
  - [x] Set up tests for custom gallery collation logic

## Highest Priority Next

1. Build subscriber signup and admin subscriber management.
2. Build campaign creation, preview, and sending.
3. Decide comment moderation policy and make behavior match admin wording.
4. Add public newsletter/signup CTAs on homepage and footer.
5. Add poem search.
6. Add reader account/profile pages.

## Phase 26: Newsletter Campaign Analytics & Tracking

- [x] **Extend Database Schema**:
  - Add tracking fields to the `CampaignDelivery` model:
    - `openedAt` (DateTime?) — tracks first open time
    - `openCount` (Int, default 0) — tracks total opens
  - Create a `CampaignClick` model to track links clicked:
    - Fields: `id`, `deliveryId` (relation to `CampaignDelivery`), `url` (String), `clickedAt` (DateTime)
- [x] **Implement Email Open Tracking**:
  - Create a transparent 1x1 tracking pixel API endpoint: `/api/campaigns/track/open/[deliveryId]/pixel.gif`.
  - When requested, record `openedAt` and increment `openCount` for the delivery, then return the pixel image binary with headers disabling browser caching.
  - Modify the email builder to inject this tracking pixel `<img>` tag at the bottom of the HTML message body.
- [x] **Implement Click Tracking Wrapper**:
  - Create a redirection wrapper API endpoint: `/api/campaigns/track/click?d=[deliveryId]&url=[targetUrl]`.
  - When clicked, log the link url and click time in the `CampaignClick` table, then perform a 302 redirect to the destination `targetUrl`.
  - Update the campaign parser to replace all raw anchor tags in the email content with formatted redirect tracking wrapper links.
- [x] **Enhance Admin Campaigns Dashboard**:
  - Build an analytics report view:
    - Displays overall KPIs: **Delivery Rate**, **Open Rate**, **Click-Through Rate (CTR)**.
    - Renders visual progress bars for quick ratio scanning.
    - Shows a table of "Top Clicked Links" with click frequencies.
  - Render an interactive delivery table:
    - Filter and search deliveries by email address.
    - Show status tags for each recipient: `Sent`, `Failed`, `Opened` (with badge counting views), and `Clicked Links` list.

## Phase 27: Reader Account & Library (Lean MVP)

Keep this phase focused on the everyday reader experience. Build on the existing likes,
saved content, comments, and orders rather than adding recommendations, achievements,
playlists, referrals, or account-export workflows yet.

- [x] Expand the authenticated reader dashboard at `/account`
- [x] Show basic profile information: name, email, member-since date, and account role
- [x] Show a compact activity summary: liked items, comments posted, and books purchased
- [x] Add a Library page/section with tabs for saved poems, saved books, and liked content
- [x] Let readers remove saved items from their library
- [x] Add a simple recently viewed list for poems and books
- [ ] Add a privacy setting to turn viewing-history tracking on or off, plus clear history
- [ ] Add a reader-facing order-history list with links to existing order details/status
- [ ] Add a reader comment-history list with links back to the original content

### Later (only after the MVP is in use)

- [ ] Reading position, progress, streaks, and monthly reading summaries
- [ ] Audio playback history, queues, and playlists
- [ ] Custom reading lists and pinned favorites
- [ ] Notification center and newsletter preference controls
- [ ] Personal recommendations and favorite genre/language preferences
- [x] CSS-only reader badges, calculated from existing reading and account activity
- [ ] Referrals, personal-data export, and account deletion
- [ ] Reader engagement analytics for admins

## Phase 28: Homepage Overhaul

Restructure the Homepage layout to remove the hero carousel dependency and focus on answering "Why should I read this author?" immediately.

- [x] Implement the following structured layout sequence:
  - [x] **Hero**: Introducing Renu's writer identity and value proposition clearly (without slideshow tabs)
  - [x] **Featured Book**: Highlighting a prominent book card with primary call-to-action
  - [x] **Latest Poem**: Direct display of recent poetry excerpt, translation tags, and links
  - [x] **Listen to a Poem**: Compact play widget or trigger link to spoken-word recordings page
  - [x] **About the Author**: Engaging mini-biography section previewing Renu's journey
  - [ ] **Reader Reviews**: Testimonial reviews showcase carousel or card grids
  - [ ] **Instagram Feed**: Curated photo grid of social updates
  - [ ] **Newsletter**: Distinct subscription form cards
  - [ ] **Footer**: Clear, structured legal and explore navigation footer

## Phase 29: Admin Analytics Overhaul

Enhance the `/admin/analytics` dashboard to track sales, audience growth, and creative engagement using a multi-tab interface.

- [x] **Tabbed Navigation**: Implement client-side tabs for "Audience & Growth", "Sales & Orders", and "Content Engagement".
- [x] **Sales & Orders Tab**:
  - [x] Query and calculate total sales revenue (sum of paid orders).
  - [x] Calculate total copies of books sold.
  - [x] Display active order queue count.
  - [x] Render visual progress bar leaderboard of sales per book.
  - [x] List recent 5 orders with order number, copies, status tag, and total amount.
- [x] **Content Engagement Tab**:
  - [x] Aggregate and list top-performing spoken audio recordings (stream/view counts).
  - [x] List top poems ranked by reader likes and approved comments count.
- [x] **Audience & Growth Tab**:
  - [x] Integrate existing attribution table and growth snapshot metrics.
  - [x] Display invite-to-signup conversion rates.

## Phase 30: Printable Poem Cards & Dedication Gifting

Give readers a way to turn any poem into a personal, giftable keepsake — a
free, instantly generated print-ready PDF card, distinct from the physical
print-on-demand shop idea. The dedication step is what makes this feel
special rather than being a generic "download as PDF" button.

- [x] **Extend Database Schema**:
  - Create a `PrintCard` model to log generated cards (for abuse monitoring
    and lightweight analytics, not for storing the PDF itself):
    - Fields: `id`, `poemId` (relation to `Poem`), `dedicatedTo` (String?),
      `fromName` (String?), `message` (String?, capped length),
      `createdAt`, `ipHash` (String, for rate-limit/abuse auditing only)
  - Add a `downloadCount` integer field (default 0) to the `Poem` model to
    store the total number of times a poem has been generated/printed as a card
  - Add an index on `poemId` to support a "most gifted poems" admin view later

- [x] **Dedication Form & Flow**:
  - Add a "🖨 Print as a Card" action alongside Like/Save/Share/Invite on
    the poem detail sidebar
  - Build a modal/form with: dedication name ("For ___"), from name
    (optional), and a short personal message (~100 char cap)
  - Run the message field through the existing `checkCommentTone` guard
    before accepting it, same pattern used for comments
  - Make all fields optional — a reader can generate a plain, undecorated
    card with no dedication at all

- [x] **PDF Generation**:
  - Add a `POST /api/poems/[slug]/print-card` route that accepts the
    optional dedication fields and returns a generated PDF
  - Atomically increment the `downloadCount` field on the corresponding
    `Poem` record upon successful creation of the `PrintCard` log
  - Choose a serverless-friendly PDF library (e.g. `@react-pdf/renderer`)
    that doesn't require a headless browser, to stay compatible with
    Vercel's function constraints
  - Rate limit the route more strictly than typical API routes given PDF
    generation cost (e.g. `rateLimit("print-card", 8, 3600000)` — 8/hour)

- [x] **Card Layout & Design**:
  - Design a bright, warm, print-friendly template (not the site's dark
    theme — this is meant to be read on paper) using the site's existing
    amber/cream palette and Playfair Display heading font
  - Reuse existing multilingual font handling so Hindi/Marathi poems render with correct Devanagari typography (`NotoSansDevanagari`)
  - Render the dedication line (if provided) in a distinct, card-like
    inscription style, separate from the poem itself
  - Add a small, tasteful site watermark (URL or wordmark) in a corner
  - Fix card dimensions to standard A5 Portrait keepsake proportions so it prints cleanly on a standard home printer without cropping
  - Added expressive SVG vector line art motifs floating above the footer line (Quill, Mountain Peaks with Moon, Botanical Rose)

- [x] **Admin Visibility**:
  - Add a lightweight "Cards Generated" count to the per-poem admin view
    or the analytics dashboard, sourced from the `PrintCard` model
  - Surface a simple "most gifted poems" list, mirroring the existing
    "top shared poems" pattern from Phase 20

- [x] **Interactive Live Preview & Multi-Theme Customization**:
  - [x] Multiple template/theme choices for the printed card (Classic Sanctuary, Minimalist Solitude, Romantic Rose)
  - [x] Real-time live card preview in modal
  - [x] Fixed Devanagari (Hindi / Marathi) PDF font shaping by enabling `@pdf-lib/fontkit`'s OpenType Indic state machine with `regenerator-runtime`
  - [x] Instant client-side 2.5x Retina PNG Image export (`html-to-image`) for WhatsApp & social media sharing
  - [x] Segmented export format selector (PNG Image vs PDF Card) with unified hero action bar
  - [x] Aligned sidebar action buttons with canonical Amber/Gold site design system

## Phase 31: Codebase Architecture & Technical Debt Refactoring

Based on the architecture audit, the following technical debt and structure issues need to be addressed to ensure maintainability.

- [ ] **Split God-Files**:
  - [ ] Break down `src/lib/email.ts` (834 lines) into a dedicated `src/lib/email/` directory with separate files for shell, auth, orders, and campaigns.
  - [ ] Break down `src/app/page.tsx` (659 lines) by extracting sections (hero, featured, audio) into `src/components/home/`.
  - [ ] Break down `src/components/admin/analytics-tabs.tsx` (671 lines) into individual tab components (`OverviewTab`, `EngagementTab`, etc.).
  - [ ] Break down `src/components/poems/print-card-modal.tsx` (496 lines) by extracting themes, preview, and export logic.
  - [ ] Break down `src/components/books/purchase-form.tsx` (~400 lines) by extracting wizard steps (address, payment, confirmation).
- [x] **Reorganize Utilities**:
  - [x] Create structured subdirectories inside `src/lib/` (e.g., `auth/`, `db/`, `email/`, `moderation/`, `api-helpers/`).
- [x] **Admin Actions Refactoring**:
  - [x] Move the 14 loose server action files in `src/app/admin/` into a dedicated `src/app/admin/actions/` directory to clean up the route tree.
- [ ] **UI Component Optimization**:
  - [ ] Extract the repeated glassmorphic card styling into a reusable `<GlassCard>` component.
  - [ ] Add `loading.tsx` skeleton states for data-heavy pages (home, poems, books, admin analytics).
  - [ ] Remove trivial wrapper components (e.g., `components/poems/like-button.tsx`, `components/books/like-button.tsx`, `comment-section.tsx`) and import directly from `@/components/ui`.
- [ ] **Testing Scope Expansion**:
  - [ ] Update `vitest.config.ts` to include all `src/` files in coverage reporting (excluding `generated` and `types`), rather than just a hardcoded list of 10 files.
- [ ] **Error Handling & Resilience**:
  - [ ] Add per-route error boundaries (`error.tsx`) for `/admin`, `/poems`, and `/books`.
- [ ] **Types Formalization**:
  - [ ] Move scattered shared domain types (e.g., `HomepageCacheData`, `CommentType`, `LikeType`, theme types) into the central `src/types/` directory.
- [ ] **Business Logic Separation (Service Layer)**:
  - [ ] Introduce a `src/services/` layer for complex domains (`poem-service.ts`, `order-service.ts`, `campaign-service.ts`) to move business logic out of route handlers and server actions.
