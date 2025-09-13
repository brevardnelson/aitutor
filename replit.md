# Interactive Math AI Tutor

## Overview

This is a web-based AI platform designed to guide students through math problems for high school exam preparation using a Socratic teaching method. The application provides interactive tutoring sessions with step-by-step guidance, practice tests, and progress tracking for students preparing for various high school entrance exams.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and component-based architecture
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Components**: Shadcn/ui component library built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS for utility-first styling with custom CSS variables for theming
- **State Management**: React Context API for global application state (user authentication, current child selection, progress tracking)
- **Routing**: React Router for client-side navigation between authentication, dashboard, and tutor interfaces

### Component Structure
- **Layout Components**: Modular layout system with `AppLayout` as the main router between views
- **Authentication**: Simple parent account creation and management
- **Dashboard**: Multi-child management with progress visualization and navigation
- **Tutor Interface**: Interactive learning modules with guided practice and quick drills
- **Practice System**: Full practice tests and topic-specific drills with multiple choice questions

### Learning Engine
- **Step Validation**: Custom validation system for checking student work with confidence scoring and feedback generation
- **Socratic Method**: AI-guided questioning that breaks down problems into manageable steps
- **Adaptive Content**: Topic-specific question banks with difficulty progression
- **Progress Tracking**: Detailed analytics on completion rates and performance by topic

### Data Management
- **Problem Banks**: Static content files containing curated math problems organized by topic and difficulty
- **Validation Logic**: Custom algorithms for checking mathematical expressions, fractions, decimals, and algebraic solutions
- **Session Management**: Local state management for practice sessions and progress tracking

### Content Organization
- **Topics**: Structured curriculum covering Whole Numbers, Fractions, Decimals, Percentages, Basic Algebra, Word Problems, and Geometry
- **Question Types**: Multiple choice questions, step-by-step guided problems, and quick drill exercises
- **Difficulty Levels**: Progressive difficulty within each topic area
- **Exam Focus**: Content aligned with Common Entrance, SEA, and High School Entrance exams

## External Dependencies

### UI and Styling
- **Radix UI**: Comprehensive set of low-level UI primitives for building accessible components
- **Tailwind CSS**: Utility-first CSS framework with typography plugin for content styling
- **Lucide React**: Icon library providing consistent iconography throughout the application
- **Class Variance Authority**: Utility for creating type-safe, variant-based component APIs

### Development Tools
- **React Hook Form**: Form validation and management with Zod resolvers
- **TanStack Query**: Server state management and caching (prepared for future API integration)
- **Date-fns**: Date manipulation and formatting utilities

### Content Processing
- **Marked**: Markdown parser for rendering formatted educational content
- **Highlight.js**: Syntax highlighting for code examples and mathematical expressions

### Backend Services (Prepared)
- **Supabase**: Real-time database and authentication service (client configured but not fully implemented)
- Database schema prepared for user accounts, student profiles, progress tracking, and curriculum management

### Testing and Quality
- **ESLint**: Code linting with TypeScript support and React-specific rules
- **TypeScript**: Type checking with relaxed configuration for rapid development

The application is architected to be easily extensible with additional subjects, question types, and assessment methods while maintaining a clean separation between the learning engine, content management, and user interface layers.