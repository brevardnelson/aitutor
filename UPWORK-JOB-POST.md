# Caribbean AI Tutor Platform - Project Description

## Project Overview

Caribbean AI Tutor is a comprehensive web-based AI tutoring platform built specifically for Caribbean education systems. The platform provides personalized, AI-powered tutoring for students from Infant 1 through Upper Sixth Form, supporting major Caribbean exams including Common Entrance, SEA, CSEC, and CAPE. It also supports US grade levels (K-13).

The platform connects students, parents, teachers, and school administrators in a unified system where AI adapts to each student's grade level, curriculum, and learning pace.

## What the Platform Does

### For Students
- **AI-Powered Tutoring**: Students select a subject and topic, and an AI tutor guides them through problems step-by-step using the Socratic method. The AI adapts its language, difficulty, and content to match the student's exact grade level.
- **Curriculum-Aligned Content**: Administrators upload actual curriculum documents (textbooks, syllabi, worksheets) for each grade level and subject. The AI reads these documents and generates questions and explanations directly from the curriculum the student is supposed to be learning.
- **Guided Practice & Quick Drills**: Two learning modes - guided practice with detailed AI explanations and step-by-step help, and quick drills for rapid skill-building and exam preparation.
- **Gamification**: Students earn XP points, unlock achievement badges, compete on leaderboards (class, school, and grade-level), complete weekly challenges, and can spend earned XP in a reward shop to stay motivated.

### For Parents
- **Multi-Child Dashboard**: Parents manage multiple children from a single account, each with their own grade level, enrolled subjects, and target exam.
- **Progress Tracking**: View detailed analytics showing mastery levels by topic, accuracy rates, time spent learning, and improvement trends over time.
- **Notifications**: Receive alerts when children earn achievements, struggle with topics, or reach learning milestones.
- **Goal Setting**: Set learning goals for each child and track completion progress.
- **Reward Recommendations**: AI-powered suggestions for rewarding student progress based on their performance patterns.

### For Teachers
- **Class Management**: View class rosters, student performance, and engagement metrics.
- **Class Overview**: Detailed analytics on class-wide performance, identifying students who need extra support.
- **Gamification Insights**: See how gamification features are driving engagement across their classes.
- **Student Alerts**: Automatic alerts when students show signs of struggling or disengagement.

### For Administrators
- **Curriculum Management**: Upload curriculum documents (PDF, Word, TXT, PowerPoint, and images) tagged by grade level, subject, and topic. The system automatically extracts text, generates AI summaries, and makes the content available to the AI tutor for that grade level.
- **School & Class Management**: Create and manage schools, set up classes, assign teachers, and invite users.
- **User Management**: Manage all user accounts with role-based access control across five role levels.
- **AI Training Dashboard**: Track which curriculum documents have been processed and monitor their quality scores.
- **System Analytics**: Platform-wide usage statistics, performance metrics, and engagement data.

## Key Technical Features

### AI Curriculum Pipeline
The platform's core innovation is its curriculum-to-AI pipeline. When an admin uploads a curriculum document for "Standard 5 Mathematics", the system:
1. Stores the file securely in object storage
2. Automatically extracts the text content
3. Generates an AI summary and keywords
4. Makes this content available to the AI tutor

When a Standard 5 student then starts a Math tutoring session, the AI automatically receives the relevant curriculum content and bases its questions, explanations, and guidance on what that student is actually supposed to be learning.

### Comprehensive Gamification System
- **XP & Levels**: Students earn experience points for correct answers, completing sessions, and achieving milestones
- **Badges**: Multi-tier badge system with bronze/silver/gold/diamond rarity levels
- **Challenges**: Auto-generated weekly challenges to maintain engagement
- **Leaderboards**: Rankings at class, school, and grade level with weekly/monthly/all-time views
- **Reward Shop**: Students can spend earned XP on rewards defined by administrators

### Multi-Institutional Architecture
- Schools can be created and managed independently
- Each school has its own classes, teachers, and students
- Role-based access ensures users only see data relevant to their school
- System administrators have platform-wide oversight

### Automated Background Systems
- Weekly challenge auto-generation
- Leaderboard resets and archival (weekly, monthly)
- Daily ranking recalculations
- Parent notification delivery

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Shadcn/ui (Radix UI) |
| Backend | Express.js, Node.js, TypeScript |
| Database | PostgreSQL (40+ tables), Drizzle ORM |
| Authentication | JWT tokens, HTTP-only cookies, Role-Based Access Control (5 roles) |
| AI | OpenAI API, Anthropic API (with automatic failover) |
| File Storage | Object Storage for curriculum documents |
| State Management | TanStack Query (server state), React Context (app state) |
| UI Components | Radix UI primitives, Lucide React icons |

## Database Scale

The PostgreSQL database contains 40+ tables organized across these domains:
- **Users & Authentication** - User accounts, roles, permissions, invitations
- **Students & Families** - Student profiles, subject enrollments, parent-child relationships
- **Schools & Classes** - Institutional hierarchy, class enrollments, teacher assignments
- **Curriculum & Documents** - Document storage, processing, categories, versions, permissions, usage analytics
- **Learning & Progress** - Sessions, problem attempts, progress tracking, topic mastery, daily/weekly activity
- **Assessment** - Exam readiness scores, misconception tracking, class benchmarks, student alerts
- **Gamification** - XP, badges, challenges, leaderboards, wallets, rewards, redemptions
- **Engagement** - Parent/teacher achievements, notifications, engagement metrics

## Grade Systems Supported

### Caribbean
- **Primary**: Infant 1-2, Standard 1-5 (with SEA/11+/PEP preparation at Standard 5)
- **Secondary**: Form 1-3, Form 4-5 (CSEC), Lower & Upper 6th Form (CAPE)

### US
- Kindergarten through Grade 13

## Current State

The application is fully functional with:
- Complete authentication and authorization system
- Working AI tutoring with curriculum context injection
- Full gamification infrastructure (XP, badges, challenges, leaderboards)
- Parent dashboard with child management and progress tracking
- Teacher dashboard with class analytics
- Admin dashboard with curriculum upload, school management, and user management
- Landing page with marketing content and signup flows
- Background automation for challenges and leaderboards

## Hosting

Currently hosted on Replit with:
- PostgreSQL database (Neon-backed)
- Object storage for curriculum file uploads
- Automatic SSL and domain management
- Deployment tools with VM-based hosting (for background task support)

## Documentation

A detailed `DEPLOYMENT.md` file is included in the project root with:
- Complete API route documentation (60+ endpoints)
- Database schema details for all 40+ tables
- Environment variable requirements
- Build and deploy commands
- Frontend and backend file structure
- Security features and middleware documentation
