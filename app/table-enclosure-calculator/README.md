# Table and Enclosure Calculator

## Overview

The Table and Enclosure Calculator is a tool for calculating the materials needed for building CNC machine tables and enclosures of various sizes. It provides detailed calculations for extrusion lengths, hardware requirements, and panel materials.

## Features

- Calculate materials for machine tables with custom dimensions
- Calculate materials for enclosures with custom dimensions
- Handle both inside and outside dimension specifications
- Support for mounting enclosures to tables
- Support for doors and panels with various material types
- Save and load configuration presets
- Undo/Redo functionality for configuration changes
- Export materials list to CSV/Excel formats

## Calculator Usage

The calculator provides an easy-to-use interface for calculating materials needed for tables and enclosures with custom dimensions.

## Calculator API

The calculator provides reusable functions in `calcUtils.ts` for various calculations:

```typescript
import { 
  calculateTableMaterials, 
  calculateEnclosureMaterials,
  calculateMountingMaterials,
  calculateDoorMaterials,
  calculatePanelMaterials 
} from './calcUtils';
```

## Extending the Calculator

The calculator is designed to be extensible. You can create custom configurations by using the calculation functions directly in your own components.

## Testing

Tests for all calculation utilities are available in:

- `calcUtils.test.ts` - Tests for the core calculation functions

Run tests with:

```bash
npm test app/table-enclosure-calculator
```
