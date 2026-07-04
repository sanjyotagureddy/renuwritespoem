# Renu Writes Poem

A modern author website for a poet and book author — built for readers, optimized for discovery, and designed for long-term AI-assisted development.

## Vision

Create a beautiful, accessible, and SEO-optimized platform where a poet can publish their work, engage with readers, and grow their audience through newsletters and curated collections.

## Technology Stack

| Layer          | Technology              |
| -------------- | ----------------------- |
| Framework      | Next.js 15 (App Router) |
| Language       | TypeScript              |
| Styling        | Tailwind CSS            |
| Components     | shadcn/ui               |
| Authentication | Auth.js (Google OAuth)  |
| Database       | PostgreSQL (Neon)       |
| ORM            | Prisma                  |
| Email          | Gmail SMTP / Nodemailer |
| Deployment     | Vercel                  |

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
- Database hosted on Neon (serverless PostgreSQL)
- Environment variables managed in Vercel dashboard
- `npm run build` runs pending Prisma migrations before Next.js builds

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
