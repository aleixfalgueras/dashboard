## Architecture Requirements

Please implement a **3-layer architecture** with clear separation of concerns:
### Layer 1: Presentation Layer (UI & API)
- **Actions** (`app/actions/`): Server actions for UI interactions
  - Handle form submissions and user interactions
  - Call service layer methods or API endpoints if necessary
  - Return formatted responses for the UI
- **API Routes** (`app/api/`): HTTP endpoints for external access
  - Handle HTTP concerns (headers, status codes, etc.)
  - Parse/validate request data
  - Call service layer methods
  - Return JSON responses
### Layer 2: Business Logic Layer
- **Services** (`services/`): Core business logic
  - Contains all business rules and data processing
  - Platform-agnostic (doesn't know about HTTP or UI)
  - Handles data transformation and validation
  - Orchestrates database operations
  - Returns domain objects/DTOs
### Layer 3: Data Access Layer
- **Repositories** (`repositories/`): Database abstraction
  - All Prisma queries live here
  - No business logic, only data access
  - Returns Prisma-generated types
  - Handles database transactions
## Implementation Rules

1. **Dependency Direction**: UI/API → Services → Repositories (never reverse)
2. **No Cross-Layer Jumps**: Actions/API cannot directly access repositories
3. **Type Safety**: Use Prisma-generated types throughout, no manual interfaces
4. **Error Handling**: Each layer handles its own concerns
   - Repositories: Database errors
   - Services: Business rule violations
   - Actions/API: HTTP/UI appropriate errors
## Example Structure

app/
├── actions/
│   └── instagram-upload.ts
├── api/
│   └── dashboard/[slug]/route.ts
└── [slug]/page.tsx
components/
├── ui/                    // shadcn-ui
└── dashboard/            // feature components
services/
├── instagram-service.ts
└── client-service.ts
repositories/
├── client-repository.ts
└── instagram-repository.ts
lib/
└── types/
    ├── instagram/        // Instagram DTOs
    └── client/          // Client DTOs