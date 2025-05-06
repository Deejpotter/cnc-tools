# CNC Tools

A comprehensive collection of mini-applications designed to assist with CNC machining, 3D printing, and related tasks. This Next.js-powered application serves as a central hub for various specialized tools used in professional and hobby settings.

## Features

This application contains several mini-apps:

- **CNC Calibration Tool** - Calibrate your 3D printer or CNC machine with tools for:
  - Steps per millimeter calculation
  - Flow compensation
  - Startup G-code generator

- **Box Shipping Calculator** - Optimize box shipping configurations and costs

- **CNC Technical AI** - AI chatbot for assisting with CNC-related technical queries

- **Extrusion Resources**
  - 20-Series Extrusions guide and calculator
  - 40-Series Extrusions guide and calculator

- **Enclosure Calculator** - Calculate dimensions and specifications for enclosures made from 20-Series and 40-Series extrusions. 
Features:
  - **Box Dimensions** - Calculate box dimensions based on volume and weight
  - **Material Selection** - Choose materials for the enclosure
  - **Assembly Instructions** - Generate assembly instructions for the enclosure

- **Price Difference Tool** - Compare prices and calculate differences

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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Technology Stack

This project is built with:
- [Next.js](https://nextjs.org/) - React framework with server actions for backend functionality
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- Custom Bootstrap implementation for responsive design
- MongoDB - Database for storing application data

## Deployment

The application is deployed on Netlify for production use.

## Project Structure

The project follows a Next.js App Router structure:
- `app/` - Main application pages and mini-apps
- `app/actions/` - Server actions for backend functionality
- `components/` - Reusable UI components
- `interfaces/` - TypeScript interfaces
- `contexts/` - React context providers
- `utils/` - Utility functions
- `styles/` - CSS and SCSS files
- `public/` - Static assets

## Learn More

To learn more about Next.js, check out the following resources:
- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

## License

See the [LICENSE](LICENSE) file for details.
