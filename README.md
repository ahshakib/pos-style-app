# PosBuzz - POS System

A modern Point of Sale (POS) application built with NestJS, PostgreSQL, Prisma, Redis, and React.

## Tech Stack

### Backend
- **NestJS** - Node.js framework
- **PostgreSQL** - Primary database
- **Prisma** - ORM
- **Redis** - Stock locking & caching

### Frontend
- **Vite + React** - Build tool & UI library
- **Ant Design** - UI component library
- **TanStack Query** - Data fetching & caching

## Features

- **Authentication**: Email/password login with JWT
- **Product Management**: Full CRUD with SKU uniqueness
- **Sales**: Transactional sales with stock validation and Redis locking
- **Dashboard**: Stats overview with recent activity

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- npm or yarn

### 1. Start Services

```bash
# Start PostgreSQL and Redis
docker-compose up -d
```

### 2. Setup Backend

```bash
cd apps/backend

# Install dependencies
npm install

# Setup database
npx prisma migrate dev

# Start development server
npm run start:dev
```

Backend runs at: http://localhost:4000

### 3. Setup Frontend

```bash
cd apps/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: http://localhost:5173

## Environment Variables

### Backend (`apps/backend/.env`)

```env
DATABASE_URL="postgresql://posbuzz:posbuzz123@localhost:5432/posbuzz"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key"
```

### Frontend (`apps/frontend/.env`)

```env
VITE_API_URL=http://localhost:4000
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT
- `GET /auth/me` - Get current user (protected)

### Products (Protected)
- `GET /products` - List all products
- `GET /products/:id` - Get single product
- `POST /products` - Create product
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Sales (Protected)
- `GET /sales` - List all sales
- `GET /sales/:id` - Get single sale
- `POST /sales` - Create sale (with stock deduction)

## Project Structure

```
pos-style-app/
├── apps/
│   ├── backend/          # NestJS API
│   │   ├── src/
│   │   │   ├── auth/     # Auth module
│   │   │   ├── products/ # Products module
│   │   │   ├── sales/    # Sales module
│   │   │   ├── prisma/   # Prisma service
│   │   │   └── redis/    # Redis service
│   │   └── prisma/       # Schema & migrations
│   └── frontend/         # React SPA
│       └── src/
│           ├── api/      # API layer
│           ├── components/
│           ├── contexts/
│           └── pages/
├── postman/              # Postman collection
├── docker-compose.yml    # PostgreSQL + Redis
└── README.md
```

## Testing

Import the Postman collection from `postman/posbuzz-api.json` to test all API endpoints.


## License

MIT
