# Social Media Analytics Dashboard

A comprehensive multi-platform social media analytics dashboard built with modern web technologies, featuring role-based access control and real-time data processing.

## Software Architecture

### 3-Layer Architecture
The application follows a clean 3-layer architecture pattern:

- **Presentation Layer**: Next.js pages, React components, and UI interactions
- **Service Layer**: Business logic, data transformation, and external API integrations  
- **Data Access Layer**: Prisma ORM, database operations, and data persistence

### Dependency Injection Pattern
Services are injected into components through a structured pattern, ensuring loose coupling and testability across the application layers.

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library with modern hooks and concurrent features
- **TypeScript** - Type-safe development environment
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library

### Backend  
- **Next.js API Routes** - Server-side API endpoints
- **Server Actions** - Type-safe server mutations
- **Prisma ORM** - Database toolkit and query builder
- **PostgreSQL** - Primary database system

### Authentication & Security
- **NextAuth.js** - Authentication framework
- **Role-based Access Control** - Admin and Client user roles
- **Middleware Protection** - Route-level security enforcement

### Development Tools
- **Zod** - Runtime type validation
- **ESLint** - Code linting and formatting
- **Prisma Migrate** - Database schema management

## System Components

### Authentication System
Multi-role authentication supporting Admin and Client user types with secure session management and protected routing.

### Client Management
Multi-tenant architecture allowing admins to manage multiple client accounts with isolated data access.

### Social Media Integration
Data processing pipeline supporting multiple platforms:
- Instagram analytics and post metrics
- TikTok engagement and performance data  
- LinkedIn professional content insights
- YouTube channel and video statistics

### Analytics Engine
Real-time calculation of engagement metrics, consistency scores, and performance indicators across all connected platforms.

### File Processing System
Secure upload handling for JSON data files with validation, parsing, and database integration.

## Data Layer

### User Management
- User authentication and profile management
- Role-based permissions (Admin/Client)
- Session and security token handling

### Client-Tenant Model
- Multi-tenant client isolation
- Admin-to-client relationships
- Data access control and boundaries

### Social Media Data Models
- Platform-specific data structures for Instagram, TikTok, LinkedIn, YouTube
- Unified analytics calculation across platforms
- Upload tracking and file processing status

### Analytics Storage
- Aggregated metrics and performance indicators
- Historical data tracking and trend analysis
- Consistency scoring and engagement calculations

## Key Features

### Dashboard Analytics
Interactive dashboard displaying comprehensive social media metrics with filtering, date range selection, and cross-platform comparisons.

### Admin Panel
Complete user and client management interface with role assignment, access control, and system administration tools.

### Multi-Platform Insights
Unified view of social media performance across Instagram, TikTok, LinkedIn, and YouTube with platform-specific metrics.

### Data Upload System  
Secure file upload functionality supporting JSON data import with validation, error handling, and processing status tracking.

### Role-Based Access
Sophisticated permission system ensuring data isolation between clients and administrative oversight capabilities.

## Project Structure

The codebase is organized following Next.js 14 App Router conventions with clear separation of concerns across presentation, business logic, and data access layers.