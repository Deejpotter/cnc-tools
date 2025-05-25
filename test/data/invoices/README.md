# Test Invoice Data

This directory contains PDF invoices used for integration and end-to-end testing of the Box Shipping Calculator.

## Purpose

- Provides real-world data for testing the invoice processing functionality
- Ensures compatibility with various invoice formats from suppliers
- Validates the entire flow from invoice upload to box calculation

## Usage

When writing tests that involve invoice processing:

1. Reference these files in your test cases
2. Use them to verify the full data flow works correctly
3. Add new samples when encountering edge cases or different formats

## Notes

- These files may contain sensitive information and should not be committed to public repositories
- Consider using sanitized or mock invoices for public repositories
- The file format should be PDF to match the production application's expected input

Updated: 25/05/25
Author: Deej Potter
