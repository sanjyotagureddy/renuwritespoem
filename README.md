# Renu Writes Poem

A modern author website for a poet and book author — built for readers, optimized for discovery, and designed for long-term AI-assisted development.

## Vision

Create a beautiful, accessible, and SEO-optimized platform where a poet can publish their work, engage with readers, and grow their audience through newsletters and curated collections.

## Technology Stack

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| Framework      | Next.js 15 (App Router)             |
| Language       | TypeScript                          |
| Styling        | Tailwind CSS                        |
| Components     | shadcn/ui                           |
| Authentication | Auth.js (Google OAuth & Credentials)|
| Database       | PostgreSQL (Supabase)               |
| ORM            | Prisma                              |
| Email          | Gmail SMTP / Nodemailer             |
| Deployment     | Vercel                              |

## Features & Capabilities

### Public Reader Features
- **Poetry Sanctuary**: Rich visual layout supporting English, Hindi, and Marathi fonts, genres, tags, reading times, and PostgreSQL full-text search.
- **Audio Recitations**: Custom client-side player for listening to poem readings voiced by the author.
- **Book Bookstore**: Interactive book catalog featuring discounts, direct order placement, payment screenshot uploads, and courier tracking details.
- **Reader Engagement**: Interactive likes, comments, nested threads, and personal dashboard sections for liked content and order tracking.
- **Growth & Referral system**: Invite-a-friend system allowing users to invite readers with attribution click logs.
- **Newsletter Subscription**: Direct subscription forms with email verification and unsubscribe preferences.

### Admin Dashboard Modules
- **Overview Analytics**: Dynamic dashboard showing user activity, subscriber charts, popular content views, and order volumes.
- **Content CRUD Management**: Full lifecycle management (drafting, editing, publishing) for Poems, Books, Genres, and Audio tracks.
- **Comment Moderation Hub**: A single, clean review panel to approve, reject, pin, or delete comments across all media.
- **Subscribers & Campaign broadcasting**: Lists newsletter signups, handles manual actions, exports to CSV, and drafts/broadcasts rich newsletter campaigns.
- **Orders Panel**: Verifies payment screenshots, sets shipping status (Pending, Confirmed, Shipped, Delivered), and manages courier tracking URLs.
- **Inbox Inbox**: Central contact log with AI-assisted email response helpers.

## Architecture Overview

This is a **monolithic Next.js application** deployed as a single unit on Vercel.

- **Server Components** for SEO-critical content pages
- **Server Actions** for mutations
- **Route Handlers** for webhook integrations
- **Prisma** for direct database access (no repository pattern)
- **Zod** for runtime validation
- **Feature-based folder organization**

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture documentation.

## Local Development

### Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL (or Neon database URL)

### Setup

```bash
# Clone the repository
git clone https://github.com/your-org/renuwritespoem.git
cd renuwritespoem

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Apply database migrations
npm run db:migrate

# Seed development data
npm run db:seed

# Start development server
npm run dev
```

### Local Docker Database (Optional)

If you do not want to depend on cloud PostgreSQL during development, run a local database with Docker:

```bash
# Start local Postgres
npm run db:local:up

# Create/apply migration
npm run db:migrate -- --name init

# Seed sample data
npm run db:seed
```

Stop it with:

```bash
npm run db:local:down
```

### Environment Variables

```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
AUTH_SECRET=...
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
ADMIN_EMAILS=admin@example.com
NEXTAUTH_URL=http://localhost:3000
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
FROM_EMAIL=your-gmail@gmail.com
ADMIN_EMAIL=orders-and-contact@example.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For local development, set `DATABASE_URL` and `DIRECT_URL` in `.env.local` to
the Docker URL from `.env.example`. These local-only values override any
Supabase integration variables.

Email is sent through Gmail SMTP using an app password, not your normal Gmail
login password. If you change the sending account later, update the Gmail email
and app password in Vercel, then redeploy.

For Google OAuth, add this exact authorized redirect URI in the Google Cloud
console (replace the origin in production):

```text
http://localhost:3000/api/auth/callback/google
```

## Deployment

The application deploys to **Vercel** via Git push to `main`.

- Preview deployments on pull requests
- Production deployment on merge to `main`
- Database hosted on Supabase PostgreSQL
- Environment variables managed in Vercel dashboard
- Production builds run pending Prisma migrations before Next.js builds;
  preview deployments do not change the database schema

Required production environment variables include:

```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
AUTH_SECRET=...
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
ADMIN_EMAILS=admin@example.com
NEXTAUTH_URL=https://your-domain.example
NEXT_PUBLIC_SITE_URL=https://your-domain.example
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
FROM_EMAIL=your-gmail@gmail.com
ADMIN_EMAIL=orders-and-contact@example.com
```

`DIRECT_URL` is preferred for migrations. If your database provider presents a
self-signed certificate chain, the migration deploy script handles that during
Vercel builds.

## Project Documentation

| Document                                             | Purpose                              |
| ---------------------------------------------------- | ------------------------------------ |
| [docs/AI_CONTEXT.md](docs/AI_CONTEXT.md)             | Primary context for AI coding agents |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)         | System architecture and diagrams     |
| [docs/DECISIONS.md](docs/DECISIONS.md)               | Architectural Decision Records       |
| [docs/CODING_STANDARDS.md](docs/CODING_STANDARDS.md) | Code style and conventions           |
| [docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md) | Project layout guide                 |
| [docs/ROADMAP.md](docs/ROADMAP.md)                   | Development phases and milestones    |

## Contribution Guidelines

1. Create a feature branch from `main`
2. Follow the coding standards in [docs/CODING_STANDARDS.md](docs/CODING_STANDARDS.md)
3. Write meaningful commit messages (conventional commits)
4. Open a pull request using the PR template
5. Ensure all checks pass before requesting review

### Commit Convention

```
feat: add poem listing page
fix: correct newsletter subscription validation
docs: update architecture diagram
chore: upgrade dependencies
```

## License

Private — All rights reserved.
