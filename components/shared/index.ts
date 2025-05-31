"use client";

// Layout components
export { default as Container } from "./layout/Container";
export { default as Layout } from "./layout/Layout";
export { default as Navbar } from "./layout/Navbar";
export { default as Footer } from "./layout/Footer";

// Display components
export { default as Alert } from "./display/Alert";
export { default as Card } from "./display/Card";
export { default as Table } from "./display/Table";

// Form components
export { default as Form } from "./forms/Form";
export { default as FileUpload } from "./FileUpload";

// Export component types
export type { ContainerProps } from "./layout/Container";
export type { FooterColumn, FooterLink, FooterProps } from "./layout/Footer";
export type { NavItem, NavbarProps } from "./layout/Navbar";
export type { AlertProps } from "./display/Alert";
export type { CardProps } from "./display/Card";
export type { TableColumn, TableProps } from "./display/Table";
export type { FormField, FormProps } from "./forms/Form";

/**
 * CNC Tools Shared Components Library
 *
 * This library provides a set of reusable components for building consistent UIs.
 * Components are designed to be flexible, customizable, and easy to use.
 *
 * Key component categories:
 * - Layout: Container, Layout, Navbar, Footer
 * - Display: Alert, Card, Table
 * - Forms: Form, FileUpload
 *
 * Import components individually or from this index file.
 *
 * @example
 * // Import multiple components
 * import { Container, Card, Alert } from '@/components/shared';
 *
 * // Or import individually
 * import Container from '@/components/shared/layout/Container';
 */
