<div align="center">
  <h1>⚡ Fastbreak Event Dashboard</h1>
  <p><strong>Enterprise-Grade Sports Event Management Platform</strong></p>
  <p>
    <a href="#features">Features</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#documentation">Documentation</a> •
    <a href="#deployment">Deployment</a>
  </p>
</div>

---

## 📋 Overview

**Fastbreak Event Dashboard** is a modern, full-stack sports event management application designed for teams, organizations, and venues to streamline event planning and coordination. Built with enterprise-grade technologies, it offers a seamless user experience with robust security and scalability.

### 🎯 Key Highlights

- **Modern Stack** - Next.js 15, TypeScript, Supabase, and Drizzle ORM
- **Production Ready** - Type-safe APIs, comprehensive testing, and optimized builds
- **Secure by Design** - Row-level security, authentication, and protected routes
- **Developer Experience** - Excellent DX with hot reload, type safety, and automated linting
- **Cloud Native** - Deployed on Vercel with automatic scaling and global CDN

---

## ✨ Features

### Core Functionality
- 🎫 **Event Management** - Complete CRUD operations for sports events
- 🏟️ **Multi-Venue Support** - Manage multiple venues per event with detailed location data
- 🔍 **Smart Search & Filtering** - Real-time search and filter by sport type
- 🌍 **Event Discovery** - Integration with external sports APIs (ESPN, TheSportsDB)
- 📅 **Calendar View** - Interactive calendar display for event scheduling
- 📥 **Export Capabilities** - Export events to ICS format for calendar apps

### Authentication & Security
- 🔐 **Secure Authentication** - Email/password and Google OAuth via Supabase
- 👤 **User Isolation** - Row-level security ensures data privacy
- 🛡️ **Protected Routes** - Automatic authentication middleware
- 🔑 **Session Management** - Secure cookie-based sessions

### Developer Features
- 🎨 **Modern UI** - Responsive design with Tailwind CSS and Shadcn/ui components
- ⚡ **Server Actions** - Type-safe server actions with Zod validation
- 🔄 **Real-time Updates** - Automatic cache revalidation
- 🧪 **Type Safety** - End-to-end TypeScript with strict mode
- 🪝 **Git Hooks** - Pre-commit linting with Husky
- 📊 **Database Studio** - Drizzle Studio for visual database management

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 15 (App Router, React Server Components) |
| **Language** | TypeScript 5.x (Strict Mode) |
| **Database** | Supabase PostgreSQL |
| **ORM** | Drizzle ORM |
| **Authentication** | Supabase Auth |
| **Styling** | Tailwind CSS 3.x |
| **UI Components** | Shadcn/ui + Radix UI |
| **Forms** | React Hook Form + Zod |
| **Deployment** | Vercel (Edge Network) |
| **CI/CD** | GitHub Actions (via Vercel) |

---

## 🚀 Quick Start

Get up and running in under 5 minutes:

### Prerequisites

- Node.js 18+ and npm
- [Supabase](https://supabase.com) account (free tier available)
- (Optional) Google OAuth credentials for social login

### Installation

```bash
# Clone the repository
git clone https://github.com/4cecoder/sports.git
cd sports

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Initialize git hooks
npm run prepare
```

### Environment Configuration

Update `.env.local` with your credentials:

```env
# Supabase (Get from: https://app.supabase.com → Project Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJxxxxx
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# Optional: Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
```

### Database Setup

1. **Create Supabase Project**
   - Visit [database.new](https://database.new)
   - Create a new project and wait for provisioning

2. **Run Migrations**
   - Navigate to Supabase Dashboard → SQL Editor
   - Copy contents of `drizzle/0000_init.sql`
   - Paste and execute

3. **Verify Setup**
   ```bash
   npm run db:studio
   ```
   This opens Drizzle Studio to browse your database.

### Launch Application

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and create your first event! 🎉

---

## 📁 Project Structure

```
sports/
├── app/                          # Next.js App Router
│   ├── auth/                     # Authentication pages (sign-in, sign-up)
│   ├── dashboard/                # Main event dashboard
│   ├── discover/                 # External event discovery
│   └── layout.tsx                # Root layout with theme provider
│
├── components/                   # React components
│   ├── events/                   # Event management components
│   │   ├── event-card.tsx        # Individual event display
│   │   ├── event-form-dialog.tsx # Create/edit event modal
│   │   └── delete-event-dialog.tsx
│   └── ui/                       # Shadcn UI components (auto-generated)
│
├── lib/                          # Core business logic
│   ├── actions/                  # Server Actions (type-safe API)
│   │   ├── action-helpers.ts     # Generic action wrappers
│   │   ├── event-actions.ts      # Event CRUD operations
│   │   └── external-events.ts    # External API integrations
│   ├── db/
│   │   ├── index.ts              # Drizzle client instance
│   │   └── schema.ts             # Database schema & types
│   └── supabase/                 # Supabase clients (server, client, middleware)
│
├── drizzle/                      # Database migrations
├── docs/                         # Documentation (see below)
└── public/                       # Static assets
```

---

## 📚 Documentation

Comprehensive documentation is available in the `docs/` folder:

| Document | Description |
|----------|-------------|
| **[Architecture Guide](docs/ARCHITECTURE.md)** | System design, data flow, and component architecture |
| **[Setup Guide](docs/SETUP.md)** | Quick 5-minute setup instructions |
| **[Deployment Guide](docs/DEPLOYMENT.md)** | Production deployment checklist |
| **[Contributing Guidelines](docs/CONTRIBUTING.md)** | Code standards and development patterns |
| **[Troubleshooting](docs/TROUBLESHOOTING.md)** | Common issues and solutions |
| **[API Integration](docs/SPORTS_API_INTEGRATION.md)** | External sports API documentation |
| **[Database Migrations](docs/DATABASE_MIGRATION.md)** | Schema changes and migration workflow |

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/4cecoder/sports)

**Manual Deployment:**
```bash
# 1. Push to GitHub
git push origin main

# 2. Import to Vercel
# Visit https://vercel.com/new and select your repository

# 3. Configure Environment Variables
# Add the following in Vercel Dashboard → Settings → Environment Variables:
#   - NEXT_PUBLIC_SUPABASE_URL
#   - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
#   - DATABASE_URL
#   - NEXT_PUBLIC_GOOGLE_CLIENT_ID (optional)
#   - GOOGLE_CLIENT_SECRET (optional)

# 4. Deploy
```

**Quick Vercel Setup Script:**
```bash
./setup-vercel-env.sh  # Automatically sets environment variables
```

### Post-Deployment Checklist

- [ ] Update Google OAuth redirect URIs with production domain
- [ ] Update Supabase authentication redirect URLs
- [ ] Verify database migrations are applied
- [ ] Test authentication flow in production
- [ ] Check environment variables are loaded correctly

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

---

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start dev server with Turbopack (hot reload)
npm run build            # Production build (test before deploying)
npm run start            # Start production server locally
npm run lint             # Run ESLint

# Database Management
npm run db:generate      # Generate migrations from schema changes
npm run db:push          # Push schema directly to DB (dev only)
npm run db:studio        # Open Drizzle Studio (visual DB browser)
npm run db:migrate       # Apply migrations to production

# Utilities
npm run prepare          # Install Husky git hooks (runs automatically)
```

---

## 🏗️ Architecture Highlights

### Server-First Design
This application uses **Server Actions exclusively** instead of traditional API routes:

```typescript
// Type-safe server action with automatic validation
export const createEvent = createAuthenticatedAction(
  CreateEventSchema,  // Zod schema
  async (input, userId) => {
    // userId automatically verified
    // input automatically validated
    const [event] = await db.insert(events).values({
      ...input,
      userId,
    }).returning();

    revalidatePath('/dashboard');
    return event;
  }
);
```

**Benefits:**
- ✅ End-to-end type safety
- ✅ Automatic input validation
- ✅ Consistent error handling
- ✅ Built-in cache revalidation

### Database Schema

**Key Tables:**

**`events`**
- Primary event data (name, sport type, date, description)
- Linked to user via `user_id` (foreign key to `auth.users`)
- External API integration fields (`externalSource`, `externalId`)

**`venues`**
- One-to-many relationship with events
- Cascade delete when parent event is removed
- Complete location data (address, city, state, country)

**Security:**
- Row Level Security (RLS) policies enforce user isolation
- Users can only access their own events
- All queries are automatically scoped by authentication

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for complete details.

---

## 🤝 Contributing

We welcome contributions! Please see [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for:

- Code style guidelines
- Development workflow
- Pull request process
- Testing requirements

---

## 🐛 Troubleshooting

**Common Issues:**

| Issue | Solution |
|-------|----------|
| Database connection errors | Check DATABASE_URL format, ensure Supabase project is active |
| "Unauthorized" errors | Verify `.env.local` credentials, check RLS policies exist |
| Build failures | Clear `.next/` cache, reinstall `node_modules` |
| OAuth not working | Update redirect URIs in Google Console and Supabase |

See [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for detailed solutions.

---

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

## 🙏 Acknowledgments

Built with amazing open-source tools:

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend-as-a-Service
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Vercel](https://vercel.com/) - Deployment platform

---

<div align="center">
  <p>Made with ⚡ by <a href="https://github.com/4cecoder">4cecoder</a></p>
  <p><strong>Fastbreak Event Dashboard</strong> - Enterprise Sports Event Management</p>
</div>
