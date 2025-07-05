# Replit.md - Muro Infinito de Vídeos

## Overview

This is a full-stack web application called "Muro Infinito de Vídeos" (Infinite Video Wall) for the reparacoeshistoricas.org project. The platform allows users to share personal experiences of racism through short vertical videos (up to 60 seconds) that are accessed via QR codes linked to book chapters. The application features a modern React frontend with a Node.js/Express backend, PostgreSQL database, and comprehensive admin dashboard for content moderation.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **File Upload**: Multer for multipart form handling
- **API**: RESTful endpoints with JSON responses

### Database Schema
- **Users**: Authentication and admin management
- **Chapters**: Book chapters with QR code generation
- **Videos**: User-submitted content with metadata and moderation status
- **Sessions**: Authentication session storage

## Key Components

### Authentication System
- Replit Auth integration for secure user authentication
- Session-based authentication with PostgreSQL session storage
- Role-based access control (admin vs regular users)
- OpenID Connect protocol implementation

### Video Management
- Multi-step upload process with form validation
- Video file handling with format and duration restrictions
- Demographic data collection for statistical analysis
- Content moderation workflow (pending/approved/rejected)
- Metadata tracking including racism type categorization

### QR Code Integration
- Dynamic QR code generation for book chapters
- Chapter-specific video filtering and display
- Mobile-optimized access via QR scanning

### Admin Dashboard
- Video moderation interface with approval/rejection workflow
- Statistical analytics and reporting
- Chapter management and QR code generation
- User management capabilities

### Video Wall Interface
- Infinite scroll implementation for video browsing
- Responsive grid layout for different screen sizes
- Modal video player with full-screen capabilities
- Mobile-first design with touch gesture support

## Data Flow

### User Journey
1. User scans QR code from book chapter
2. Redirected to chapter-specific video wall
3. Browse existing approved videos in infinite scroll format
4. Option to contribute new video via upload form
5. Video submission goes through moderation process
6. Approved videos appear in the public wall

### Admin Workflow
1. Admin authentication via Replit Auth
2. Access to admin dashboard with video moderation queue
3. Review submitted videos with demographic data
4. Approve/reject videos with optional feedback
5. Monitor platform statistics and analytics
6. Manage chapters and QR code generation

### Data Processing
- Client-side form validation with Zod schemas
- Server-side validation and sanitization
- Database transactions for data consistency
- Real-time updates via React Query cache invalidation

## External Dependencies

### Core Framework Dependencies
- React ecosystem (React, React DOM, React Router alternative)
- Node.js runtime with Express framework
- PostgreSQL database with Drizzle ORM
- TypeScript for type safety across the stack

### UI and Styling
- Radix UI primitives for accessible components
- Tailwind CSS for utility-first styling
- Lucide React for consistent iconography
- Custom CSS variables for theming support

### Authentication and Security
- Replit Auth for OpenID Connect authentication
- Express session management with PostgreSQL storage
- CSRF protection and secure cookie handling
- Input validation and sanitization

### Development Tools
- Vite for fast development and optimized builds
- ESBuild for server-side TypeScript compilation
- Drizzle Kit for database schema management
- PostCSS for CSS processing

### Third-party Services
- Neon Database for PostgreSQL hosting
- YouTube API integration (configured but not fully implemented)
- QR code generation library
- File upload and storage capabilities

## Deployment Strategy

### Development Environment
- Local development with Vite dev server
- Hot module replacement for rapid development
- TypeScript compilation and type checking
- Database migrations with Drizzle Kit

### Production Build
- Vite production build for optimized client bundle
- ESBuild compilation for server-side code
- Static asset optimization and minification
- Environment variable configuration

### Database Management
- PostgreSQL database with connection pooling
- Drizzle ORM for type-safe database operations
- Migration system for schema changes
- Session storage in database for scalability

### Hosting Requirements
- Node.js runtime environment
- PostgreSQL database access
- Environment variables for configuration
- Static file serving capabilities

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 05, 2025. Initial setup