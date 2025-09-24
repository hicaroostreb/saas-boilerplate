# SaaS Boilerplate Monorepo

This is a **Turborepo monorepo** for building SaaS applications with modular packages for authentication, payments, and database management. Built with **Next.js**, **Stripe**, and **PostgreSQL**.

## Features

- 🏗️ **Monorepo architecture** with Turborepo for scalable development
- 🔐 **Modular authentication** package with NextAuth.js
- 💳 **Stripe payments** package with subscriptions support
- 🗄️ **Database package** with Drizzle ORM and PostgreSQL
- 👥 **Multi-tenancy** with teams and role-based access control
- 📊 **Activity logging** system for user events
- 🎯 **Type-safe** with TypeScript across all packages
- 🔄 **Smart seeding** system (idempotent database setup)

## Architecture

```
saas-boilerplate/
├── packages/
│   ├── @your-org/db          # Database schema, migrations, and queries
│   ├── @your-org/auth        # Authentication logic and middleware  
│   └── @your-org/payments    # Stripe integration and billing
└── apps/                     # Future Next.js applications
```

## Tech Stack

- **Monorepo**: [Turborepo](https://turbo.build/)
- **Framework**: [Next.js 15](https://nextjs.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) + [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [NextAuth.js v4](https://next-auth.js.org/)
- **Payments**: [Stripe](https://stripe.com/)
- **Package Manager**: [pnpm](https://pnpm.io/)

## Getting Started

```bash
git clone <your-repo-url>
cd saas-boilerplate
pnpm install
```

## Running Locally

[Install](https://docs.stripe.com/stripe-cli) Stripe CLI and log in to your Stripe account:

```bash
stripe login
```

Use the included setup script to create your `.env.local` file:

```bash
pnpm db:setup
```

Run the database migrations and seed the database with a default user and team:

```bash
pnpm db:migrate
pnpm db:seed
```

This will create the following user and team:

- **User**: `test@test.com`
- **Password**: `admin123`

You can also create new users through the `/sign-up` route when you add a Next.js application.

## Default Credentials

After setup, you can use these test credentials:

- **Email**: `test@test.com`
- **Password**: `admin123`

## Development Commands

```bash
# Complete setup (alternative to individual commands)
pnpm run setup

# Build all packages
pnpm run build

# Run linting
pnpm run lint

# Format code
pnpm run format

# Database operations
pnpm db:migrate    # Apply schema changes
pnpm db:seed       # Populate test data

# Package-specific commands
pnpm --filter @your-org/db run build
pnpm --filter @your-org/auth run lint
pnpm --filter @your-org/payments run test
```

## Testing Stripe Payments

To test Stripe payments, use the following test card details:

- **Card Number**: `4242 4242 4242 4242`
- **Expiration**: Any future date
- **CVC**: Any 3-digit number

## Local Stripe Webhooks

You can listen for Stripe webhooks locally through their CLI to handle subscription change events:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Database Schema

The database includes tables for:

- **Users** - Authentication and user profiles with role-based permissions
- **Teams** - Multi-tenant organization structure with Stripe integration
- **Team Members** - Role-based team membership (owner, member)
- **Activity Logs** - User action tracking and audit trails
- **Invitations** - Team invitation system with email notifications
- **Stripe Integration** - Customer, subscription, and product data

## Package Details

### `@your-org/db`
- Drizzle ORM configuration with PostgreSQL
- Database schema definitions and relations
- Migration scripts and seed data
- Reusable queries and database utilities

### `@your-org/auth`  
- NextAuth.js configuration and providers
- Authentication middleware and session management
- Protected route utilities and role validation
- User registration and login flows

### `@your-org/payments`
- Stripe API integration and webhook handling
- Subscription management and billing logic
- Payment flow utilities and checkout sessions
- Customer portal and invoice management

## Project Structure Philosophy

This monorepo follows **domain-driven design**:

- 🔍 **Separation of concerns** - Each package handles a specific domain
- 🔄 **Reusability** - Packages can be extracted to separate repositories
- 🛡️ **Type safety** - Shared types across packages prevent integration errors
- 📦 **Independent deployment** - Packages can be published independently

## Adding New Applications

To add a Next.js app that uses these packages:

```bash
# Create new app in apps/ directory
cd apps/
npx create-next-app@latest your-app-name

# Add package dependencies to package.json
{
  "dependencies": {
    "@your-org/db": "workspace:*",
    "@your-org/auth": "workspace:*", 
    "@your-org/payments": "workspace:*"
  }
}
```

## Going to Production

When you're ready to deploy your SaaS application to production, follow these steps:

### Set up a production Stripe webhook

1. Go to the Stripe Dashboard and create a new webhook for your production environment.
2. Set the endpoint URL to your production API route (e.g., `https://yourdomain.com/api/stripe/webhook`).
3. Select the events you want to listen for (e.g., `checkout.session.completed`, `customer.subscription.updated`).

### Environment Variables

Set these in your production environment:

```env
DATABASE_URL="your-production-postgres-url"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="production-secret-key"
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_production_webhook"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NEXT_PUBLIC_APP_NAME="Your SaaS Name"
```

### Deployment Steps

1. **Set up production database** (PostgreSQL on Vercel, Supabase, or similar)
2. **Configure Stripe production webhooks** with your domain
3. **Deploy to your platform** (Vercel, Railway, Fly.io, etc.)
4. **Run migrations** in production:
   ```bash
   pnpm db:migrate
   ```

## Contributing

This boilerplate follows these principles:

- 📝 **Conventional commits** for clear changelog
- 🧪 **Test coverage** for critical paths  
- 📚 **Documentation** for all public APIs
- 🔍 **Type safety** with strict TypeScript

## License

MIT License - feel free to use this boilerplate for your SaaS projects!

***

**Built with ❤️ using Turborepo for scalable SaaS development**