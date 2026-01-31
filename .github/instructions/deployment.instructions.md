---
applyTo: "package.json,next.config.js,netlify.toml,.github/**/*.yml,.github/**/*.yaml"
---

# Deployment Instructions

This file provides guidance for building, testing, and deploying the CNC Tools application.

## Build Process

### Development Build

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server locally
npm run start
```

### Build Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
	// Enable experimental features if needed
	experimental: {
		appDir: true,
	},

	// Configure image domains for external images
	images: {
		domains: ["avatars.githubusercontent.com"],
	},

	// Environment variables
	env: {
		NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
			process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
		MONGODB_URI: process.env.MONGODB_URI,
	},

	// TypeScript strict mode
	typescript: {
		tsconfigPath: "./tsconfig.json",
	},
};

module.exports = nextConfig;
```

## Testing Before Deployment

### Run All Tests

```bash
# Run unit and integration tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode during development
npm run test:watch

# Run end-to-end tests (when implemented)
npm run test:e2e
```

### Test Configuration

```javascript
// jest.config.js
module.exports = {
	testEnvironment: "jsdom",
	setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
	moduleNameMapping: {
		"^@/(.*)$": "<rootDir>/$1",
	},
	collectCoverageFrom: [
		"app/**/*.{ts,tsx}",
		"components/**/*.{ts,tsx}",
		"utils/**/*.{ts,tsx}",
		"!**/*.d.ts",
	],
	coverageThreshold: {
		global: {
			branches: 80,
			functions: 80,
			lines: 80,
			statements: 80,
		},
	},
};
```

### Pre-deployment Checklist

- [ ] All tests pass (`npm test`)
- [ ] TypeScript compilation succeeds (`npm run build`)
- [ ] ESLint passes (`npm run lint`)
- [ ] No console errors in development
- [ ] All environment variables are configured
- [ ] Database connections work
- [ ] External API integrations function correctly

## Environment Configuration

### Environment Variables

```bash
# .env.local (development)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
MONGODB_URI=mongodb://localhost:27017/cnc-tools
NEXT_PUBLIC_API_URL=http://localhost:3000

# .env.production
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
MONGODB_URI=mongodb+srv://...
NEXT_PUBLIC_API_URL=https://cnc-tools.netlify.app
```

### Environment-Specific Builds

```javascript
// utils/config.ts
export const config = {
	isProduction: process.env.NODE_ENV === "production",
	apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
	clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
};

if (typeof window !== "undefined") {
	// Client-side only
	console.log("App version:", process.env.NEXT_PUBLIC_APP_VERSION);
}
```

## Netlify Deployment

### Netlify Configuration

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/api/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Headers = "Content-Type, Authorization"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, OPTIONS"
```

### Build Hooks

```bash
# Build command for Netlify
npm run netlify:build

# In package.json
"scripts": {
  "netlify:build": "npm ci && npm run build"
}
```

### Environment Variables in Netlify

1. Go to Netlify Dashboard > Site Settings > Environment Variables
2. Add all required environment variables
3. Ensure sensitive keys are marked as secret

## Database Deployment

### MongoDB Atlas Setup

1. Create MongoDB Atlas cluster
2. Configure network access (IP whitelist)
3. Create database user with read/write permissions
4. Get connection string and add to environment variables

### Database Migrations

```typescript
// utils/migration.ts
import { MongoClient } from "mongodb";

export async function runMigrations() {
	const client = new MongoClient(process.env.MONGODB_URI!);

	try {
		await client.connect();
		const db = client.db();

		// Check if migration has been run
		const migrations = db.collection("migrations");
		const migrationExists = await migrations.findOne({
			name: "add_user_preferences",
		});

		if (!migrationExists) {
			// Run migration
			await db
				.collection("users")
				.updateMany(
					{},
					{ $set: { preferences: { theme: "light", notifications: true } } }
				);

			// Record migration
			await migrations.insertOne({
				name: "add_user_preferences",
				runAt: new Date(),
			});
		}
	} finally {
		await client.close();
	}
}
```

## Authentication Deployment

### Clerk Configuration

1. Create Clerk application
2. Configure sign-in/sign-up methods
3. Set up authorized redirect URLs
4. Configure JWT templates if needed

### Middleware Setup

```typescript
// middleware.ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
	publicRoutes: ["/", "/api/public"],
	ignoredRoutes: ["/api/webhooks"],
});

export const config = {
	matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

## Monitoring & Logging

### Error Tracking

```typescript
// utils/errorTracking.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
	dsn: process.env.SENTRY_DSN,
	tracesSampleRate: 1.0,
	environment: process.env.NODE_ENV,
});

export function logError(error: Error, context?: any) {
	console.error("Application Error:", error, context);

	if (process.env.NODE_ENV === "production") {
		Sentry.captureException(error, {
			tags: { component: "api" },
			extra: context,
		});
	}
}
```

### Performance Monitoring

```typescript
// app/layout.tsx
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>
				{children}
				{process.env.NODE_ENV === "production" && <Analytics />}
			</body>
		</html>
	);
}
```

## Rollback Strategy

### Version Tagging

```bash
# Tag releases
git tag -a v1.2.3 -m "Release version 1.2.3"
git push origin v1.2.3

# Rollback to previous version
git checkout v1.2.2
npm run build
npm run start
```

### Database Rollback

```typescript
// utils/rollback.ts
export async function rollbackMigration(migrationName: string) {
	// Implementation to reverse a specific migration
	// This should be implemented carefully for each migration
}
```

## CDN & Asset Optimization

### Image Optimization

```typescript
// next.config.js
module.exports = {
	images: {
		formats: ["image/webp", "image/avif"],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
	},
};
```

### Static Asset Caching

```toml
# netlify.toml
[[headers]]
  for = "/_next/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

## Security Headers

### Content Security Policy

```javascript
// next.config.js
module.exports = {
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "Content-Security-Policy",
						value:
							"default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
					},
				],
			},
		];
	},
};
```

### HTTPS Enforcement

```toml
# netlify.toml
[[redirects]]
  from = "http://cnc-tools.netlify.app/*"
  to = "https://cnc-tools.netlify.app/:splat"
  status = 301
  force = true
```

## Deployment Automation

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Netlify

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"
      - run: npm ci
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: netlify/actions/cli@master
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        with:
          args: deploy --dir=.next --prod
```

### Deployment Scripts

```bash
# scripts/deploy.sh
#!/bin/bash

# Exit on error
set -e

echo "Starting deployment..."

# Run tests
npm test

# Build application
npm run build

# Run database migrations if needed
npm run migrate

# Deploy to Netlify
netlify deploy --dir=.next --prod

echo "Deployment completed successfully!"
```

## Post-Deployment Verification

### Health Check Endpoint

```typescript
// app/api/health/route.ts
export async function GET() {
	try {
		// Check database connection
		await checkDatabaseConnection();

		// Check external services
		await checkExternalAPIs();

		return NextResponse.json({
			status: "healthy",
			timestamp: new Date().toISOString(),
			version: process.env.npm_package_version,
		});
	} catch (error) {
		return NextResponse.json(
			{
				status: "unhealthy",
				error: error.message,
				timestamp: new Date().toISOString(),
			},
			{ status: 503 }
		);
	}
}
```

### Automated Testing

```bash
# After deployment, run smoke tests
npm run test:smoke

# Check that the site is responding
curl -f https://cnc-tools.netlify.app/api/health
```

## Troubleshooting Deployment Issues

### Common Issues

1. **Build Failures**: Check TypeScript errors and missing dependencies
2. **Environment Variables**: Ensure all required env vars are set
3. **Database Connection**: Verify MongoDB connection string and network access
4. **Authentication**: Check Clerk configuration and API keys
5. **Static Assets**: Ensure all public assets are properly referenced

### Debug Commands

````bash
# Check build output
npm run build 2>&1 | tee build.log

# Test API endpoints locally
curl http://localhost:3000/api/health

# Check environment variables
printenv | grep -E "(CLERK|MONGODB|NEXT_PUBLIC)"

# Validate TypeScript
npx tsc --noEmit
```</content>
<parameter name="filePath">c:\Users\Deej\Repos\cnc-tools\.github\instructions\deployment.instructions.md
````
