# Monorepo Structure Documentation

## Overview

This project follows a monorepo structure using Yarn Workspaces, which means we have multiple JavaScript/TypeScript packages managed from a single repository. This document explains our project structure, the reasoning behind it, and best practices for working with it.

## Current Structure

```
cnc-tools/                  # Root directory
├── package.json            # Root package.json with workspaces config
├── netlify.toml            # Root Netlify config (controls deployment)
├── frontend/               # Next.js frontend application
│   ├── package.json        # Frontend-specific dependencies
│   └── ...                 # Frontend code
├── backend/                # Express.js backend application  
│   ├── package.json        # Backend-specific dependencies
│   └── ...                 # Backend code
└── types/                  # Shared TypeScript types
    └── ...                 # Type definitions
```

## Why This Structure?

This monorepo approach with multiple package.json files has several advantages:

1. **Separation of concerns**: Frontend and backend have different dependencies and configurations
2. **Deployment flexibility**: The frontend can be deployed to Netlify while the backend can be deployed elsewhere
3. **Independent versioning**: Each package can have its own version
4. **Clean dependency trees**: Dependencies are installed only where needed
5. **Shared code**: We can still share code between packages (e.g., shared types)
6. **Unified development**: Develop and test the entire application from a single codebase

## Yarn Workspaces

We use Yarn Workspaces to manage this monorepo. This allows us to:

- Install dependencies for all packages with a single `yarn install` at the root
- Share dependencies between packages to avoid duplication
- Run scripts across all packages from the root

## Best Practices

### Adding Dependencies

Add dependencies to the specific package that needs them:

```bash
# Add a dependency to the frontend
cd frontend
yarn add some-package

# Add a dependency to the backend
cd backend
yarn add some-package

# Add a dev dependency to the root (for tooling that affects all packages)
# Run this from the root directory
yarn add -D some-package -W
```

### Running Scripts

Use the scripts defined in the root package.json to run commands across packages:

```bash
# Start both frontend and backend in development mode
yarn dev

# Build both packages
yarn build

# Run tests for all packages
yarn test
```

### Managing Shared Dependencies

If multiple packages use the same dependency:

1. Each package should still declare the dependency in its own package.json
2. Yarn Workspaces will automatically hoist and deduplicate shared dependencies

### Deployment

- **Frontend**: Deployed to Netlify using the configuration in the root netlify.toml
- **Backend**: Deployed separately to your preferred hosting service

## Common Issues and Solutions

### Dependency Conflicts

If you encounter version conflicts between packages:

1. Try to align versions across packages
2. If specific versions are required, use Yarn's resolutions field in the root package.json

### Running Commands in Specific Workspaces

To run a command in a specific workspace:

```bash
yarn workspace frontend <command>
yarn workspace backend <command>
```

## Conclusion

This monorepo structure with multiple package.json files is a best practice for projects with distinct frontend and backend components. It provides a good balance between separation of concerns and development convenience.

For any questions or suggestions about this structure, please contact the development team.
