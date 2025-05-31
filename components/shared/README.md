# CNC Tools Shared Components Library

This library provides a set of reusable components designed to be used across the CNC Tools application. The components are built with flexibility and customization in mind, allowing them to be easily adapted to different use cases.

## Component Categories

### Layout Components

- **Container**: A flexible container component that supports various styling options.
- **Layout**: A standard page layout with navbar, content area, and footer.
- **Navbar**: A customizable navigation bar with support for dropdowns, mobile responsiveness, and theming.
- **Footer**: A configurable footer component with support for multiple columns and links.

### Display Components

- **Alert**: A customizable alert component with support for different variants, animations, and auto-dismissal.
- **Card**: A versatile card component with support for images, actions, and various styling options.
- **Table**: A powerful table component with support for sorting, filtering, pagination, and row selection.

### Form Components

- **Form**: A generic form component that generates forms from configuration objects.
- **FileUpload**: A drag-and-drop file upload component with validation and customization options.

## Usage

You can import components individually or from the index file:

```tsx
// Import multiple components
import { Container, Card, Alert } from '@/components/shared';

// Or import individually
import Container from '@/components/shared/layout/Container';
```

## Examples

### Container Component

```tsx
<Container 
  maxWidth="lg" 
  background="bg-light" 
  padding="p-4"
  margin="my-5"
  shadow
  border
  rounded
>
  <h1>Content goes here</h1>
</Container>
```

### Card Component

```tsx
<Card
  title="Card Title"
  subtitle="Card Subtitle"
  image="/path/to/image.jpg"
  shadow
  actions={
    <>
      <button className="btn btn-primary">Action</button>
      <button className="btn btn-secondary">Another action</button>
    </>
  }
>
  <p>Card content goes here</p>
</Card>
```

### Form Component

```tsx
<Form
  fields={[
    {
      name: "email",
      label: "Email Address",
      type: "email",
      required: true,
      placeholder: "Enter your email"
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      required: true
    }
  ]}
  onSubmit={(data) => console.log(data)}
  submitLabel="Log In"
/>
```

## Customization

Most components accept a `className` prop that allows you to add custom CSS classes. Additionally, many components have specific props for customizing their appearance and behavior.

## Theming

Several components support a `theme` prop that allows you to change their color scheme. Common theme values include:

- `light` (default)
- `dark`
- `primary`
- `secondary`
- `success`
- `danger`
- `warning`
- `info`

## Best Practices

1. Use the appropriate component for the task at hand.
2. Leverage component props for customization before applying custom CSS.
3. For complex layouts, combine multiple components (e.g., use Container within Layout).
4. When creating new components, follow the same patterns and interface conventions.

## Extending

To extend the library with new components:

1. Create your component in the appropriate subdirectory.
2. Export it from the index file.
3. Document its props and usage.
4. Follow the existing naming and styling conventions.
