# CNC Tools — AI Assistant Instructions

This file provides essential context for AI coding assistants working on the CNC Tools repository.

## Project Overview

CNC Tools is a web application providing specialized calculators and utilities for CNC (Computer Numerical Control) machining and fabrication. It offers tools for box shipping calculations, extrusion cutting optimization, enclosure design, price comparisons, and AI-powered technical assistance for CNC operations. The app serves makers, fabricators, and CNC operators who need precise calculations for material planning, shipping logistics, and technical problem-solving.

**Key Architecture Insights:**

- **Hybrid Architecture**: Next.js 14 App Router with server/client components + external API backend (localhost:5000)
- **Authentication**: Clerk-based with role metadata (isAdmin/isMaster) for admin panel access
- **Data Layer**: MongoDB for persistent storage (items, conversations) + in-memory operations for calculations
- **Complex Algorithms**: 3D bin packing, PDF invoice processing, AI streaming responses
- **UI Patterns**: Optimistic updates with background API sync, chunked processing to avoid timeouts

## Tech Stack

### Frontend

- **Next.js 14** (App Router) - React framework with server/client components
- **React 18** - UI library with hooks and modern patterns
- **TypeScript** - Type-safe JavaScript with strict configuration
- **Bootstrap 5** - CSS framework for responsive design
- **SCSS** - Custom styling with CSS modules

### Backend & APIs

- **Next.js API Routes** - Server-side API endpoints
- **External API Backend** - Technical AI service (localhost:5000) for chat/streaming
- **MongoDB** - Document database with Mongoose ODM
- **Clerk** - Authentication and user management
- **OpenAI API** - AI chat completions and embeddings

### Testing & Quality

- **Jest** - Test runner with jsdom environment
- **React Testing Library** - Component testing utilities
- **Custom Test Utils** - Mocking utilities for fetch/streaming responses
- **ESLint** - Code linting with Next.js rules

### Deployment & DevOps

- **Netlify** - Static site deployment with SSR support
- **npm scripts** - Build, test, and deployment automation
- **Environment variables** - Configuration management

## Coding Guidelines

Follow the comprehensive guidelines in `.github/CodingConventions.md` which covers:

- **File structure** and naming conventions
- **React component patterns** and best practices
- **TypeScript usage** and type safety
- **Testing requirements** and patterns
- **Security practices** and code quality standards

Key principles:

- Use TypeScript strictly with proper type annotations
- Write unit tests for all business logic and components
- Follow React best practices with hooks and functional components
- Maintain consistent code formatting and structure
- Prioritize accessibility and responsive design

**Project-Specific Patterns:**

- **Optimistic UI**: Update UI immediately, sync with backend asynchronously
- **Chunked Processing**: Break large operations (PDF parsing) into sequential steps
- **Role-Based UI**: Check `user.publicMetadata.isAdmin/isMaster` for admin features
- **API Integration**: Use `process.env.NEXT_PUBLIC_API_URL` for external backend calls
- **Error Handling**: Graceful degradation with user feedback for failed operations

## Project Structure

```
cnc-tools/
├── .github/                 # GitHub configuration and docs
│   ├── copilot-instructions.md    # This file
│   ├── CodingConventions.md       # Detailed coding standards
│   ├── PULL_REQUEST_TEMPLATE.md   # PR guidelines
│   └── todos.md                   # Project task tracking
├── app/                     # Next.js App Router pages
│   ├── page.tsx             # Home page with tool tiles
│   ├── layout.tsx           # Root layout with navigation
│   ├── globals.scss         # Global styles
│   ├── box-shipping-calculator/   # Shipping optimization tool
│   │   ├── page.tsx         # Main calculator UI
│   │   ├── BoxCalculations.ts # 3D bin packing algorithms
│   │   └── ItemAddForm.tsx  # Item management components
│   ├── cnc-technical-ai/          # AI chat interface
│   │   ├── page.tsx         # Chat UI with streaming
│   │   └── ChatInterface.tsx # Real-time conversation handling
│   ├── table-enclosure-calculator/# Enclosure design tool
│   └── [other-tools]/             # Additional calculators
├── components/              # Reusable React components
│   ├── navbar/              # Navigation with role-based links
│   ├── tiles/               # Home page tool tiles
│   └── LayoutContainer.tsx  # Layout wrapper
├── types/                   # TypeScript definitions
│   ├── box-shipping-calculator/   # Domain-specific types
│   │   ├── ShippingItem.ts  # Item data models
│   │   └── ShippingBox.ts   # Box specifications
│   └── mongodb/             # Database interfaces
├── utils/                   # Utility functions
│   ├── api.ts              # API wrapper functions
│   └── navigation.tsx       # Route helpers
├── contexts/                # React context providers
├── public/                  # Static assets
├── styles/                  # Component styles
├── test/                    # Test utilities and helpers
│   └── testUtils.ts         # Custom mocking utilities
└── docs/                    # Documentation files
```

### Key Directories to Know

- `app/*/page.tsx` - Page components for each tool
- `app/*/BoxCalculations.ts` - Core algorithms (keep logic here for testing)
- `components/` - Shared UI components
- `types/` - All TypeScript interfaces and types
- `test/testUtils.ts` - Testing helpers and mocks

**Critical Workflows:**

- **Invoice Processing**: PDF upload → chunked server actions → item extraction → MongoDB storage
- **Box Shipping**: Item selection → 3D packing algorithm → multi-box optimization → visual results
- **AI Chat**: Streaming OpenAI responses, file uploads, conversation persistence
- **Admin Panel**: Role-based access via Clerk metadata, user management UI

## Resources

### Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run test` - Run all tests
- `npm run test:watch` - Watch mode testing
- `npm run test:coverage` - Generate coverage report
- `npm run lint` - Code linting
- `npm run netlify:build` - Netlify deployment build

### MCP Server Tools

- **Context7 Documentation** - Fetch authoritative library docs
- **Web Search Tools** - DuckDuckGo/Google for external references
- **Git Tools** - Repository operations and history
- **GitHub Tools** - Issue and PR management

### External Resources

- **Clerk Dashboard** - User management and auth configuration
- **MongoDB Atlas** - Database administration
- **Netlify Dashboard** - Deployment monitoring
- **Technical AI Backend** - External service (localhost:5000) for AI/chat features
- **DEVELOPER.md** - Setup and development guide

### File References

- `package.json` - Dependencies and scripts
- `next.config.js` - Next.js configuration
- `middleware.ts` - Authentication routing
- `jest.config.js` - Testing configuration
- `tsconfig.json` - TypeScript configuration
- `netlify.toml` - Deployment configuration

---

## Agent Workflow Guidelines

1. Read the repository docs first (`README.md`, `CodingConventions.md`, this file).
2. Use Context7 (MCP Context7 tool) to retrieve authoritative docs for libraries when possible.
3. When you need web references, use the workspace MCP web search tools (DuckDuckGo/Google helpers) rather than raw scraping.
4. Preserve existing code and comments where possible; add clarifying comments from the maintainer POV.
5. Prefer updating existing files to adding new ones; make small, focused edits.
6. Always consider backward compatibility; run tests and manual checks before submitting changes.
7. Maintain a `.github/todos.md` with a concise TODO list (format below) and update it for larger tasks.

### `.github/todos.md` format (required)

- Use status markers: `[Todo]`, `[In Progress]`, `[Completed]`.
- Example:
  - [Todo] Add unit tests for `enclosure-calculator` deterministic ID bug
  - [In Progress] Convert legacy auth helpers to Clerk `getToken()` in `app/actions`
  - [Completed] Migrate Netlify build config to `netlify.toml`

---

If any part of these instructions is unclear or incomplete, point to the section you want expanded and I will iterate. Please include the file or feature you plan to modify when asking for more detail.
