================================================================================
                    VACATION MANAGEMENT INTERFACE
================================================================================

A full-stack web application for managing employee vacation requests.
Includes separate interfaces for employees (requesters) and managers (validators).

================================================================================
                          WHAT YOU NEED
================================================================================

1. Docker & Docker Compose (required for database and containerized deployment)
   Download: https://www.docker.com/products/docker-desktop/

2. Node.js 18+ (optional, for local development only)
   Download: https://nodejs.org/

================================================================================
                          QUICK START
================================================================================

OPTION 1: START WITH DOCKER (RECOMMENDED - EVERYTHING RUNS IN CONTAINERS)
--------------------------------------------------------------------------

1. Open terminal in the project root directory (home-project/)

2. Run with tests first (recommended):
   
   npm run start:with-tests

   This will:
   - Run all tests in isolated environment
   - Start production containers if tests pass
   - Set up database, migrations, and seed data automatically

3. Access the application:
   - Frontend:  http://localhost:5173
   - Backend:   http://localhost:3000
   - Database:  http://localhost:8080 (Adminer)

OPTION 2: START WITHOUT TESTS
------------------------------

If you want to skip tests and start directly:

   docker-compose up -d

Or rebuild and start:

   docker-compose up --build -d



================================================================================
                         ACCESSING THE APPLICATION
================================================================================

REQUESTER INTERFACE (Employees submit vacation requests):
   http://localhost:5173/requester

VALIDATOR DASHBOARD (Managers approve/reject requests):
   http://localhost:5173/validator

BACKEND API:
   http://localhost:3000
   Health check: http://localhost:3000/health

DATABASE ADMIN (Adminer):
   http://localhost:8080
   - Server: postgres
   - Username: vacation_user
   - Password: vacation_pass
   - Database: vacation_management_dev

================================================================================
                         DEFAULT TEST USERS
================================================================================

After seeding, these users are available:

- John Doe (Requester) - john.doe@example.com
- Jane Smith (Requester) - jane.smith@example.com
- Manager Bob (Validator) - manager.bob@example.com

Use these to test the application.

================================================================================
                         USEFUL COMMANDS
================================================================================

VIEW LOGS:
   npm run logs              # All services
   npm run logs:server       # Server only
   npm run logs:client       # Client only

STOP CONTAINERS:
   npm stop                  # Stop all containers
   npm run stop:clean        # Stop and remove volumes

RUN TESTS ONLY:
   npm test                  # Run tests in isolated environment

RESTART EVERYTHING:
   docker-compose down -v    # Stop and clean
   docker-compose up -d      # Start fresh

================================================================================
                         TECHNOLOGY STACK
================================================================================

FRONTEND:
   - Vue.js 3 (Framework)
   - Vue Router (Routing)
   - Axios (HTTP client)
   - Vite (Build tool)

BACKEND:
   - Node.js + Express (Server)
   - TypeScript (Language)
   - Sequelize (ORM)
   - Zod (Validation)
   - Jest + Supertest (Testing)

DATABASE:
   - PostgreSQL 15

DEPLOYMENT:
   - Docker & Docker Compose


================================================================================
                         PROJECT STRUCTURE
================================================================================

home-project/
├── client/                 Vue.js frontend application
├── server/                 Node.js backend API
├── docker-compose.yml      Production environment setup
├── docker-compose.test.yml Test environment setup
├── package.json            Root-level npm scripts
├── README.txt              This file (quick reference)


================================================================================
                    TECHNICAL DECISIONS & ARCHITECTURE
================================================================================

This section documents the key technical decisions made during the development
of this vacation management system.

--------------------------------------------------------------------------------
1. BACKEND ARCHITECTURE
--------------------------------------------------------------------------------

LANGUAGE & RUNTIME:
   - TypeScript on Node.js
   - Decision: TypeScript provides type safety, better IDE support, and reduces
     runtime errors. The strict mode configuration ensures maximum type safety.
   - ESNext modules used for modern JavaScript features and better tree-shaking.

FRAMEWORK:
   - Express.js
   - Decision: Lightweight, mature, and widely adopted. Perfect for RESTful APIs
     with extensive middleware ecosystem.

ORM & DATABASE ACCESS:
   - Sequelize ORM with PostgreSQL
   - Decision: 
     * Sequelize provides robust ORM features with migration support
     * TypeScript support through type definitions
     * Handles complex relationships (User -> VacationRequest)
     * Built-in query builder with protection against SQL injection
   
DATABASE MODELS:
   
   Users Table:
   - id: UUID (primary key) - Better for distributed systems than auto-increment
   - name: String - Employee full name
   - role: ENUM('Requester', 'Validator') - Role-based access control
   - email: String (unique) - Used as natural key for user identification
   - timestamps: created_at, updated_at (automatic)
   
   VacationRequests Table:
   - id: UUID (primary key)
   - user_id: UUID (foreign key -> users.id, CASCADE on delete)
   - start_date: DATEONLY - No time component needed for vacation days
   - end_date: DATEONLY
   - reason: TEXT (nullable) - Optional explanation
   - status: ENUM('Pending', 'Approved', 'Rejected') - State machine pattern
   - comments: TEXT (nullable) - Manager feedback
   - timestamps: created_at, updated_at (automatic)
   - UNIQUE INDEX: (user_id, start_date, end_date) - Prevents duplicate requests
   
   Relationship: One-to-Many (User -> VacationRequest)
   - CASCADE delete: When user deleted, their requests are removed
   - Bidirectional navigation in ORM for efficient queries

ARCHITECTURE PATTERN:
   - Layered Architecture (Controller -> Service -> Model)
   - Decision:
     * Controllers: Handle HTTP requests/responses, validation
     * Services: Business logic, data manipulation
     * Models: Database schema and relationships
     * Mappers: Transform database entities to DTOs for API responses
   
   Benefits:
   - Clear separation of concerns
   - Easy to test each layer independently
   - Business logic isolated from HTTP layer
   - Can swap implementations without affecting other layers

VALIDATION:
   - Zod schema validation (planned for backend)
   - Decision: Runtime type checking with TypeScript integration
   - Currently: Manual validation in services with business rules

ERROR HANDLING:
   - Centralized error middleware
   - Service layer throws errors, controller layer catches and formats
   - Consistent error response format: { success, error, data }

API DESIGN:
   - RESTful principles
   - Endpoints:
     * GET  /requests         - List all requests (with filters)
     * POST /requests         - Create new request
     * POST /requests/handle-request - Approve/reject request
     * GET  /users/requesters - List employees
     * GET  /health          - Health check endpoint
   
   Response Format:
   {
     "success": boolean,
     "message": string,
     "data": object | array,
     "error": string (if failed)
   }

MIDDLEWARE:
   - CORS: Configured for frontend origin (localhost:5173)
   - express.json(): Parse JSON request bodies
   - express.urlencoded(): Parse URL-encoded data
   - Error handler: Catch-all for unhandled errors

ENVIRONMENT CONFIGURATION:
   - dotenv for environment variables
   - Separate configs for development, test, production
   - Database connection via DATABASE_URL

--------------------------------------------------------------------------------
2. FRONTEND ARCHITECTURE
--------------------------------------------------------------------------------

FRAMEWORK:
   - Vue.js 3 (Composition API)
   - Decision:
     * Composition API provides better TypeScript support
     * More flexible code organization than Options API
     * Better logic reuse with composables
     * Reactive system simplifies state management

BUILD TOOL:
   - Vite
   - Decision:
     * Lightning-fast HMR (Hot Module Replacement)
     * Native ESM support
     * Optimized production builds
     * Better developer experience than Webpack

ROUTING:
   - Vue Router 4
   - Decision: Official Vue.js router with TypeScript support
   - Routes:
     * / (redirect to /requester)
     * /requester - Employee interface
     * /validator - Manager interface
   
HTTP CLIENT:
   - Axios
   - Decision:
     * Promise-based API
     * Automatic JSON transformation
     * Interceptor support for global error handling
     * Better error handling than fetch API
     * Centralized API client configuration

VALIDATION:
   - Zod for form validation
   - Decision:
     * TypeScript-first schema validation
     * Runtime type checking
     * Clear error messages
     * Integrates well with Vue forms
   
   Validation Rules:
   - Start date cannot be in the past
   - End date must be after start date
   - Employee selection required
   - Validated before API call (client-side)

COMPONENT STRUCTURE:
   - Views: Page-level components (RequesterView, ValidatorView)
   - Components: Reusable UI components (Navigation)
   - Composition API with <script setup> syntax
   - Scoped CSS for style isolation

STATE MANAGEMENT:
   - Local component state with Vue reactivity (ref, reactive)
   - Decision: No global state manager needed for this app size
   - Each view manages its own state independently

API LAYER:
   - Centralized API functions in /api directory
   - Typed request/response interfaces
   - Separation between API calls and component logic

TYPE SAFETY:
   - Shared TypeScript types between API and components
   - Interfaces for: User, VacationRequest, API responses
   - Full type checking with vue-tsc

--------------------------------------------------------------------------------
3. DATABASE DESIGN
--------------------------------------------------------------------------------

DATABASE CHOICE:
   - PostgreSQL 15
   - Decisions:
     * Mature, reliable, open-source RDBMS
     * Excellent support for complex queries
     * ACID compliance for data integrity
     * UUID support for distributed systems
     * ENUM types for status fields
     * Strong community and ecosystem

SCHEMA DESIGN PRINCIPLES:
   
   Normalization:
   - Third normal form (3NF) achieved
   - No redundant data
   - Users table separate from requests
   
   Data Integrity:
   - Foreign key constraints with CASCADE
   - UNIQUE constraint on (user_id, start_date, end_date)
   - NOT NULL constraints on required fields
   - ENUM types prevent invalid status values
   
   Indexing Strategy:
   - Primary keys: UUID with B-tree index (automatic)
   - Unique index: (user_id, start_date, end_date) for duplicate prevention
   - Foreign key index: user_id in vacation_requests (automatic)
   
   Performance Considerations:
   - DATEONLY type instead of TIMESTAMP for date fields (less storage)
   - UUID v4 for distributed-friendly IDs
   - Eager loading with Sequelize includes for N+1 prevention

MIGRATIONS:
   - Sequelize migrations for version-controlled schema changes
   - Migration files in /migrations directory
   - Seeders for test data in /seeders directory

--------------------------------------------------------------------------------
4. INFRASTRUCTURE & DEPLOYMENT
--------------------------------------------------------------------------------

CONTAINERIZATION:
   - Docker & Docker Compose
   - Decision:
     * Consistent environment across dev/test/prod
     * Easy setup for new developers
     * Isolated services with networking
     * Version pinning for reproducibility

DOCKER ARCHITECTURE:
   
   Services:
   1. postgres (Database)
      - Image: postgres:15-alpine (minimal size)
      - Volume: Persistent data storage
      - Healthcheck: pg_isready for startup coordination
   
   2. server (Backend API)
      - Custom Dockerfile (Node.js 22 Alpine)
      - Health check: wget to /health endpoint
      - Wait for database before starting
      - Automatic migrations on startup
   
   3. client (Frontend)
      - Custom Dockerfile (Node.js 22 Alpine)
      - Wait for server before starting
      - Development mode with hot reload
   
   4. adminer (Database UI)
      - Official Adminer image
      - Database management interface
   
   Networking:
   - Custom bridge network (vacation_net)
   - Services communicate via service names
   - Only necessary ports exposed to host

ORCHESTRATION STRATEGY:
   - Health checks on each service
   - Dependency management with depends_on + condition: service_healthy
   - Startup order: postgres -> server (with migrations) -> client
   - Automatic retries on failure

VOLUME STRATEGY:
   - Named volume for PostgreSQL data (persistence)
   - Bind mounts for source code (hot reload in development)
   - Anonymous volumes for node_modules (avoid host OS conflicts)

TESTING INFRASTRUCTURE:
   - Separate docker-compose.test.yml
   - Isolated test environment with different ports
   - Run tests before starting production containers
   - Clean up test containers after tests complete

DEVELOPMENT WORKFLOW:
   - npm run start:with-tests - Run tests, then start if passing
   - docker-compose up - Start without tests
   - Hot reload enabled for both client and server
   - Source code mounted as volumes for instant changes


--------------------------------------------------------------------------------
5. SECURITY CONSIDERATIONS
--------------------------------------------------------------------------------

   - CORS restricted to specific frontend origin
   - SQL injection prevention via Sequelize parameterized queries
   - Input validation on both client and server
   - UUID usage prevents sequential ID guessing
   - No authentication implemented (out of scope for this demo)
   - Environment variables for sensitive configuration

--------------------------------------------------------------------------------
6. SCALABILITY CONSIDERATIONS
--------------------------------------------------------------------------------

   - Stateless backend enables horizontal scaling
   - Database connection pooling (Sequelize default)
   - Indexes on frequently queried fields
   - Layered architecture allows microservices split if needed
   - Docker containers ready for orchestration (Kubernetes, ECS)
   - Health checks enable load balancer integration


