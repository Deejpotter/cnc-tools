# CNC Tools

A comprehensive collection of mini-applications designed to assist with CNC machining, 3D printing, and related tasks. This Next.js-powered application serves as a central hub for various specialized tools used in professional and hobby settings.

**Last Updated:** May 13, 2025  
**Author:** Deej Potter

Last Updated: May 13, 2025  
Author: Deej Potter

## Features

This application contains several mini-apps:

- **Box Shipping Calculator** - Optimize box shipping configurations and costs using an advanced 3D bin packing algorithm:
  - Intelligent multi-box packing
  - Weight and volume optimization
  - Visual packing results
  - Item database management

- **CNC Technical AI** - AI chatbot for assisting with CNC-related technical queries:
  - Context-aware responses to technical questions
  - File upload support for project-specific assistance
  - Conversation history tracking

- **Extrusion Resources**
  - 20-Series Extrusions guide and calculator - Pricing and specifications for 20-series aluminum extrusions
  - 40-Series Extrusions guide and calculator - Pricing and specifications for 40-series aluminum extrusions

- **Enclosure Calculator** - Calculate dimensions and specifications for enclosures made from 20-Series and 40-Series extrusions:
  - **Box Dimensions** - Calculate box dimensions based on volume and weight
  - **Material Selection** - Choose materials for the enclosure
  - **Assembly Instructions** - Generate assembly instructions for the enclosure

- **CNC Calibration Tool** - Calibrate your 3D printer or CNC machine with tools for:
  - Steps per millimeter calculation
  - Flow compensation

- **Price Difference Tool** - Compare prices and calculate differences between products or services

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Technology Stack

This project is built with:

- [Next.js](https://nextjs.org/) - React framework with server actions for backend functionality
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- Custom Bootstrap implementation for responsive design
- MongoDB - Database for storing application data
- Jest and React Testing Library - For comprehensive test coverage

## Development

### Prerequisites

- Node.js 22.x or higher (recommended LTS 22.16.0)
- npm 10.x or higher (recommended 10.5.0)
- MongoDB database (local or cloud instance)

### Environment Setup

1. Clone the repository
2. Create a `.env` file with the following variables:

   ``` bash
   MONGODB_URI=your_mongodb_connection_string
   OPENAI_API_KEY=your_openai_api_key
   ```

3. Install dependencies with `npm install`
4. Run the development server with `npm run dev`

The app uses server actions and pulls the variables from the environment process, so they won't be available in the browser.
Make sure to set them in your environment in Netlify/Vercel or your local `.env` file.

### Testing

Run the test suite with:

```bash
npm test
```

For test coverage reporting:

```bash
npm run test:coverage
```

## Deployment

The application is deployed on Netlify for production use. The deployment process includes:

- Automatic deployment from the main branch
- Build-time TypeScript and ESLint checks
- Environment variable configuration for API keys and database connections
- NextJS-specific optimizations for static pages and server components
- Comprehensive testing before production deployment

### Netlify Build & Deployment

This project is designed to deploy seamlessly on Netlify using Next.js SSR (Server-Side Rendering).

- **Build Command:**
  - Netlify runs `yarn build` (or `npm run build`) as defined in `netlify.toml`.
  - This executes `next build` to prepare the app for production.

### Example Netlify Build Process

1. Netlify installs dependencies using Yarn or npm.
2. Runs `yarn build` (or `npm run build`).
3. Publishes the `.next` directory for SSR.
4. Sets environment variables as needed.

For more details, see the comments in `netlify.toml` and the scripts in `package.json`.

## Project Structure

The project follows a Next.js App Router structure:

- `app/` - Main application pages and mini-apps
  - `box-shipping-calculator/` - Box Shipping Calculator tool
  - `cnc-technical-ai/` - AI chatbot for CNC technical questions
  - `20-series-extrusions/` - 20-Series Extrusions calculator
  - `40-series-extrusions/` - 40-Series Extrusions calculator
  - `enclosure-calculator/` - Enclosure calculator
  - `cnc-calibration-tool/` - CNC Calibration tool
  - `price-difference-tool/` - Price comparison tool
- `app/actions/` - Server actions for backend functionality. Safe server actions are used for database operations and API calls.
- `components/` - Reusable UI components. Should be abstracted because I use them in multiple apps.
- `contexts/` - React context providers. Mostly used for authentication and other global state management.
- `utils/` - Utility functions
- `styles/` - CSS and SCSS files
- `public/` - Static assets
- `types/` - TypeScript type definitions and interfaces for components and utilities.

## Navigation and Portability

- All internal navigation uses Next.js's `Link` component (`import Link from "next/link"`) for optimal routing and prefetching.
- If you use components outside Next.js, replace `Link` with your router's link component.
- See `CodingConventions.md` for more details on navigation best practices and portability.

## Learn More

To learn more about Next.js, check out the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

## License

See the [LICENSE](LICENSE) file for details.

## Backend Integration (Express API)

This app uses an Express backend for all API requests during development and production. To configure the frontend to use your backend:

- Set the API base URL as an environment variable:
  - For Next.js: `NEXT_PUBLIC_API_URL=http://localhost:5000` (replace 5000 with your backend port if different)

All API requests should use this base URL. Example:

```js
fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/health`)
```

## Authentication (Clerk.dev)

This app uses Clerk.dev for authentication and user management. Auth0 and Netlify Identity are no longer supported.

### Setup

- Install Clerk for Next.js:

```bash
yarn add @clerk/nextjs@latest
```

- Add a `middleware.ts` file at the project root with:

```typescript
import { clerkMiddleware } from "@clerk/nextjs/server";
export default clerkMiddleware();
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

- Wrap your app in `<ClerkProvider>` in `app/layout.tsx`.
- Use Clerk's React components (`<SignInButton>`, `<SignUpButton>`, `<UserButton>`, `<SignedIn>`, `<SignedOut>`) for authentication UI.
- For protected API calls, use Clerk's `getToken()` or `useAuth()` to get the JWT and include it in the `Authorization` header.
- The Express backend must validate Clerk JWTs for protected endpoints.
- See CodingConventions.md for usage details and Clerk docs for backend validation examples.

## Clerk.dev Authentication Migration (June 9, 2025)

- This app now uses Clerk.dev for authentication and authorization with the Next.js App Router.
- To set up Clerk:
  1. Create a Clerk account and application at [https://clerk.com/](https://clerk.com/)
  2. Add your Clerk publishable and secret keys to your `.env` file:
     - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
     - CLERK_SECRET_KEY
  3. Install Clerk for Next.js:
     - yarn add @clerk/nextjs@latest
  4. Add `middleware.ts` at the project root using `clerkMiddleware()` from `@clerk/nextjs/server` (see CodingConventions.md for details).
  5. Wrap your app in `<ClerkProvider>` in `app/layout.tsx` and use Clerk's built-in components for authentication UI.
  6. Remove all Auth0/Netlify Identity code and use Clerk's hooks/components instead.

## Frontend/Backend Split

- All business logic, database access, and sensitive operations are now handled by the Express backend.
- The frontend only communicates with the backend via API endpoints.
- All server actions and server code have been removed from the frontend.

## Server Actions Migration

- As of June 9, 2025, all server logic (data, chat, invoice, and database actions) has been moved to the Express backend.
- The Next.js frontend now communicates exclusively with the backend via API endpoints using fetch and the NEXT_PUBLIC_API_URL environment variable.
- All previous server actions in /app/actions have been removed or refactored to use backend API calls.
