# Table and Enclosure Calculator

## Overview

The Table and Enclosure Calculator is a tool for calculating the materials needed for building CNC machine tables and enclosures of various sizes. It provides detailed calculations for extrusion lengths, hardware requirements, and panel materials.

## Features

- Calculate materials for machine tables with custom dimensions
- Calculate materials for enclosures with custom dimensions
- Handle both inside and outside dimension specifications
- Support for mounting enclosures to tables
- Support for doors and panels with various material types
- Shareable URLs for saved configurations

## Quick Quote Examples

For frequently requested configurations, we provide pre-configured examples:

### Table with Half Enclosure

Access a pre-configured quote for a table with a 200mm half enclosure around the perimeter:

- Working area: 1200mm × 1200mm
- Total height: 950mm (including 200mm enclosure)
- Enclosure panel material: Corflute
- M8 caster wheels

This example is available at: `/table-enclosure-calculator/examples/half-enclosure-quote-example`

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

## Creating Custom Quotes

For creating custom quotes or specific configurations, see the example in:
`/quotes/half-enclosure-quote.ts`

This demonstrates how to create specialized quote calculators for specific customer requirements.

## Testing

Tests for all calculation utilities are available in:

- `calcUtils.test.ts` - Tests for the core calculation functions
- `quotes/half-enclosure-quote.test.ts` - Tests for the half enclosure quote example

Run tests with:

```bash
npm test app/table-enclosure-calculator
```
