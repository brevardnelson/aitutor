CREATE TABLE "ai_training_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_name" varchar NOT NULL,
	"description" text,
	"grade_level" varchar,
	"subject" varchar,
	"model_provider" varchar NOT NULL,
	"model_type" varchar NOT NULL,
	"training_objective" varchar NOT NULL,
	"document_ids" json NOT NULL,
	"total_documents" integer NOT NULL,
	"total_tokens" integer,
	"status" varchar DEFAULT 'pending',
	"progress_percent" numeric DEFAULT '0',
	"started_at" timestamp,
	"completed_at" timestamp,
	"error_message" text,
	"training_accuracy" numeric,
	"validation_score" numeric,
	"initiated_by" integer NOT NULL,
	"school_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer,
	"type" varchar NOT NULL,
	"severity" varchar NOT NULL,
	"title" varchar NOT NULL,
	"message" text NOT NULL,
	"action_required" boolean DEFAULT false,
	"is_read" boolean DEFAULT false,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assignment_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"assignment_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"problems_attempted" integer DEFAULT 0,
	"problems_completed" integer DEFAULT 0,
	"correct_answers" integer DEFAULT 0,
	"total_time_spent" integer DEFAULT 0,
	"accuracy_rate" numeric DEFAULT '0',
	"is_completed" boolean DEFAULT false,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "assignment_submissions_student_id_assignment_id_unique" UNIQUE("student_id","assignment_id")
);
--> statement-breakpoint
CREATE TABLE "badge_definitions" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text NOT NULL,
	"icon" varchar NOT NULL,
	"category" varchar NOT NULL,
	"tier" varchar NOT NULL,
	"xp_reward" integer DEFAULT 0,
	"criteria" json NOT NULL,
	"target_role" varchar NOT NULL,
	"grade_level" varchar,
	"subject" varchar,
	"is_secret" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "challenge_participation" (
	"id" serial PRIMARY KEY NOT NULL,
	"challenge_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"current_value" integer DEFAULT 0,
	"is_completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"starting_baseline" integer,
	"progress_history" json DEFAULT '[]'::json,
	"xp_awarded" boolean DEFAULT false,
	"badge_awarded" boolean DEFAULT false,
	"joined_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "challenge_participation_student_id_challenge_id_unique" UNIQUE("student_id","challenge_id")
);
--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"type" varchar NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"target_value" integer NOT NULL,
	"metric" varchar NOT NULL,
	"xp_reward" integer DEFAULT 0,
	"badge_reward" varchar,
	"grade_level" varchar,
	"subject" varchar,
	"school_id" integer,
	"class_id" integer,
	"created_by" integer,
	"is_active" boolean DEFAULT true,
	"max_participants" integer,
	"current_participants" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "class_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"class_id" integer NOT NULL,
	"teacher_id" integer NOT NULL,
	"date_range" varchar NOT NULL,
	"date" varchar NOT NULL,
	"total_students" integer DEFAULT 0,
	"active_students" integer DEFAULT 0,
	"avg_time_per_student" numeric DEFAULT '0',
	"avg_accuracy_rate" numeric DEFAULT '0',
	"topics_covered" integer DEFAULT 0,
	"problems_attempted" integer DEFAULT 0,
	"problems_completed" integer DEFAULT 0,
	"hints_used" integer DEFAULT 0,
	"interventions_needed" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "class_analytics_class_id_date_range_date_unique" UNIQUE("class_id","date_range","date")
);
--> statement-breakpoint
CREATE TABLE "class_benchmarks" (
	"id" serial PRIMARY KEY NOT NULL,
	"grade_level" varchar NOT NULL,
	"subject" varchar NOT NULL,
	"topic" varchar NOT NULL,
	"expected_accuracy" numeric NOT NULL,
	"expected_mastery_time" integer,
	"national_average" numeric,
	"difficulty_level" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "class_benchmarks_grade_level_subject_topic_difficulty_level_unique" UNIQUE("grade_level","subject","topic","difficulty_level")
);
--> statement-breakpoint
CREATE TABLE "class_enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"class_id" integer NOT NULL,
	"school_id" integer NOT NULL,
	"enrolled_at" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true,
	CONSTRAINT "class_enrollments_student_id_class_id_unique" UNIQUE("student_id","class_id")
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"subject" varchar,
	"grade_level" varchar NOT NULL,
	"school_id" integer NOT NULL,
	"teacher_id" integer,
	"max_students" integer DEFAULT 30,
	"is_active" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "classes_school_id_name_unique" UNIQUE("school_id","name")
);
--> statement-breakpoint
CREATE TABLE "content_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"template_type" varchar NOT NULL,
	"grade_level" varchar NOT NULL,
	"subject" varchar NOT NULL,
	"topic" varchar,
	"difficulty" varchar NOT NULL,
	"template_content" text NOT NULL,
	"variables" json DEFAULT '[]'::json,
	"source_document_ids" json,
	"generated_by" varchar NOT NULL,
	"times_used" integer DEFAULT 0,
	"success_rate" numeric,
	"quality_score" numeric,
	"created_by" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "curriculum_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"file_name" varchar NOT NULL,
	"original_file_name" varchar NOT NULL,
	"file_path" varchar NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" varchar NOT NULL,
	"grade_level" varchar NOT NULL,
	"subject" varchar NOT NULL,
	"topic" varchar,
	"difficulty" varchar DEFAULT 'medium',
	"category_id" integer,
	"tags" json DEFAULT '[]'::json,
	"content_type" varchar NOT NULL,
	"is_processed" boolean DEFAULT false,
	"processing_status" varchar DEFAULT 'pending',
	"processing_error" text,
	"extracted_text" text,
	"ai_summary" text,
	"key_words" json DEFAULT '[]'::json,
	"is_validated" boolean DEFAULT false,
	"validated_by" integer,
	"validated_at" timestamp,
	"content_quality_score" numeric,
	"school_id" integer,
	"uploaded_by" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "curriculum_documents_file_path_school_id_unique" UNIQUE("file_path","school_id")
);
--> statement-breakpoint
CREATE TABLE "daily_activity" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"date" varchar NOT NULL,
	"total_time" integer DEFAULT 0,
	"sessions_count" integer DEFAULT 0,
	"topics_worked" json DEFAULT '[]'::json,
	"problems_attempted" integer DEFAULT 0,
	"problems_completed" integer DEFAULT 0,
	"accuracy_rate" numeric DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "daily_activity_student_id_date_unique" UNIQUE("student_id","date")
);
--> statement-breakpoint
CREATE TABLE "document_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"parent_category_id" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "document_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"user_id" integer,
	"role_type" varchar,
	"school_id" integer,
	"permission_level" varchar NOT NULL,
	"granted_by" integer NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "document_permissions_document_id_user_id_role_type_school_id_unique" UNIQUE("document_id","user_id","role_type","school_id")
);
--> statement-breakpoint
CREATE TABLE "document_usage_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"times_used_in_training" integer DEFAULT 0,
	"times_referenced_in_questions" integer DEFAULT 0,
	"average_student_performance" numeric,
	"effectiveness_score" numeric,
	"student_engagement_score" numeric,
	"teacher_feedback_score" numeric,
	"last_used_at" timestamp,
	"analytics_date" varchar NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "document_usage_analytics_document_id_analytics_date_unique" UNIQUE("document_id","analytics_date")
);
--> statement-breakpoint
CREATE TABLE "document_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"version_number" integer NOT NULL,
	"change_summary" text,
	"file_path" varchar NOT NULL,
	"file_size" integer NOT NULL,
	"uploaded_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "document_versions_document_id_version_number_unique" UNIQUE("document_id","version_number")
);
--> statement-breakpoint
CREATE TABLE "exam_readiness" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer,
	"subject" varchar NOT NULL,
	"exam_type" varchar NOT NULL,
	"overall_score" numeric DEFAULT '0',
	"topic_scores" json DEFAULT '{}'::json,
	"weak_areas" json DEFAULT '[]'::json,
	"strong_areas" json DEFAULT '[]'::json,
	"recommended_study_time" integer DEFAULT 0,
	"estimated_readiness_date" timestamp,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gamification_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"recipient_id" integer NOT NULL,
	"recipient_type" varchar NOT NULL,
	"type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"message" text NOT NULL,
	"icon" varchar,
	"student_id" integer,
	"badge_id" varchar,
	"challenge_id" integer,
	"leaderboard_id" integer,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"priority" varchar DEFAULT 'normal',
	"email_sent" boolean DEFAULT false,
	"push_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"role" varchar NOT NULL,
	"school_id" integer,
	"class_id" integer,
	"invited_by" integer NOT NULL,
	"token" varchar NOT NULL,
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	"is_used" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "invitations_token_unique" UNIQUE("token"),
	CONSTRAINT "invitations_email_role_school_id_class_id_unique" UNIQUE("email","role","school_id","class_id")
);
--> statement-breakpoint
CREATE TABLE "leaderboard_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"leaderboard_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"rank" integer NOT NULL,
	"score" integer NOT NULL,
	"previous_rank" integer,
	"trend_direction" varchar,
	"metadata" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "leaderboard_entries_leaderboard_id_student_id_unique" UNIQUE("leaderboard_id","student_id")
);
--> statement-breakpoint
CREATE TABLE "leaderboards" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar NOT NULL,
	"scope" varchar NOT NULL,
	"class_id" integer,
	"school_id" integer,
	"grade_level" varchar,
	"period_type" varchar NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"is_active" boolean DEFAULT true,
	"is_current" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "leaderboards_type_scope_class_id_school_id_grade_level_is_current_unique" UNIQUE("type","scope","class_id","school_id","grade_level","is_current")
);
--> statement-breakpoint
CREATE TABLE "learning_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer,
	"subject" varchar NOT NULL,
	"topic" varchar NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"duration" integer NOT NULL,
	"problems_attempted" integer DEFAULT 0,
	"problems_completed" integer DEFAULT 0,
	"correct_answers" integer DEFAULT 0,
	"hints_used" integer DEFAULT 0,
	"avg_attempts_per_problem" numeric DEFAULT '0',
	"difficulty" varchar NOT NULL,
	"session_type" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer,
	"type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"badge_icon" varchar NOT NULL,
	"points" integer DEFAULT 0,
	"achieved_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "misconceptions" (
	"id" varchar PRIMARY KEY NOT NULL,
	"subject" varchar NOT NULL,
	"topic" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"correct_concept" text,
	"common_errors" json,
	"remediation" text,
	"difficulty" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "parent_achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"badge_icon" varchar NOT NULL,
	"metric" varchar NOT NULL,
	"threshold" numeric NOT NULL,
	"actual_value" numeric NOT NULL,
	"earned_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "parent_engagement" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"total_logins" integer DEFAULT 0,
	"last_login" timestamp,
	"goals_set" integer DEFAULT 0,
	"goals_completed" integer DEFAULT 0,
	"rewards_approved" integer DEFAULT 0,
	"notifications_viewed" integer DEFAULT 0,
	"engagement_score" numeric DEFAULT '0',
	"engagement_level" varchar DEFAULT 'new',
	"weekly_logins" integer DEFAULT 0,
	"monthly_logins" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "parent_engagement_parent_id_student_id_unique" UNIQUE("parent_id","student_id")
);
--> statement-breakpoint
CREATE TABLE "parent_goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer,
	"subject" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"target_date" timestamp NOT NULL,
	"target_metric" varchar NOT NULL,
	"target_value" numeric NOT NULL,
	"current_value" numeric DEFAULT '0',
	"is_completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "problem_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer,
	"student_id" integer,
	"subject" varchar NOT NULL,
	"topic" varchar NOT NULL,
	"problem_id" varchar NOT NULL,
	"difficulty" varchar NOT NULL,
	"attempts" integer NOT NULL,
	"hints_used" integer DEFAULT 0,
	"time_spent" integer NOT NULL,
	"is_correct" boolean DEFAULT false,
	"is_completed" boolean DEFAULT false,
	"needs_ai_intervention" boolean DEFAULT false,
	"skipped_to_final_hint" boolean DEFAULT false,
	"error_type" varchar,
	"misconception_id" varchar,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer,
	"subject" varchar NOT NULL,
	"topic" varchar NOT NULL,
	"completed" integer DEFAULT 0,
	"total" integer DEFAULT 0,
	"last_accessed" timestamp DEFAULT now(),
	"performance_score" numeric DEFAULT '0.00'
);
--> statement-breakpoint
CREATE TABLE "reward_catalog" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text NOT NULL,
	"category" varchar NOT NULL,
	"subcategory" varchar,
	"point_cost" integer NOT NULL,
	"stock_quantity" integer,
	"available_quantity" integer,
	"min_level" integer DEFAULT 1,
	"max_redemptions_per_student" integer,
	"grade_level" varchar,
	"school_id" integer,
	"image_url" varchar,
	"icon" varchar,
	"display_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"is_promoted" boolean DEFAULT false,
	"external_sku" varchar,
	"fulfillment_type" varchar DEFAULT 'manual',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reward_redemptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"reward_id" integer NOT NULL,
	"points_spent" integer NOT NULL,
	"quantity" integer DEFAULT 1,
	"status" varchar DEFAULT 'pending',
	"fulfillment_notes" text,
	"tracking_number" varchar,
	"approved_by" integer,
	"approved_at" timestamp,
	"stripe_payment_intent_id" varchar,
	"redeemed_at" timestamp DEFAULT now(),
	"fulfilled_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"district" varchar,
	"address" text,
	"phone" varchar,
	"email" varchar,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "student_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"teacher_id" integer NOT NULL,
	"class_id" integer NOT NULL,
	"alert_type" varchar NOT NULL,
	"severity" varchar NOT NULL,
	"subject" varchar,
	"topic" varchar,
	"message" text NOT NULL,
	"action_required" text,
	"is_resolved" boolean DEFAULT false,
	"resolved_at" timestamp,
	"resolved_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "student_badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"badge_id" varchar NOT NULL,
	"progress" numeric DEFAULT '0',
	"is_earned" boolean DEFAULT false,
	"earned_at" timestamp,
	"notification_sent" boolean DEFAULT false,
	"metadata" json,
	"is_active" boolean DEFAULT true,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "student_badges_student_id_badge_id_unique" UNIQUE("student_id","badge_id")
);
--> statement-breakpoint
CREATE TABLE "student_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer,
	"name" varchar NOT NULL,
	"email" varchar,
	"age" integer NOT NULL,
	"grade" varchar NOT NULL,
	"target_exam" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "student_profiles_student_id_unique" UNIQUE("student_id")
);
--> statement-breakpoint
CREATE TABLE "student_schools" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"school_id" integer NOT NULL,
	"enrolled_at" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true,
	CONSTRAINT "student_schools_student_id_school_id_unique" UNIQUE("student_id","school_id")
);
--> statement-breakpoint
CREATE TABLE "student_wallets" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"stripe_customer_id" varchar,
	"point_balance" integer DEFAULT 0,
	"lifetime_earnings" integer DEFAULT 0,
	"total_redeemed" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"is_suspended" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "student_wallets_student_id_unique" UNIQUE("student_id")
);
--> statement-breakpoint
CREATE TABLE "student_xp" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"total_xp" integer DEFAULT 0,
	"spent_xp" integer DEFAULT 0,
	"available_xp" integer DEFAULT 0,
	"level" integer DEFAULT 1,
	"weekly_xp" integer DEFAULT 0,
	"monthly_xp" integer DEFAULT 0,
	"last_xp_earned" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "student_xp_student_id_unique" UNIQUE("student_id")
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"parent_id" integer,
	"grade_level" varchar,
	"subjects" json,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "teacher_achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"teacher_id" integer NOT NULL,
	"type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"badge_icon" varchar NOT NULL,
	"metric" varchar NOT NULL,
	"threshold" numeric NOT NULL,
	"actual_value" numeric NOT NULL,
	"class_id" integer,
	"challenge_id" integer,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"earned_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "teacher_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"teacher_id" integer NOT NULL,
	"class_id" integer NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"subject" varchar NOT NULL,
	"topics" json,
	"difficulty" varchar NOT NULL,
	"total_problems" integer NOT NULL,
	"due_date" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "teacher_schools" (
	"id" serial PRIMARY KEY NOT NULL,
	"teacher_id" integer NOT NULL,
	"school_id" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"assigned_at" timestamp DEFAULT now(),
	CONSTRAINT "teacher_schools_teacher_id_school_id_unique" UNIQUE("teacher_id","school_id")
);
--> statement-breakpoint
CREATE TABLE "topic_mastery" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer,
	"subject" varchar NOT NULL,
	"topic" varchar NOT NULL,
	"total_problems" integer DEFAULT 0,
	"completed_problems" integer DEFAULT 0,
	"accuracy_rate" numeric DEFAULT '0',
	"average_attempts" numeric DEFAULT '0',
	"average_hints" numeric DEFAULT '0',
	"mastery_level" varchar DEFAULT 'novice',
	"first_attempt_date" timestamp,
	"last_activity_date" timestamp,
	"time_spent" integer DEFAULT 0,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"role" varchar NOT NULL,
	"school_id" integer,
	"permissions" text[] DEFAULT '{}',
	"is_active" boolean DEFAULT true,
	"assigned_at" timestamp DEFAULT now(),
	CONSTRAINT "user_roles_user_id_school_id_role_unique" UNIQUE("user_id","school_id","role")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"password_hash" varchar NOT NULL,
	"full_name" varchar NOT NULL,
	"phone" varchar,
	"role" varchar,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "weekly_engagement" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer,
	"week_start" varchar NOT NULL,
	"days_active" integer DEFAULT 0,
	"total_time" integer DEFAULT 0,
	"average_session_duration" numeric DEFAULT '0',
	"engagement_streak" integer DEFAULT 0,
	"topics_progressed" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "xp_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"type" varchar NOT NULL,
	"amount" integer NOT NULL,
	"source" varchar NOT NULL,
	"description" text NOT NULL,
	"metadata" json,
	"balance_before" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"session_id" integer,
	"idempotency_key" varchar,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "xp_transactions_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
ALTER TABLE "ai_training_sessions" ADD CONSTRAINT "ai_training_sessions_initiated_by_users_id_fk" FOREIGN KEY ("initiated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_training_sessions" ADD CONSTRAINT "ai_training_sessions_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_assignment_id_teacher_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."teacher_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_participation" ADD CONSTRAINT "challenge_participation_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_participation" ADD CONSTRAINT "challenge_participation_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_badge_reward_badge_definitions_id_fk" FOREIGN KEY ("badge_reward") REFERENCES "public"."badge_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_analytics" ADD CONSTRAINT "class_analytics_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_analytics" ADD CONSTRAINT "class_analytics_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_enrollments" ADD CONSTRAINT "class_enrollments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_enrollments" ADD CONSTRAINT "class_enrollments_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_enrollments" ADD CONSTRAINT "class_enrollments_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_templates" ADD CONSTRAINT "content_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_documents" ADD CONSTRAINT "curriculum_documents_category_id_document_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."document_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_documents" ADD CONSTRAINT "curriculum_documents_validated_by_users_id_fk" FOREIGN KEY ("validated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_documents" ADD CONSTRAINT "curriculum_documents_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_documents" ADD CONSTRAINT "curriculum_documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_activity" ADD CONSTRAINT "daily_activity_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_categories" ADD CONSTRAINT "document_categories_parent_category_id_document_categories_id_fk" FOREIGN KEY ("parent_category_id") REFERENCES "public"."document_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_permissions" ADD CONSTRAINT "document_permissions_document_id_curriculum_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."curriculum_documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_permissions" ADD CONSTRAINT "document_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_permissions" ADD CONSTRAINT "document_permissions_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_permissions" ADD CONSTRAINT "document_permissions_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_usage_analytics" ADD CONSTRAINT "document_usage_analytics_document_id_curriculum_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."curriculum_documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_document_id_curriculum_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."curriculum_documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_readiness" ADD CONSTRAINT "exam_readiness_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamification_notifications" ADD CONSTRAINT "gamification_notifications_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamification_notifications" ADD CONSTRAINT "gamification_notifications_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamification_notifications" ADD CONSTRAINT "gamification_notifications_badge_id_badge_definitions_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badge_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamification_notifications" ADD CONSTRAINT "gamification_notifications_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamification_notifications" ADD CONSTRAINT "gamification_notifications_leaderboard_id_leaderboards_id_fk" FOREIGN KEY ("leaderboard_id") REFERENCES "public"."leaderboards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "leaderboard_entries_leaderboard_id_leaderboards_id_fk" FOREIGN KEY ("leaderboard_id") REFERENCES "public"."leaderboards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "leaderboard_entries_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboards" ADD CONSTRAINT "leaderboards_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboards" ADD CONSTRAINT "leaderboards_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_sessions" ADD CONSTRAINT "learning_sessions_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_achievements" ADD CONSTRAINT "parent_achievements_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_achievements" ADD CONSTRAINT "parent_achievements_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_engagement" ADD CONSTRAINT "parent_engagement_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_engagement" ADD CONSTRAINT "parent_engagement_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_goals" ADD CONSTRAINT "parent_goals_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_attempts" ADD CONSTRAINT "problem_attempts_session_id_learning_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."learning_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_attempts" ADD CONSTRAINT "problem_attempts_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress" ADD CONSTRAINT "progress_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_catalog" ADD CONSTRAINT "reward_catalog_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_reward_id_reward_catalog_id_fk" FOREIGN KEY ("reward_id") REFERENCES "public"."reward_catalog"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_alerts" ADD CONSTRAINT "student_alerts_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_alerts" ADD CONSTRAINT "student_alerts_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_alerts" ADD CONSTRAINT "student_alerts_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_alerts" ADD CONSTRAINT "student_alerts_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_badges" ADD CONSTRAINT "student_badges_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_badges" ADD CONSTRAINT "student_badges_badge_id_badge_definitions_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badge_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_schools" ADD CONSTRAINT "student_schools_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_schools" ADD CONSTRAINT "student_schools_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_wallets" ADD CONSTRAINT "student_wallets_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_xp" ADD CONSTRAINT "student_xp_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_achievements" ADD CONSTRAINT "teacher_achievements_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_achievements" ADD CONSTRAINT "teacher_achievements_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_achievements" ADD CONSTRAINT "teacher_achievements_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_assignments" ADD CONSTRAINT "teacher_assignments_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_assignments" ADD CONSTRAINT "teacher_assignments_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_schools" ADD CONSTRAINT "teacher_schools_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_schools" ADD CONSTRAINT "teacher_schools_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_mastery" ADD CONSTRAINT "topic_mastery_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_engagement" ADD CONSTRAINT "weekly_engagement_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xp_transactions" ADD CONSTRAINT "xp_transactions_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xp_transactions" ADD CONSTRAINT "xp_transactions_session_id_learning_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."learning_sessions"("id") ON DELETE no action ON UPDATE no action;