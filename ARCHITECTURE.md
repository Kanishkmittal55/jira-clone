# Software Architecture Documentation

## System Overview
A full-stack Jira clone built with Next.js App Router, featuring agile project management capabilities including sprint planning, issue tracking, and kanban boards.

## Tech Stack
- **Frontend**: Next.js 13.5.11 (App Router), React 18.2.0, TypeScript 5.9.2
- **Styling**: Tailwind CSS 3.3.1, Radix UI components
- **Authentication**: Clerk v6.32.0 (OAuth, session management)
- **Database**: PostgreSQL with Prisma ORM 4.12.0
- **State Management**: TanStack Query v4.29.12 (server state)
- **Editor**: Lexical rich text editor
- **Rate Limiting**: Upstash Redis
- **UI/UX**: React Beautiful DnD, React Hot Toast

## Application Entry Points

### 1. Web Routes (`/app`)
- **Authentication**: `/sign-in`, `/sign-up` - Clerk-powered auth flows
- **Main App**: `/project/*` - Protected routes requiring authentication
  - `/project/backlog` - Sprint planning and issue management
  - `/project/board` - Kanban board view
  - `/project/roadmap` - Epic and roadmap visualization
- **SSO Callback**: `/project/backlog/sso-callback` - OAuth redirect handler

### 2. API Routes (`/app/api`)
- **Issues**: `/api/issues` - CRUD operations for tickets/stories
- **Sprints**: `/api/sprints` - Sprint lifecycle management
- **Projects**: `/api/project` - Project and member management
- **Comments**: `/api/issues/[issueId]/comments` - Issue discussions

## Core Architecture Patterns

### Authentication Flow
```
User → Clerk OAuth → Middleware → Protected Routes → API (getAuth validation)
```

### Data Flow
```
UI Components → TanStack Query → API Routes → Prisma → PostgreSQL
```

### File Structure
- `/app` - Next.js App Router pages and API routes
- `/components` - Reusable React components organized by feature
- `/hooks` - Custom React hooks for data fetching and state
- `/server` - Database utilities and server-side functions
- `/utils` - Shared utilities, types, and helpers

## Key Components
- **Issue Management**: Create, update, assign, and track development tasks
- **Sprint Planning**: Organize work into time-boxed iterations
- **Kanban Board**: Visual workflow management with drag-and-drop
- **User Management**: Team member assignment and project access
- **Rich Text Editing**: Lexical-powered issue descriptions and comments

## Security & Performance
- **Authentication**: Clerk middleware protects all `/project/*` routes
- **Rate Limiting**: Upstash Redis prevents API abuse
- **Database**: Prisma provides type-safe database access with connection pooling
- **Caching**: TanStack Query handles client-side data caching and synchronization

## Development Workflow
- **Local Development**: `npm run dev` with PostgreSQL database
- **Database Management**: Prisma migrations and seeding
- **Type Safety**: Full TypeScript coverage with strict mode enabled
- **Code Quality**: ESLint, Prettier, and Tailwind CSS configuration
