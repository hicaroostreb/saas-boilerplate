# SaaS Boilerplate Enterprise Monorepo

This is a **Turborepo monorepo** for building SaaS applications with modular packages for authentication, payments, and database management. Built with **Next.js 15**, **Stripe**, and **PostgreSQL**.

## Features

- 🏗️ **Monorepo architecture** with Turborepo for scalable development
- 🔐 **Modular authentication** package with Auth.js v5
- 💳 **Stripe payments** package with subscriptions support
- 🗄️ **Database package** with Drizzle ORM and PostgreSQL
- 👥 **Multi-tenancy** with organizations and role-based access control
- 📊 **Activity logging** system for user events
- 🎯 **Type-safe** with TypeScript across all packages
- 🔄 **Smart seeding** system (idempotent database setup)
- ✅ **Enterprise quality** - 0 lint errors, production ready

## Architecture

```
saas-boilerplate/
├── packages/
│   ├── @workspace/auth          # Authentication logic and middleware
│   ├── @workspace/billing       # Stripe integration and billing
│   ├── @workspace/database      # Database schema, migrations, and queries
│   ├── @workspace/ui            # Shared UI components
│   ├── @workspace/common        # Shared utilities and types
│   ├── @workspace/routes        # Route definitions
│   └── tooling/
│       ├── eslint-config        # Enterprise ESLint configuration
│       ├── prettier-config      # Code formatting standards
│       ├── tailwind-config      # Design system configuration
│       ├── typescript-config    # TypeScript configurations
│       └── requirements-check   # Setup validation tool
└── apps/
    ├── dashboard/               # Main SaaS application (Port 3001)
    └── marketing/               # Landing page (Port 3000)
```

## Tech Stack

- **Monorepo**: [Turborepo](https://turbo.build/)
- **Framework**: [Next.js 15](https://nextjs.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) + [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [Auth.js v5](https://authjs.dev/)
- **Payments**: [Stripe](https://stripe.com/)
- **Package Manager**: [pnpm](https://pnpm.io/)

## Getting Started

```bash
git clone <your-repo-url>
cd saas-boilerplate
```

### Automated Setup (Recommended)

Use the included setup script to configure everything automatically:

```bash
node scripts/setup.js
```

The setup script will guide you through:

1. **Prerequisites Check** - Validates Node.js 18+, pnpm, Docker
2. **Stripe CLI Setup** - Checks installation and authentication
3. **Database Setup** - Local Docker PostgreSQL or remote database
4. **Stripe Integration** - Secret key input and webhook creation
5. **Environment Configuration** - Auto-generates `.env.local`
6. **Monorepo Build** - Installs dependencies and builds packages
7. **Database Schema** - Generates, pushes schema, and seeds data
8. **Quality Validation** - Runs lint, type-check, and format checks

### Manual Setup

If you prefer manual setup:

```bash
# 1. Install dependencies
pnpm install

# 2. Check requirements
pnpm check:requirements

# 3. Build packages in order
pnpm --filter "@workspace/database" run build
pnpm --filter "@workspace/auth" run build
pnpm --filter "@workspace/ui" run build
pnpm --filter "@workspace/billing" run build

# 4. Setup database
pnpm --filter "@workspace/database" run push
pnpm --filter "@workspace/database" run seed

# 5. Start development
pnpm turbo dev
```

## Prerequisites

Before setup, ensure you have:

- **Node.js 18+** - JavaScript runtime
- **pnpm** - Package manager (`npm install -g pnpm`)
- **Docker** - For local PostgreSQL (optional)
- **Stripe CLI** - For webhook handling (`https://docs.stripe.com/stripe-cli`)

## Running Locally

After setup, start the development servers:

```bash
pnpm turbo dev
```

- **Marketing**: http://localhost:3000 (Landing page)
- **Dashboard**: http://localhost:3001 (Main SaaS app)

## Default Credentials

After setup, use these test credentials:

- **Email**: `test@test.com`
- **Password**: `admin123`

## Development Commands

```bash
# Start development servers
pnpm turbo dev

# Build all packages
pnpm turbo build

# Run quality checks (enterprise-grade)
pnpm turbo lint        # 0 errors, 0 warnings
pnpm turbo type-check  # 100% TypeScript validation
pnpm turbo format      # Auto-format code

# Database operations
pnpm --filter "@workspace/database" run generate  # Generate migrations
pnpm --filter "@workspace/database" run push      # Push schema changes
pnpm --filter "@workspace/database" run seed      # Seed test data
pnpm --filter "@workspace/database" run studio    # Open database studio

# Package-specific commands
pnpm --filter "@workspace/auth" run build
pnpm --filter "@workspace/ui" run dev
pnpm --filter "@workspace/requirements-check" run check
```

## Testing Stripe Payments

Use the following test card details:

- **Card Number**: `4242 4242 4242 4242`
- **Expiration**: Any future date
- **CVC**: Any 3-digit number

## Local Stripe Webhooks

The setup script automatically configures webhooks, or run manually:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Database Schema

The database includes tables for:

- **Users** - Authentication and user profiles
- **Organizations** - Multi-tenant organization structure
- **Members** - Role-based organization membership
- **Activity Logs** - User action tracking and audit trails
- **Invitations** - Organization invitation system
- **Stripe Integration** - Customer, subscription, and product data

## Package Details

### `@workspace/database`
- Drizzle ORM configuration with PostgreSQL
- Database schema definitions and relations
- Migration scripts and seed data
- Reusable queries and database utilities

### `@workspace/auth`
- Auth.js v5 configuration and providers
- Authentication middleware and session management
- Protected route utilities and role validation
- User registration and login flows

### `@workspace/billing`
- Stripe API integration and webhook handling
- Subscription management and billing logic
- Payment flow utilities and checkout sessions
- Customer portal and invoice management

### `@workspace/ui`
- Shared UI components with Tailwind CSS
- Form components with validation
- Consistent design system
- shadcn/ui integration

### `@workspace/common`
- Shared TypeScript types and utilities
- Validation schemas with Zod
- Error handling and formatting utilities
- Constants and configuration

## Going to Production

### Environment Variables

Set these in your production environment:

```env
DATABASE_URL="your-production-postgres-url"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="production-secret-key"
AUTH_SECRET="production-secret-key"
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_production_webhook"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NEXT_PUBLIC_APP_NAME="Your SaaS Name"
```

### Deployment Steps

1. **Set up production database** (PostgreSQL on Vercel, Supabase, etc.)
2. **Configure Stripe production webhooks** with your domain
3. **Deploy to your platform** (Vercel, Railway, Fly.io, etc.)
4. **Run database setup** in production:
   ```bash
   pnpm --filter "@workspace/database" run push
   pnpm --filter "@workspace/database" run seed
   ```

## Enterprise Quality

This monorepo maintains enterprise-grade quality standards:

- ✅ **Zero lint errors** with strict ESLint configuration
- 🎯 **100% type safety** with strict TypeScript
- 📐 **Consistent formatting** with Prettier
- 🔍 **Automated validation** with requirements check
- 🚀 **Production ready** with optimized builds

## Contributing

This boilerplate follows these principles:

- 📝 **Conventional commits** for clear changelog
- 🧪 **Test coverage** for critical paths
- 📚 **Documentation** for all public APIs
- 🔍 **Type safety** with strict TypeScript
- ✅ **Quality gates** - All checks must pass

## License

MIT License - feel free to use this boilerplate for your SaaS projects!

***

**Built with ❤️ using Turborepo for scalable SaaS development**