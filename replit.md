# Barcode Scanner Web App

## Overview

This is a Vietnamese barcode scanner web application built with React and Express. The app allows users to scan product barcodes using their device camera or manually input barcodes to search for product information. It integrates with a NocoDB database to retrieve detailed product data including pricing, images, and descriptions. The application features a modern, mobile-first UI with comprehensive error handling and loading states.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible design
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **Camera Integration**: html5-qrcode library loaded via CDN for barcode scanning functionality

### Backend Architecture
- **Framework**: Express.js with TypeScript for the REST API server
- **Build System**: Vite for development server and build process, ESBuild for production bundling
- **Development**: Hot module replacement (HMR) and runtime error overlays for enhanced developer experience
- **Storage**: In-memory storage implementation with interface for potential database integration

### Data Storage Solutions
- **External Database**: NocoDB as the primary data source via REST API
- **Local Storage**: Memory-based storage for user sessions and temporary data
- **Database Schema**: Comprehensive product schema with support for inventory tracking, pricing, and metadata

### Authentication and Authorization
- **API Security**: Token-based authentication using xc-token headers for NocoDB access
- **CORS**: Configured for cross-origin requests to external APIs
- **Session Management**: Basic session handling with connect-pg-simple setup for potential PostgreSQL sessions

### External Service Integrations
- **NocoDB API**: Primary product database integration with RESTful endpoints
- **Camera API**: Browser MediaDevices API for camera access and permissions
- **Barcode Detection**: html5-qrcode library supporting multiple barcode formats (UPC-A, UPC-E, EAN-8, EAN-13, CODE-128, CODE-39, ITF)

### Key Design Patterns
- **Component Composition**: Modular UI components with clear separation of concerns
- **Custom Hooks**: Reusable logic for camera access, barcode scanning, and mobile detection
- **Error Boundaries**: Comprehensive error handling with user-friendly error modals
- **Progressive Enhancement**: Fallback to manual input when camera is unavailable
- **Mobile-First Design**: Responsive layout optimized for mobile barcode scanning
- **Type Safety**: Full TypeScript implementation with Zod schemas for runtime validation

### Development Tools
- **Linting**: TypeScript compiler for type checking
- **Build Process**: Dual build system for client (Vite) and server (ESBuild)
- **Development Server**: Integrated Vite dev server with Express middleware
- **Replit Integration**: Custom plugins for Replit development environment