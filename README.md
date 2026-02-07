# Bookmark Manager API

A production-ready bookmark manager API built with NestJS, featuring JWT authentication, folder organization, and tagging capabilities.

## Features

- **JWT Authentication** - Secure user registration and login
- **Folder Organization** - Organize bookmarks into folders
- **Tagging System** - Tag bookmarks for easy categorization
- **Advanced Search** - Filter and search bookmarks
- **Pagination** - Efficient data retrieval
- **Input Validation** - Comprehensive DTO validation
- **Structured Logging** - Winston logger integration
- **Docker Support** - Containerized deployment
- **API Documentation** - Interactive Swagger/OpenAPI docs
- **Unit Tests** - Comprehensive test coverage

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT (Passport)
- **Validation**: class-validator
- **Logging**: Winston
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- pnpm (recommended) or npm

## Quick Start

### 1. Clone and Install

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env
```

### 2. Start with Docker

```bash
# Start PostgreSQL and the application
docker-compose up -d

# View logs
docker-compose logs -f app
```

The API will be available at:

- **API**: http://localhost:3000/v1
- **Swagger Docs**: http://localhost:3000/api/docs

### 3. Local Development

```bash
# Start only PostgreSQL
docker-compose up -d postgres

# Run in development mode
pnpm run start:dev
```

## Environment Variables

See `.env.example` for all available configuration options:

```env
NODE_ENV=development
PORT=3000
API_PREFIX=v1

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=bookmark_manager

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=7d

LOG_LEVEL=info
```

## Testing with Postman

A complete Postman collection is included in `postman_collection.json` with all API endpoints.

### Import the Collection

1. **Open Postman**
2. **Click Import** (top left)
3. **Select** `postman_collection.json` from the project root
4. **Click Import**

### Using the Collection

The collection includes:

- ✅ **Auto-save JWT tokens** - Login/Register automatically saves the token
- ✅ **Auto-save IDs** - Created resources (folders, bookmarks) save their IDs
- ✅ **Environment variables** - Base URL and tokens are managed automatically
- ✅ **All endpoints** - Complete coverage of Auth, Folders, and Bookmarks

### Quick Test Flow

1. **Register User** - Creates account and saves JWT token
2. **Create Folder** - Creates a folder and saves folder ID
3. **Create Bookmark** - Creates a bookmark in the folder
4. **Get All Bookmarks** - View all your bookmarks
5. **Search/Filter** - Test pagination, search, and filtering

All authenticated requests automatically use the saved JWT token!

## API Endpoints

### Authentication

#### Register a New User

```bash
curl -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

Response:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### Login

```bash
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Bookmarks

**Note**: All bookmark endpoints require JWT authentication. Include the token in the Authorization header:

```bash
-H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Create a Bookmark

```bash
curl -X POST http://localhost:3000/v1/bookmarks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "NestJS Documentation",
    "url": "https://docs.nestjs.com",
    "description": "Official NestJS documentation",
    "tags": ["nestjs", "documentation", "backend"],
    "folderId": "folder-uuid-optional"
  }'
```

#### Get All Bookmarks (with filtering)

```bash
# Get all bookmarks
curl -X GET http://localhost:3000/v1/bookmarks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Filter by folder
curl -X GET "http://localhost:3000/v1/bookmarks?folderId=folder-uuid" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Filter by tags
curl -X GET "http://localhost:3000/v1/bookmarks?tags=nestjs,backend" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Search bookmarks
curl -X GET "http://localhost:3000/v1/bookmarks?search=documentation" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Pagination
curl -X GET "http://localhost:3000/v1/bookmarks?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get a Single Bookmark

```bash
curl -X GET http://localhost:3000/v1/bookmarks/{id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Update a Bookmark

```bash
curl -X PUT http://localhost:3000/v1/bookmarks/{id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "tags": ["updated", "tags"]
  }'
```

#### Delete a Bookmark

```bash
curl -X DELETE http://localhost:3000/v1/bookmarks/{id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Folders

#### Create a Folder

```bash
curl -X POST http://localhost:3000/v1/folders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Work Resources",
    "description": "Work-related bookmarks",
    "color": "#FF5733"
  }'
```

#### Get All Folders

```bash
curl -X GET http://localhost:3000/v1/folders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get a Single Folder

```bash
curl -X GET http://localhost:3000/v1/folders/{id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Update a Folder

```bash
curl -X PUT http://localhost:3000/v1/folders/{id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Folder Name",
    "color": "#00FF00"
  }'
```

#### Delete a Folder

```bash
curl -X DELETE http://localhost:3000/v1/folders/{id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Testing

```bash
# Run unit tests
pnpm run test

# Run tests with coverage
pnpm run test:cov

# Run e2e tests
pnpm run test:e2e
```

## CI/CD Pipeline

This project includes a comprehensive GitHub Actions CI/CD pipeline that automatically:

### ✅ On Every Push/PR

- **Lints** code with ESLint
- **Checks** code formatting with Prettier
- **Runs** unit tests with coverage reporting
- **Executes** E2E tests against PostgreSQL
- **Builds** the application
- **Scans** for security vulnerabilities

### 🐳 On Push to Main

- **Builds** Docker image
- **Pushes** to GitHub Container Registry
- **Deploys** to production (configurable)

### On Push to Develop

- **Deploys** to staging environment (configurable)

### Pipeline Configuration

The pipeline is defined in `.github/workflows/`:

- **`ci-cd.yml`** - Main CI/CD pipeline
- **`pr-check.yml`** - Quick validation for pull requests

See [`.github/workflows/README.md`](.github/workflows/README.md) for detailed documentation.

### Required Secrets (Optional)

Add these in GitHub repository settings for full functionality:

- `SNYK_TOKEN` - For security scanning (optional)
- `SLACK_WEBHOOK` - For deployment notifications (optional)

### Pipeline Status

[![CI/CD Pipeline](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci-cd.yml)

## Project Structure

```
src/
├── auth/                    # Authentication module
│   ├── decorators/          # Custom decorators (@Public, @CurrentUser)
│   ├── dto/                 # Data transfer objects
│   ├── guards/              # JWT auth guard
│   ├── strategies/          # Passport JWT strategy
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/                   # Users module
│   ├── entities/            # User entity
│   ├── users.service.ts
│   └── users.module.ts
├── bookmarks/               # Bookmarks module
│   ├── dto/                 # DTOs for CRUD operations
│   ├── entities/            # Bookmark entity
│   ├── bookmarks.controller.ts
│   ├── bookmarks.service.ts
│   └── bookmarks.module.ts
├── folders/                 # Folders module
│   ├── dto/                 # DTOs for CRUD operations
│   ├── entities/            # Folder entity
│   ├── folders.controller.ts
│   ├── folders.service.ts
│   └── folders.module.ts
├── app.module.ts            # Root module
└── main.ts                  # Application entry point
```

## Database Schema

### User

- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password` (String, Hashed)
- `firstName` (String)
- `lastName` (String)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### Bookmark

- `id` (UUID, Primary Key)
- `title` (String)
- `url` (String)
- `description` (String, Optional)
- `tags` (String Array)
- `userId` (UUID, Foreign Key)
- `folderId` (UUID, Foreign Key, Optional)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)
- Unique constraint on `[userId, url]`

### Folder

- `id` (UUID, Primary Key)
- `name` (String)
- `description` (String, Optional)
- `color` (String, Optional)
- `userId` (UUID, Foreign Key)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

## Best Practices Implemented

✅ **Error Handling**: Each database operation wrapped in try-catch blocks
✅ **Logging**: Winston logger used throughout all services
✅ **Validation**: DTO validation with class-validator
✅ **Security**: JWT authentication, password hashing with bcrypt
✅ **Database**: TypeORM with proper relationships and constraints
✅ **Docker**: Multi-stage builds, non-root user, health checks
✅ **Testing**: Unit tests for all services
✅ **Documentation**: Comprehensive Swagger/OpenAPI documentation
✅ **Code Quality**: TypeScript strict mode, proper typing

## Development Workflow

1. **Start the database**:

   ```bash
   docker-compose up -d postgres
   ```

2. **Run in development mode**:

   ```bash
   pnpm run start:dev
   ```

3. **Make changes** - The app will auto-reload

4. **Run tests**:

   ```bash
   pnpm run test
   ```

5. **Build for production**:
   ```bash
   pnpm run build
   ```

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running: `docker-compose ps`
- Check database credentials in `.env`
- Verify database exists: `docker-compose exec postgres psql -U postgres -l`

### Port Already in Use

- Change the `PORT` in `.env` file
- Or stop the process using port 3000

### JWT Token Errors

- Ensure `JWT_SECRET` is set in `.env`
- Check token expiration settings

## License

This project is MIT licensed.
