# Import Best Practices for Monorepos

## Overview

This document outlines best practices for importing modules in our monorepo, specifically focusing on shared types and interfaces.

## Recommended Approaches

### 1. Relative Imports (Preferred for Shared Types)

For importing shared types across the monorepo, we recommend using relative imports:

```typescript
// Example: Importing from the shared types directory
import ShippingItem from "../../../types/interfaces/box-shipping-calculator/ShippingItem";
```

**Benefits:**

- Works reliably in all build environments (local, CI, Netlify)
- No reliance on path aliases that might not be correctly resolved during builds
- Clear indication of the actual file location

### 2. Path Aliases (For Local Project Imports)

For importing within a project (frontend or backend), path aliases can still be used:

```typescript
// Within the frontend, for frontend-specific imports
import { SomeComponent } from "@/components/SomeComponent";

// Within the backend, for backend-specific imports
import { SomeService } from "@/services/SomeService";
```

**Notes:**

- Ensure path aliases are properly configured in both tsconfig.json and build tools
- Be cautious with aliases that point to directories outside the current project

### 3. Avoiding Common Issues

**Import Path Problems:**

- Inconsistent use of path aliases across the project
- Relying on aliases that aren't properly configured in the build environment
- Using aliases for cross-project imports that might not resolve correctly

**Netlify-Specific Issues:**

- Netlify builds may handle path resolution differently than local development
- Always test builds with the verification script before deploying

## How to Update Import Paths

If you need to update import paths in bulk, use the provided PowerShell scripts:

1. `update-to-relative-paths.ps1` - Converts all shared type imports to relative paths
2. `verify-netlify-build.ps1` - Checks for potential build issues before deploying

## Conclusion

By following these import practices, we can ensure our monorepo builds reliably across all environments while maintaining a clean and consistent codebase.
