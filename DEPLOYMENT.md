# Caribbean AI Tutor - Technical Deployment Guide

## Stack Overview

- **Frontend**: React 18 + TypeScript, built with Vite
- **Backend**: Express.js (Node.js) with TypeScript
- **Database**: PostgreSQL (Neon-backed on Replit)
- **ORM**: Drizzle ORM with Drizzle-Zod for validation
- **Authentication**: JWT token-based auth with secure cookie storage
- **File Storage**: Replit Object Storage for curriculum document uploads
- **AI Providers**: OpenAI and Anthropic APIs for tutoring responses
- **UI Framework**: Shadcn/ui components built on Radix UI primitives + Tailwind CSS

## Architecture

Two servers run concurrently during development via `npm run dev:full` (using `concurrently`):

1. **Vite Dev Server** (port 5000, configured in vite.config.ts) - Serves the React frontend with hot module replacement
2. **Express API Server** (port 3001 by default, configurable via `PORT` env var) - Handles all backend API requests

In production, Vite builds static assets to `dist/public/` and Express serves everything from a single port.

### Route Registration (server/index.ts)

All API routes are registered via Express routers and direct route registration:

```
/api/auth/*       -> server/auth-routes.ts (signup, signin, me, logout, invite, create-system-admin)
/api/admin/*      -> server/admin-routes.ts (system-stats, schools, school-users, current-user)
/api/teacher/*    -> server/teacher-routes.ts (classes, class overview, students, gamification)
/api/parent/*     -> server/parent-api-routes.ts (children CRUD, progress, notifications, badges, recommendations)
/api/admin/documents/* -> server/document-routes.ts (document upload, listing, management, AI training)
/api/gamification/*   -> server/gamification-routes.ts (badges, challenges, XP, leaderboards, levels, stats)
/api/dashboard/*      -> server/index.ts (dashboard data by child/subject)
/api/sessions/*       -> server/index.ts (learning session start, end, abandon, problem-attempt)
/api/curriculum/*     -> server/index.ts (curriculum document retrieval for AI context)
```

## Database Schema (PostgreSQL)

All tables are defined in `shared/schema.ts` using Drizzle ORM. Never write manual SQL migrations.

### Core User Tables
- **users** - All user accounts with email, password hash, full_name, phone, role
- **user_roles** - Role assignments (system_admin, school_admin, teacher, parent, student) with school_id scoping

### Student & Family
- **students** - Student profiles linked to parent accounts, with gradeLevel, targetExam, subjects, and school enrollment
- **student_profiles** - Extended student profile data (learning style, strengths, weaknesses)
- **student_subject_enrollments** - Maps students to their enrolled subjects

### Institutional Hierarchy
- **schools** - School records with name, address, contact info, settings
- **classes** - Classes within schools, linked to teachers and grade levels
- **class_enrollments** - Student enrollment in classes with status tracking
- **teacher_schools** - Links teachers to schools
- **student_schools** - Links students to schools
- **teacher_assignments** - Teacher-created assignments
- **assignment_submissions** - Student submissions for assignments
- **invitations** - System for inviting users to join schools

### Curriculum & AI Documents
- **curriculum_documents** - Uploaded curriculum files with extracted text, AI summaries, grade level, subject, topic metadata, processing status, quality scores, file storage path
- **document_categories** - Categories for organizing curriculum content
- **document_versions** - Version history for curriculum documents
- **document_permissions** - Access control for documents per school
- **ai_training_sessions** - Track AI training sessions with model provider, objective, progress, accuracy
- **document_usage_analytics** - Track how documents are used in tutoring sessions
- **content_templates** - Reusable content templates for generating materials

### Learning & Progress
- **learning_sessions** - Track student practice sessions (start time, end time, subject, topic, score, duration)
- **problem_attempts** - Individual question attempts within sessions (question, answer, correct/incorrect, time spent, difficulty)
- **progress** - Per-subject progress tracking for each student
- **topic_mastery** - Detailed per-topic mastery levels with accuracy and problem counts
- **daily_activity** - Daily activity tracking per student
- **weekly_engagement** - Weekly engagement metrics

### Assessment & Analytics
- **exam_readiness** - Exam preparation readiness scores by subject and exam type
- **alerts** - System alerts for students needing attention
- **milestones** - Student milestone achievements
- **misconceptions** - Common misconception tracking for targeted remediation
- **class_benchmarks** - Class-level performance benchmarks
- **student_alerts** - Student-specific alerts for teachers
- **class_analytics** - Aggregated class performance analytics

### Gamification
- **student_xp** - Current XP balance, level, and lifetime stats per student
- **xp_transactions** - XP earning/spending history with reasons
- **badge_definitions** - Badge types with criteria, icons, and rarity levels
- **student_badges** - Badges earned by students
- **challenges** - Weekly/special challenges with start/end dates and criteria
- **challenge_participation** - Student participation and progress in challenges
- **leaderboards** - Leaderboard configurations (by class, school, grade) with time periods (weekly, monthly, all-time)
- **leaderboard_entries** - Individual student rankings and scores
- **student_wallets** - Virtual currency balance for reward redemption
- **reward_catalog** - Available rewards students can redeem
- **reward_redemptions** - Reward redemption history
- **gamification_notifications** - In-app gamification notifications

### Parent & Teacher Engagement
- **parent_goals** - Learning goals set by parents for their children
- **parent_engagement** - Parent engagement metrics and activity tracking
- **parent_achievements** - Achievement badges for active parents
- **teacher_achievements** - Achievement badges for teachers

### Schema Management

```bash
npm run db:push          # Push schema changes to database
npm run db:push --force  # Force push if data-loss warning appears
```

## Authentication System

- **JWT tokens** stored in HTTP-only cookies with configurable expiration
- **RBAC (Role-Based Access Control)** with hierarchical roles:
  - `system_admin` - Full platform access
  - `school_admin` - School-level management
  - `teacher` - Class and student management
  - `parent` - Child management and progress viewing
  - `student` - Learning interface access
- **Permissions system** maps roles to granular permissions (MANAGE_TEACHERS, MANAGE_PARENTS, VIEW_ANALYTICS, UPLOAD_DOCUMENTS, etc.)
- **Two auth contexts** on the frontend:
  - `AuthContext` (`src/contexts/AuthContext.tsx`) - Parent/student login flow
  - `RBACContext` (`src/contexts/RBACContext.tsx`) - Admin/teacher login flow with role-based UI rendering
- **Rate limiting** on authentication endpoints (signup, signin)

## AI Integration Pipeline

### How Curriculum Flows to the AI

1. **Admin uploads** curriculum documents via the Admin Dashboard > Curriculum tab
   - Endpoint: `POST /api/admin/documents/upload` (multipart form with file + JSON metadata)
   - Supports PDF, Word (.doc/.docx), TXT, PowerPoint (.ppt/.pptx), and images (.jpg/.jpeg/.png/.gif)
   - Files stored in Replit Object Storage with secure access policies

2. **Server processes documents** automatically after upload (`processDocumentContent` in document-routes.ts):
   - Extracts text content based on file type
   - Generates AI summary using OpenAI
   - Extracts keywords for searchability
   - Calculates content quality score
   - Marks document as `isProcessed: true` when complete

3. **Student starts a tutoring session**:
   - `GuidedTutor` component fetches `GET /api/curriculum/{gradeLevel}/{subject}?topic=...`
   - Server calls `storage.getCurriculumDocuments()` to query for matching processed, active documents (limit 10)
   - Returns extracted text, AI summaries, and keywords

4. **AI prompt construction** (in `src/lib/ai-service.ts`):
   - Student's grade level and target exam are included in the prompt
   - Curriculum content (summaries + extracted text) is injected as context
   - System prompt instructs AI to base questions on the actual curriculum
   - AI generates age-appropriate questions aligned to the student's level

### AI Model Configuration

- Subject-specific model routing defined in `src/lib/ai-service.ts`
- Automatic fallback between OpenAI and Anthropic if primary fails
- Models configurable per subject (e.g., different models for Math vs English)

## Environment Variables Required

| Variable | Purpose | Required |
|----------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `PGHOST` | PostgreSQL host | Yes |
| `PGPORT` | PostgreSQL port | Yes |
| `PGUSER` | PostgreSQL username | Yes |
| `PGPASSWORD` | PostgreSQL password | Yes |
| `PGDATABASE` | PostgreSQL database name | Yes |
| `JWT_SECRET` | Secret for signing JWT tokens | Yes |
| `SESSION_SECRET` | Express session secret | Yes |
| `OPENAI_API_KEY` | OpenAI API access for AI tutoring and document processing | Yes (for AI features) |
| `ANTHROPIC_API_KEY` | Anthropic API access (backup/alternative AI provider) | Optional |

## Complete API Routes

### Authentication (`/api/auth/*`)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/signup` | Create new account (rate limited) |
| POST | `/api/auth/signin` | Sign in with email/password (rate limited) |
| GET | `/api/auth/me` | Get current authenticated user |
| POST | `/api/auth/logout` | Sign out, clears cookie |
| POST | `/api/auth/invite` | Invite a user to a school (school admin+) |
| POST | `/api/auth/complete-invitation` | Complete invitation signup |
| POST | `/api/auth/create-system-admin` | Create system admin account |

### Parent API (`/api/parent/*`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/parent/children` | List children for authenticated parent |
| POST | `/api/parent/children` | Add a new child/student profile |
| GET | `/api/parent/children/:id` | Get child details |
| PUT | `/api/parent/children/:id` | Update child profile |
| DELETE | `/api/parent/children/:id` | Remove child profile |
| GET | `/api/parent/children/:id/progress` | Get child's learning progress |
| GET | `/api/parent/notifications` | Get parent notifications |
| POST | `/api/parent/notifications/:id/read` | Mark notification as read |
| GET | `/api/parent/badges` | Get all badge definitions |
| GET | `/api/parent/badges/:studentId` | Get badges for a specific child |
| GET | `/api/parent/recommendations/:studentId` | Get AI reward recommendations |
| POST | `/api/parent/recommendations/:studentId/track` | Track recommendation actions |
| POST | `/api/parent/test-notification/:studentId` | Send test notification |
| GET | `/api/parent/engagement` | Get parent engagement metrics |

### Learning Sessions (direct routes in `server/index.ts`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/dashboard/:childId/:subject` | Get dashboard data for a child's subject |
| POST | `/api/sessions/start` | Start a new learning session |
| POST | `/api/sessions/:sessionId/end` | End a session with score |
| POST | `/api/sessions/:sessionId/abandon` | Abandon a session |
| POST | `/api/sessions/:sessionId/problem-attempt` | Record a problem attempt |

### Curriculum
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/curriculum/:gradeLevel/:subject` | Fetch curriculum docs for AI context |

### Admin (`/api/admin/*`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/system-stats` | System-wide statistics (system admin) |
| GET | `/api/admin/schools` | List all schools |
| POST | `/api/admin/schools` | Create a new school |
| GET | `/api/admin/school-users/:schoolId` | List users in a school |
| GET | `/api/admin/current-user` | Get current admin user details |

### Admin - Document Management (`/api/admin/documents/*`)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/admin/documents/upload` | Upload curriculum document (rate limited) |
| GET | `/api/admin/documents` | List documents with filters/pagination |
| GET | `/api/admin/documents/:id` | Get document details |
| PUT | `/api/admin/documents/:id` | Update document metadata |
| DELETE | `/api/admin/documents/:id` | Soft delete document (system admin only) |
| GET | `/api/admin/documents/:id/download` | Secure document download |
| GET | `/api/admin/documents/:id/processing` | Check processing status |
| GET | `/api/admin/document-categories` | List document categories |
| POST | `/api/admin/document-categories` | Create new category |
| POST | `/api/admin/ai-training` | Create AI training session |
| GET | `/api/admin/ai-training` | List training sessions |

### Teacher (`/api/teacher/*`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/teacher/classes` | List teacher's classes |
| GET | `/api/teacher/class/:classId/overview` | Get class overview with analytics |
| GET | `/api/teacher/class/:classId/students` | List students in a class |
| GET | `/api/teacher/class/:classId/gamification` | Get gamification data for a class |

### Gamification (`/api/gamification/*`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/gamification/badges` | List all badge definitions |
| GET | `/api/gamification/badges/student/:studentId` | Get student's earned badges |
| POST | `/api/gamification/badges/award` | Award a badge to a student |
| POST | `/api/gamification/badges/progress` | Update badge progress |
| GET | `/api/gamification/challenges` | List active challenges |
| GET | `/api/gamification/challenges/:challengeId` | Get challenge details |
| POST | `/api/gamification/challenges/:challengeId/join` | Join a challenge |
| GET | `/api/gamification/challenges/student/:studentId` | Get student's challenges |
| GET | `/api/gamification/challenges/:challengeId/leaderboard` | Challenge leaderboard |
| POST | `/api/gamification/challenges` | Create a new challenge |
| GET | `/api/gamification/xp/:studentId` | Get student's XP and level |
| POST | `/api/gamification/xp/earn` | Earn XP (called after correct answers) |
| POST | `/api/gamification/xp/spend` | Spend XP on rewards |
| GET | `/api/gamification/xp/:studentId/transactions` | XP transaction history |
| GET | `/api/gamification/leaderboards` | List leaderboards (class/school/grade) |
| GET | `/api/gamification/leaderboards/:leaderboardId/entries` | Get leaderboard entries |
| GET | `/api/gamification/students/:studentId/leaderboard-positions` | Student's positions across leaderboards |
| GET | `/api/gamification/leaderboards/history` | Historical leaderboard data |
| GET | `/api/gamification/leaderboard` | General leaderboard view |
| GET | `/api/gamification/levels/:studentId` | Get student's level info |
| POST | `/api/gamification/admin/reset-weekly-xp` | Admin: reset weekly XP |
| GET | `/api/gamification/stats/:studentId` | Get student's gamification stats |

## Automation Systems

The server runs several automated background tasks (initialized on startup in `server/index.ts`):

- **Weekly Challenge Generation** - Creates new challenges every Monday at 12:01 AM
- **Weekly Leaderboard Reset** - Resets weekly XP, archives old leaderboards, creates new leaderboards for all classes/schools/grades every Sunday at midnight
- **Daily Leaderboard Updates** - Recalculates rankings daily at 11:00 PM
- **Monthly Leaderboard Creation** - Archives monthly standings on the 1st of each month at 12:30 AM

These run as in-process timers using `setTimeout`/`setInterval` (not separate cron jobs), so they require the server to be running continuously. For production deployment, use a deployment target that keeps the server always running (e.g., Replit's "VM" deployment type, not "autoscale").

## Frontend Structure

```
src/
├── pages/
│   └── Index.tsx                    # Main entry point, handles auth flow
├── components/
│   ├── auth/
│   │   ├── AuthForm.tsx             # Parent/student login + landing page
│   │   ├── RBACLoginForm.tsx        # Admin/teacher login form
│   │   └── RoleGuard.tsx            # Role-based component rendering
│   ├── admin/
│   │   ├── AdminDashboard.tsx       # Admin dashboard with 5 tabs (Overview, Schools, Users, Curriculum, Classes)
│   │   ├── DocumentManagement.tsx   # Curriculum upload, management, AI training, and analytics
│   │   ├── ObjectUploader.tsx       # File upload component using Replit Object Storage
│   │   ├── SchoolManagement.tsx     # School CRUD operations
│   │   ├── UserManagement.tsx       # User CRUD with role assignment
│   │   └── SystemOverview.tsx       # System-wide stats and metrics
│   ├── tutor/
│   │   ├── GuidedTutor.tsx          # Main AI tutoring interface with curriculum context injection
│   │   └── TutorInterface.tsx       # Tutor wrapper with topic selection
│   ├── teacher/
│   │   └── TeacherDashboard.tsx     # Teacher view with class management
│   └── SubjectSelector.tsx          # Subject selection screen for students
├── contexts/
│   ├── AuthContext.tsx              # Parent/student auth state
│   ├── AppContext.tsx               # Global app state (current child, view, subject)
│   └── RBACContext.tsx              # Admin/teacher auth + roles + permissions
├── lib/
│   ├── ai-service.ts               # Multi-model AI service with curriculum context
│   ├── auth.ts                     # Auth utility functions
│   ├── rbac-auth.ts                # RBAC authentication utilities
│   ├── rbac-auth-api.ts            # RBAC API client
│   └── queryClient.ts              # TanStack Query configuration
├── services/
│   └── learning-tracker.ts         # Session tracking API client
└── types/
    └── auth.ts                     # Auth types, roles, permissions definitions
```

### Key Server Files

```
server/
├── index.ts                        # Main server entry point, route registration, automation init
├── auth-routes.ts                  # Authentication endpoints
├── auth-middleware.ts              # JWT verification and role-checking middleware
├── auth.ts                         # Password hashing and JWT utilities
├── admin-routes.ts                 # Admin management endpoints
├── teacher-routes.ts               # Teacher dashboard endpoints
├── parent-api-routes.ts            # Parent/child management endpoints
├── document-routes.ts              # Curriculum document upload, management, and AI training
├── gamification-routes.ts          # XP, badges, challenges, leaderboards
├── gamification-hooks.ts           # Auto-triggered gamification events
├── storage.ts                      # Database access layer (IStorage interface)
├── objectStorage.ts                # Replit Object Storage service
├── objectAcl.ts                    # Object storage access control
├── resource-authorization.ts       # Resource-level authorization
├── id-validation-middleware.ts     # Input validation for IDs
├── parent-badge-service.ts         # Parent achievement processing
├── parent-notification-service.ts  # Email/notification service for parents
└── redemption-recommendation-service.ts # AI reward recommendation engine
```

## Build & Deploy Commands

```bash
npm install              # Install all dependencies
npm run db:push          # Push schema changes to database
npm run dev:full         # Start development (Vite + Express via concurrently)
npm run dev              # Start Vite dev server only (port 5000)
npm run dev:server       # Start Express API server only (port 3001)
npm run build            # Build for production (Vite frontend + esbuild backend)
npm run start            # Start production server
```

### Production Deployment on Replit

Use the **"VM"** deployment type (not "autoscale") because the server runs background automation tasks that need to stay running continuously.

Build command: `npm run build`
Run command: `npm run start`

## Grade Systems Supported

### US Grades
Kindergarten (K), Grade 1 through Grade 13

### Caribbean Primary
- Infant 1, Infant 2
- Standard 1, Standard 2, Standard 3, Standard 4
- Standard 5 (SEA/11+/PEP preparation)

### Caribbean Secondary
- Form 1, Form 2, Form 3
- Form 4 (CSEC Preparation)
- Form 5 (CSEC Exams)
- Lower 6th Form (CAPE Year 1)
- Upper 6th Form (CAPE Year 2)

## Demo Accounts

Demo parent accounts were seeded during initial setup. Check the database `users` table for current accounts. New admin accounts can be created via the `POST /api/auth/create-system-admin` endpoint.

## Security Features

- All API routes use JWT authentication middleware (`authenticateToken`)
- Role-based middleware: `requireSystemAdmin`, `requireSchoolAdmin`, `requireTeacherOrAbove`, `requireParentOrAbove`
- Admin document routes require system_admin or school_admin roles
- File uploads validated for type, size, and content (using `file-type` detection)
- Rate limiting on authentication and upload endpoints
- Documents are soft-deleted (marked inactive, not physically removed)
- Object storage uses secure access policies
- Passwords hashed with bcrypt before storage
- CORS configured with credentials support
- Input validation using Zod schemas throughout
- SQL injection prevention via Drizzle ORM parameterized queries
