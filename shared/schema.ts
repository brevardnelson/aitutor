import { pgTable, serial, varchar, integer, timestamp, decimal, boolean, text, json, unique } from 'drizzle-orm/pg-core';

// Grade Level Definitions for Dual Educational Systems
// Supports both US grades (K-13) and Caribbean school structure
export const GRADE_LEVELS = {
  // US Grade System
  US_KINDERGARTEN: 'K',
  US_GRADE_1: 'Grade 1',
  US_GRADE_2: 'Grade 2', 
  US_GRADE_3: 'Grade 3',
  US_GRADE_4: 'Grade 4',
  US_GRADE_5: 'Grade 5',
  US_GRADE_6: 'Grade 6',
  US_GRADE_7: 'Grade 7',
  US_GRADE_8: 'Grade 8',
  US_GRADE_9: 'Grade 9',
  US_GRADE_10: 'Grade 10',
  US_GRADE_11: 'Grade 11',
  US_GRADE_12: 'Grade 12',
  US_GRADE_13: 'Grade 13',
  
  // Caribbean School System
  CARIBBEAN_INFANT_1: 'Infant 1',
  CARIBBEAN_INFANT_2: 'Infant 2',
  CARIBBEAN_STANDARD_1: 'Standard 1',
  CARIBBEAN_STANDARD_2: 'Standard 2',
  CARIBBEAN_STANDARD_3: 'Standard 3',
  CARIBBEAN_STANDARD_4: 'Standard 4',
  CARIBBEAN_STANDARD_5: 'Standard 5', // SEA/11+/PEP exam year
  CARIBBEAN_FORM_1: 'Form 1',
  CARIBBEAN_FORM_2: 'Form 2',
  CARIBBEAN_FORM_3: 'Form 3',
  CARIBBEAN_FORM_4: 'Form 4', // CSEC prep begins
  CARIBBEAN_FORM_5: 'Form 5', // CSEC exam year
  CARIBBEAN_LOWER_6TH: 'Lower 6th Form', // CAPE/A-Levels prep
  CARIBBEAN_UPPER_6TH: 'Upper 6th Form', // CAPE/A-Levels completion
} as const;

// Grade Level Mapping between US and Caribbean systems
export const GRADE_MAPPING = {
  [GRADE_LEVELS.US_KINDERGARTEN]: GRADE_LEVELS.CARIBBEAN_INFANT_1,
  [GRADE_LEVELS.US_GRADE_1]: GRADE_LEVELS.CARIBBEAN_INFANT_2,
  [GRADE_LEVELS.US_GRADE_2]: GRADE_LEVELS.CARIBBEAN_STANDARD_1,
  [GRADE_LEVELS.US_GRADE_3]: GRADE_LEVELS.CARIBBEAN_STANDARD_2,
  [GRADE_LEVELS.US_GRADE_4]: GRADE_LEVELS.CARIBBEAN_STANDARD_3,
  [GRADE_LEVELS.US_GRADE_5]: GRADE_LEVELS.CARIBBEAN_STANDARD_4,
  [GRADE_LEVELS.US_GRADE_6]: GRADE_LEVELS.CARIBBEAN_STANDARD_5,
  [GRADE_LEVELS.US_GRADE_7]: GRADE_LEVELS.CARIBBEAN_FORM_1,
  [GRADE_LEVELS.US_GRADE_8]: GRADE_LEVELS.CARIBBEAN_FORM_2,
  [GRADE_LEVELS.US_GRADE_9]: GRADE_LEVELS.CARIBBEAN_FORM_3,
  [GRADE_LEVELS.US_GRADE_10]: GRADE_LEVELS.CARIBBEAN_FORM_4,
  [GRADE_LEVELS.US_GRADE_11]: GRADE_LEVELS.CARIBBEAN_FORM_5,
  [GRADE_LEVELS.US_GRADE_12]: GRADE_LEVELS.CARIBBEAN_LOWER_6TH,
  [GRADE_LEVELS.US_GRADE_13]: GRADE_LEVELS.CARIBBEAN_UPPER_6TH,
} as const;

// Key Educational Transition Points
export const TRANSITION_POINTS = {
  PRIMARY_TO_SECONDARY: [GRADE_LEVELS.CARIBBEAN_STANDARD_5, GRADE_LEVELS.US_GRADE_6], // SEA/11+/PEP exams
  CSEC_PREPARATION: [GRADE_LEVELS.CARIBBEAN_FORM_4, GRADE_LEVELS.US_GRADE_10], // CSEC prep begins
  CSEC_COMPLETION: [GRADE_LEVELS.CARIBBEAN_FORM_5, GRADE_LEVELS.US_GRADE_11], // CSEC exams
  ADVANCED_STUDIES: [GRADE_LEVELS.CARIBBEAN_LOWER_6TH, GRADE_LEVELS.US_GRADE_12], // CAPE/A-Levels
} as const;

// All valid grade levels (for validation)
export const ALL_GRADE_LEVELS = Object.values(GRADE_LEVELS);

// Helper function to get equivalent grade level
export function getEquivalentGrade(gradeLevel: string): string | null {
  // Check if it's a US grade, return Caribbean equivalent
  if (gradeLevel in GRADE_MAPPING) {
    return GRADE_MAPPING[gradeLevel as keyof typeof GRADE_MAPPING];
  }
  
  // Check if it's a Caribbean grade, return US equivalent
  const usEquivalent = Object.entries(GRADE_MAPPING).find(([, caribbean]) => caribbean === gradeLevel);
  return usEquivalent ? usEquivalent[0] : null;
}

// Use existing users table structure - role is being deprecated in favor of user_roles
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email').notNull().unique(),
  passwordHash: varchar('password_hash').notNull(),
  fullName: varchar('full_name').notNull(),
  phone: varchar('phone'),
  role: varchar('role'), // Nullable for migration - use user_roles as single source of truth
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Use existing students table structure (maps to our children concept)
export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id), // For backward compatibility
  parentId: integer('parent_id').references(() => users.id), 
  gradeLevel: varchar('grade_level'), // Supports both US grades (K, Grade 1-13) and Caribbean levels (Infant 1-2, Standard 1-5, Form 1-6)
  subjects: json('subjects').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Use existing progress table structure and extend it
export const progress = pgTable('progress', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id),
  subject: varchar('subject').notNull(),
  topic: varchar('topic').notNull(),
  completed: integer('completed').default(0),
  total: integer('total').default(0),
  lastAccessed: timestamp('last_accessed').defaultNow(),
  performanceScore: decimal('performance_score').default('0.00'),
});

// New tables for comprehensive metrics - using integer IDs to match existing pattern
export const learningSessions = pgTable('learning_sessions', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id),
  subject: varchar('subject').notNull(),
  topic: varchar('topic').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  duration: integer('duration').notNull(), // in minutes
  problemsAttempted: integer('problems_attempted').default(0),
  problemsCompleted: integer('problems_completed').default(0),
  correctAnswers: integer('correct_answers').default(0),
  hintsUsed: integer('hints_used').default(0),
  avgAttemptsPerProblem: decimal('avg_attempts_per_problem').default('0'),
  difficulty: varchar('difficulty').notNull(), // 'easy', 'medium', 'hard'
  sessionType: varchar('session_type').notNull(), // 'practice', 'test', 'review'
  createdAt: timestamp('created_at').defaultNow(),
});

// Individual problem attempts
export const problemAttempts = pgTable('problem_attempts', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').references(() => learningSessions.id),
  studentId: integer('student_id').references(() => students.id),
  subject: varchar('subject').notNull(),
  topic: varchar('topic').notNull(),
  problemId: varchar('problem_id').notNull(),
  difficulty: varchar('difficulty').notNull(),
  attempts: integer('attempts').notNull(),
  hintsUsed: integer('hints_used').default(0),
  timeSpent: integer('time_spent').notNull(), // in seconds
  isCorrect: boolean('is_correct').default(false),
  isCompleted: boolean('is_completed').default(false),
  needsAIIntervention: boolean('needs_ai_intervention').default(false),
  skippedToFinalHint: boolean('skipped_to_final_hint').default(false),
  errorType: varchar('error_type'), // Common error classification for teacher insights
  misconceptionId: varchar('misconception_id'), // Link to common misconceptions
  timestamp: timestamp('timestamp').defaultNow(),
});

// Topic mastery tracking
export const topicMastery = pgTable('topic_mastery', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id),
  subject: varchar('subject').notNull(),
  topic: varchar('topic').notNull(),
  totalProblems: integer('total_problems').default(0),
  completedProblems: integer('completed_problems').default(0),
  accuracyRate: decimal('accuracy_rate').default('0'), // percentage
  averageAttempts: decimal('average_attempts').default('0'),
  averageHints: decimal('average_hints').default('0'),
  masteryLevel: varchar('mastery_level').default('novice'), // 'novice', 'developing', 'proficient', 'mastered'
  firstAttemptDate: timestamp('first_attempt_date'),
  lastActivityDate: timestamp('last_activity_date'),
  timeSpent: integer('time_spent').default(0), // total minutes
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Daily activity summary
export const dailyActivity = pgTable('daily_activity', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id).notNull(),
  date: varchar('date').notNull(), // YYYY-MM-DD format
  totalTime: integer('total_time').default(0), // minutes
  sessionsCount: integer('sessions_count').default(0),
  topicsWorked: json('topics_worked').$type<string[]>().default([]),
  problemsAttempted: integer('problems_attempted').default(0),
  problemsCompleted: integer('problems_completed').default(0),
  accuracyRate: decimal('accuracy_rate').default('0'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  // Unique daily activity per student per date - required for upsert operations
  uniqueStudentDate: unique().on(table.studentId, table.date),
}));

// Weekly engagement summary
export const weeklyEngagement = pgTable('weekly_engagement', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id),
  weekStart: varchar('week_start').notNull(), // YYYY-MM-DD format
  daysActive: integer('days_active').default(0),
  totalTime: integer('total_time').default(0),
  averageSessionDuration: decimal('average_session_duration').default('0'),
  engagementStreak: integer('engagement_streak').default(0),
  topicsProgressed: integer('topics_progressed').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Parent-defined goals
export const parentGoals = pgTable('parent_goals', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id),
  subject: varchar('subject').notNull(),
  title: varchar('title').notNull(),
  description: text('description'),
  targetDate: timestamp('target_date').notNull(),
  targetMetric: varchar('target_metric').notNull(), // 'accuracy', 'completion', 'time', 'mastery'
  targetValue: decimal('target_value').notNull(),
  currentValue: decimal('current_value').default('0'),
  isCompleted: boolean('is_completed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Exam readiness tracking
export const examReadiness = pgTable('exam_readiness', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id),
  subject: varchar('subject').notNull(),
  examType: varchar('exam_type').notNull(),
  overallScore: decimal('overall_score').default('0'), // 0-100
  topicScores: json('topic_scores').$type<Record<string, number>>().default({}),
  weakAreas: json('weak_areas').$type<string[]>().default([]),
  strongAreas: json('strong_areas').$type<string[]>().default([]),
  recommendedStudyTime: integer('recommended_study_time').default(0), // hours per week
  estimatedReadinessDate: timestamp('estimated_readiness_date'),
  lastUpdated: timestamp('last_updated').defaultNow(),
});

// Alerts for parents
export const alerts = pgTable('alerts', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id),
  type: varchar('type').notNull(), // 'struggle', 'engagement', 'readiness', 'goal', 'milestone'
  severity: varchar('severity').notNull(), // 'low', 'medium', 'high'
  title: varchar('title').notNull(),
  message: text('message').notNull(),
  actionRequired: boolean('action_required').default(false),
  isRead: boolean('is_read').default(false),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Milestones and achievements
export const milestones = pgTable('milestones', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id),
  type: varchar('type').notNull(), // 'topic_mastery', 'accuracy_streak', 'time_goal', 'consistency'
  title: varchar('title').notNull(),
  description: text('description'),
  badgeIcon: varchar('badge_icon').notNull(),
  points: integer('points').default(0),
  achievedAt: timestamp('achieved_at').defaultNow(),
});

// Student profiles extension (add missing fields to existing students table concept)
export const studentProfiles = pgTable('student_profiles', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id).unique(),
  name: varchar('name').notNull(),
  email: varchar('email'), // Optional email for older children who can create their own accounts
  age: integer('age').notNull(),
  grade: varchar('grade').notNull(), // Supports dual educational systems: US grades (K-13) & Caribbean levels (Infant 1-2, Standard 1-5, Form 1-6)
  targetExam: varchar('target_exam').notNull(), // SEA, 11+, PEP, CSEC, CAPE, A-Levels, etc.
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// INSTITUTIONAL SCHEMA - Multi-role platform support

// Schools table - hierarchical organization
export const schools = pgTable('schools', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  district: varchar('district'),
  address: text('address'),
  phone: varchar('phone'),
  email: varchar('email'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Classes table - grouping mechanism for students under teachers
export const classes = pgTable('classes', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(), // e.g., "Grade 7A", "Form 3B", "Standard 4", "Advanced Math"
  subject: varchar('subject'), // Optional - classes can be subject-specific or general
  gradeLevel: varchar('grade_level').notNull(), // Dual system support: US grades (K-13) & Caribbean levels (Infant 1-2, Standard 1-5, Form 1-6)
  schoolId: integer('school_id').references(() => schools.id).notNull(), // Classes must belong to a school
  teacherId: integer('teacher_id').references(() => users.id), // Can be null during creation, required before activation
  maxStudents: integer('max_students').default(30),
  isActive: boolean('is_active').default(false), // Must be explicitly activated with teacher assigned
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  // Unique class names per school
  uniqueClassPerSchool: unique().on(table.schoolId, table.name),
}));

// Teacher-School relationships (teachers can work at multiple schools)
export const teacherSchools = pgTable('teacher_schools', {
  id: serial('id').primaryKey(),
  teacherId: integer('teacher_id').references(() => users.id).notNull(),
  schoolId: integer('school_id').references(() => schools.id).notNull(),
  isActive: boolean('is_active').default(true),
  assignedAt: timestamp('assigned_at').defaultNow(),
}, (table) => ({
  // Prevent duplicate teacher-school assignments
  uniqueTeacherSchool: unique().on(table.teacherId, table.schoolId),
}));

// Student-School relationships (students can only be in one active school)
export const studentSchools = pgTable('student_schools', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id).notNull(),
  schoolId: integer('school_id').references(() => schools.id).notNull(),
  enrolledAt: timestamp('enrolled_at').defaultNow(),
  isActive: boolean('is_active').default(true),
}, (table) => ({
  // Prevent duplicate student-school enrollments
  uniqueStudentSchool: unique().on(table.studentId, table.schoolId),
  // Note: Single active school per student enforced at application level
  // DB constraint: CREATE UNIQUE INDEX ux_student_active_school ON student_schools(student_id) WHERE is_active
}));

// Student-Class enrollments (students can be in multiple classes within their school)
export const classEnrollments = pgTable('class_enrollments', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id).notNull(),
  classId: integer('class_id').references(() => classes.id).notNull(),
  schoolId: integer('school_id').references(() => schools.id).notNull(), // Denormalized for constraint enforcement
  enrolledAt: timestamp('enrolled_at').defaultNow(),
  isActive: boolean('is_active').default(true),
}, (table) => ({
  // Prevent duplicate student-class enrollments
  uniqueStudentClass: unique().on(table.studentId, table.classId),
  // Ensure student belongs to same school as class (enforced at application level)
  // Note: student_schools.school_id must equal class_enrollments.school_id for same studentId
}));

// User roles and permissions - single source of truth for roles
export const userRoles = pgTable('user_roles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  role: varchar('role').notNull(), // 'system_admin', 'school_admin', 'teacher', 'parent', 'student'
  schoolId: integer('school_id').references(() => schools.id), // null for system admins only
  permissions: text('permissions').array().default([]), // PostgreSQL text array for permissions
  isActive: boolean('is_active').default(true),
  assignedAt: timestamp('assigned_at').defaultNow(),
}, (table) => ({
  // Prevent duplicate role assignments per user-school-role combination
  uniqueUserSchoolRole: unique().on(table.userId, table.schoolId, table.role),
}));

// Teacher assignments - custom assignments created by teachers
export const teacherAssignments = pgTable('teacher_assignments', {
  id: serial('id').primaryKey(),
  teacherId: integer('teacher_id').references(() => users.id).notNull(),
  classId: integer('class_id').references(() => classes.id).notNull(),
  title: varchar('title').notNull(),
  description: text('description'),
  subject: varchar('subject').notNull(),
  topics: json('topics').$type<string[]>(), // Array of topics covered
  difficulty: varchar('difficulty').notNull(), // 'easy', 'medium', 'hard'
  totalProblems: integer('total_problems').notNull(),
  dueDate: timestamp('due_date'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Assignment submissions - student work on teacher assignments
export const assignmentSubmissions = pgTable('assignment_submissions', {
  id: serial('id').primaryKey(),
  assignmentId: integer('assignment_id').references(() => teacherAssignments.id).notNull(),
  studentId: integer('student_id').references(() => students.id).notNull(),
  problemsAttempted: integer('problems_attempted').default(0),
  problemsCompleted: integer('problems_completed').default(0),
  correctAnswers: integer('correct_answers').default(0),
  totalTimeSpent: integer('total_time_spent').default(0), // in minutes
  accuracyRate: decimal('accuracy_rate').default('0'),
  isCompleted: boolean('is_completed').default(false),
  submittedAt: timestamp('submitted_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  // Unique submission per student per assignment
  uniqueStudentAssignment: unique().on(table.studentId, table.assignmentId),
}));

// Common misconceptions catalog for teacher insights
export const misconceptions = pgTable('misconceptions', {
  id: varchar('id').primaryKey(), // e.g., "fraction_addition_common_denominator"
  subject: varchar('subject').notNull(),
  topic: varchar('topic').notNull(),
  title: varchar('title').notNull(),
  description: text('description').notNull(),
  correctConcept: text('correct_concept'),
  commonErrors: json('common_errors').$type<string[]>(),
  remediation: text('remediation'), // Suggested teaching approaches
  difficulty: varchar('difficulty').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Class performance benchmarks for comparison
export const classBenchmarks = pgTable('class_benchmarks', {
  id: serial('id').primaryKey(),
  gradeLevel: varchar('grade_level').notNull(),
  subject: varchar('subject').notNull(),
  topic: varchar('topic').notNull(),
  expectedAccuracy: decimal('expected_accuracy').notNull(), // Percentage
  expectedMasteryTime: integer('expected_mastery_time'), // Expected hours to mastery
  nationalAverage: decimal('national_average'), // Comparison baseline
  difficultyLevel: varchar('difficulty_level').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  // Unique benchmark per grade-subject-topic-difficulty
  uniqueBenchmark: unique().on(table.gradeLevel, table.subject, table.topic, table.difficultyLevel),
}));

// Student alerts for teachers - flagging at-risk students
export const studentAlerts = pgTable('student_alerts', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id).notNull(),
  teacherId: integer('teacher_id').references(() => users.id).notNull(),
  classId: integer('class_id').references(() => classes.id).notNull(),
  alertType: varchar('alert_type').notNull(), // 'low_engagement', 'poor_performance', 'needs_intervention', 'at_risk'
  severity: varchar('severity').notNull(), // 'low', 'medium', 'high', 'critical'
  subject: varchar('subject'),
  topic: varchar('topic'),
  message: text('message').notNull(),
  actionRequired: text('action_required'),
  isResolved: boolean('is_resolved').default(false),
  resolvedAt: timestamp('resolved_at'),
  resolvedBy: integer('resolved_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Class analytics summary - pre-computed for teacher dashboard
export const classAnalytics = pgTable('class_analytics', {
  id: serial('id').primaryKey(),
  classId: integer('class_id').references(() => classes.id).notNull(),
  teacherId: integer('teacher_id').references(() => users.id).notNull(),
  dateRange: varchar('date_range').notNull(), // 'daily', 'weekly', 'monthly'
  date: varchar('date').notNull(), // YYYY-MM-DD or YYYY-Www format
  totalStudents: integer('total_students').default(0),
  activeStudents: integer('active_students').default(0),
  avgTimePerStudent: decimal('avg_time_per_student').default('0'), // minutes
  avgAccuracyRate: decimal('avg_accuracy_rate').default('0'), // percentage
  topicsCovered: integer('topics_covered').default(0),
  problemsAttempted: integer('problems_attempted').default(0),
  problemsCompleted: integer('problems_completed').default(0),
  hintsUsed: integer('hints_used').default(0),
  interventionsNeeded: integer('interventions_needed').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  // Unique analytics per class per date range per date
  uniqueClassAnalytics: unique().on(table.classId, table.dateRange, table.date),
}));

// Invitations for users to join schools/classes
export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  email: varchar('email').notNull(),
  role: varchar('role').notNull(), // 'teacher', 'parent', 'student'
  schoolId: integer('school_id').references(() => schools.id),
  classId: integer('class_id').references(() => classes.id), // optional, for direct class invitations
  invitedBy: integer('invited_by').references(() => users.id).notNull(),
  token: varchar('token').notNull().unique(), // unique invitation token
  expiresAt: timestamp('expires_at').notNull(),
  acceptedAt: timestamp('accepted_at'),
  isUsed: boolean('is_used').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  // Basic uniqueness on email-role-school-class combination
  uniqueInvitation: unique().on(table.email, table.role, table.schoolId, table.classId),
  // Note: Active invitation constraint (not used + not expired) enforced at application level
}));

// DOCUMENT MANAGEMENT SYSTEM - For AI Model Training and Curriculum Content

// Document categories for organizing course materials
export const documentCategories = pgTable('document_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(), // e.g., 'Textbooks', 'Worksheets', 'Curriculum Standards', 'Assessment Guides'
  description: text('description'),
  parentCategoryId: integer('parent_category_id').references(function() { return documentCategories.id; }), // Self-referencing for hierarchical categories
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Curriculum documents and course materials uploaded by admins
export const curriculumDocuments = pgTable('curriculum_documents', {
  id: serial('id').primaryKey(),
  title: varchar('title').notNull(),
  description: text('description'),
  fileName: varchar('file_name').notNull(),
  originalFileName: varchar('original_file_name').notNull(),
  filePath: varchar('file_path').notNull(), // Path in object storage
  fileSize: integer('file_size').notNull(), // File size in bytes
  mimeType: varchar('mime_type').notNull(), // e.g., 'application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  
  // Educational Classification
  gradeLevel: varchar('grade_level').notNull(), // Supports dual educational systems: US grades (K-13) & Caribbean levels
  subject: varchar('subject').notNull(), // 'math', 'english', 'science', etc.
  topic: varchar('topic'), // Specific topic within subject
  difficulty: varchar('difficulty').default('medium'), // 'easy', 'medium', 'hard'
  
  // Content Organization
  categoryId: integer('category_id').references(() => documentCategories.id),
  tags: json('tags').$type<string[]>().default([]), // Keywords for searchability
  contentType: varchar('content_type').notNull(), // 'textbook', 'worksheet', 'curriculum_standard', 'assessment', 'lesson_plan', 'reference_material'
  
  // AI Processing Status
  isProcessed: boolean('is_processed').default(false), // Has the document been processed for AI training?
  processingStatus: varchar('processing_status').default('pending'), // 'pending', 'processing', 'completed', 'failed'
  processingError: text('processing_error'), // Error message if processing failed
  extractedText: text('extracted_text'), // Text content extracted from document
  aiSummary: text('ai_summary'), // AI-generated summary of document content
  keyWords: json('key_words').$type<string[]>().default([]), // AI-extracted keywords
  
  // Content Quality and Validation
  isValidated: boolean('is_validated').default(false), // Has content been validated by educators?
  validatedBy: integer('validated_by').references(() => users.id), // User who validated the content
  validatedAt: timestamp('validated_at'),
  contentQualityScore: decimal('content_quality_score'), // AI-assessed content quality (0-100)
  
  // Administrative
  schoolId: integer('school_id').references(() => schools.id), // Optional: school-specific documents
  uploadedBy: integer('uploaded_by').references(() => users.id).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  // Unique file path per school (or globally if school is null)
  uniqueFilePath: unique().on(table.filePath, table.schoolId),
}));

// Document versions - track changes to curriculum documents over time
export const documentVersions = pgTable('document_versions', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').references(() => curriculumDocuments.id).notNull(),
  versionNumber: integer('version_number').notNull(),
  changeSummary: text('change_summary'),
  filePath: varchar('file_path').notNull(), // Path to this version in object storage
  fileSize: integer('file_size').notNull(),
  uploadedBy: integer('uploaded_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  // Unique version per document
  uniqueDocumentVersion: unique().on(table.documentId, table.versionNumber),
}));

// Document access permissions - control who can access specific documents
export const documentPermissions = pgTable('document_permissions', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').references(() => curriculumDocuments.id).notNull(),
  userId: integer('user_id').references(() => users.id),
  roleType: varchar('role_type'), // 'system_admin', 'school_admin', 'teacher', etc.
  schoolId: integer('school_id').references(() => schools.id), // Scoped permissions per school
  permissionLevel: varchar('permission_level').notNull(), // 'read', 'write', 'admin'
  grantedBy: integer('granted_by').references(() => users.id).notNull(),
  expiresAt: timestamp('expires_at'), // Optional expiration
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  // Unique permission per document-user/role combination
  uniqueDocumentPermission: unique().on(table.documentId, table.userId, table.roleType, table.schoolId),
}));

// AI model training sessions - track how documents are used for AI customization
export const aiTrainingSessions = pgTable('ai_training_sessions', {
  id: serial('id').primaryKey(),
  sessionName: varchar('session_name').notNull(),
  description: text('description'),
  
  // Scope Configuration
  gradeLevel: varchar('grade_level'), // Target grade level for training
  subject: varchar('subject'), // Target subject
  
  // Training Parameters
  modelProvider: varchar('model_provider').notNull(), // 'openai', 'anthropic'
  modelType: varchar('model_type').notNull(), // 'gpt-4', 'claude-3', etc.
  trainingObjective: varchar('training_objective').notNull(), // 'question_generation', 'content_adaptation', 'difficulty_assessment'
  
  // Document Set
  documentIds: json('document_ids').$type<number[]>().notNull(), // Array of curriculum document IDs used
  totalDocuments: integer('total_documents').notNull(),
  totalTokens: integer('total_tokens'), // Total tokens processed
  
  // Status and Results
  status: varchar('status').default('pending'), // 'pending', 'running', 'completed', 'failed'
  progressPercent: decimal('progress_percent').default('0'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  errorMessage: text('error_message'),
  
  // Quality Metrics
  trainingAccuracy: decimal('training_accuracy'), // Training effectiveness score
  validationScore: decimal('validation_score'), // Validation against test data
  
  // Administrative
  initiatedBy: integer('initiated_by').references(() => users.id).notNull(),
  schoolId: integer('school_id').references(() => schools.id), // Optional: school-specific training
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Document usage analytics - track how documents are used in the AI system
export const documentUsageAnalytics = pgTable('document_usage_analytics', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').references(() => curriculumDocuments.id).notNull(),
  
  // Usage Metrics
  timesUsedInTraining: integer('times_used_in_training').default(0),
  timesReferencedInQuestions: integer('times_referenced_in_questions').default(0),
  averageStudentPerformance: decimal('average_student_performance'), // Performance on questions derived from this document
  
  // Content Effectiveness
  effectivenessScore: decimal('effectiveness_score'), // Overall effectiveness rating (0-100)
  studentEngagementScore: decimal('student_engagement_score'), // How engaging students find content from this document
  teacherFeedbackScore: decimal('teacher_feedback_score'), // Teacher ratings of questions/content derived
  
  // Date Tracking
  lastUsedAt: timestamp('last_used_at'),
  analyticsDate: varchar('analytics_date').notNull(), // YYYY-MM-DD for daily aggregation
  
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  // Unique analytics per document per date
  uniqueDocumentAnalytics: unique().on(table.documentId, table.analyticsDate),
}));

// Content templates - AI-generated templates based on curriculum documents
export const contentTemplates = pgTable('content_templates', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  description: text('description'),
  
  // Template Classification
  templateType: varchar('template_type').notNull(), // 'question', 'explanation', 'example', 'practice_problem'
  gradeLevel: varchar('grade_level').notNull(),
  subject: varchar('subject').notNull(),
  topic: varchar('topic'),
  difficulty: varchar('difficulty').notNull(),
  
  // Template Content
  templateContent: text('template_content').notNull(), // JSON or structured template
  variables: json('variables').$type<string[]>().default([]), // Dynamic variables in template
  
  // Source Information
  sourceDocumentIds: json('source_document_ids').$type<number[]>(), // Documents used to create this template
  generatedBy: varchar('generated_by').notNull(), // AI model that generated this
  
  // Usage and Quality
  timesUsed: integer('times_used').default(0),
  successRate: decimal('success_rate'), // Success rate when used in practice
  qualityScore: decimal('quality_score'), // Quality assessment score
  
  // Administrative
  createdBy: integer('created_by').references(() => users.id).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});