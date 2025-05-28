# CNC Tools Types Directory

## Purpose

This directory contains all shared and global TypeScript types and interfaces for the CNC Tools monorepo. All type definitions should be centralized here to avoid duplication and ensure strict typing across the codebase.

## Guidelines

- Use `index.ts` for all shared types (enclosure, table, material, etc.).
- Use `shared.ts` for types shared between backend and frontend (API, user, chat, etc.).
- Do not duplicate types in component or feature folders—import from here instead.
- If a type or file is not used, remove it.
- Prefer strict types over `any` or `unknown`.
