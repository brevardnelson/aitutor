# Caribbean AI Tutor - Demo Accounts & Access Guide

## 🔗 Platform Access
**Main Application URL**: [http://localhost:5000](http://localhost:5000)

---

## 👥 Demo Account Credentials
All demo accounts use the password: **`demo123`**

### 🎓 Student Accounts
| Name | Email | Role | Grade Level | School |
|------|-------|------|-------------|---------|
| Emily Johnson | `emily.student@demo.com` | Student | Form 4 (Caribbean) | Caribbean International Academy |
| Marcus Williams | `marcus.student@demo.com` | Student | Form 4 (Caribbean) | Caribbean International Academy |
| Sophia Garcia | `sophia.student@demo.com` | Student | Grade 8 (US) | Sunshine Elementary School |
| David Thompson | `david.student@demo.com` | Student | Grade 8 (US) | Sunshine Elementary School |
| Ava Mitchell | `ava.student@demo.com` | Student | Grade 8 (US) | Sunshine Elementary School |

**Student Features to Test:**
- ✅ Interactive AI tutoring sessions
- ✅ Gamification system (XP, levels, achievements)
- ✅ Progress tracking and analytics
- ✅ Weekly challenges and competitions
- ✅ Digital wallet and point redemption

---

### 👨‍👩‍👧‍👦 Parent Accounts
| Name | Email | Role | Children |
|------|-------|------|----------|
| Robert Johnson | `parent.johnson@demo.com` | Parent | Emily Johnson |
| Lisa Williams | `parent.williams@demo.com` | Parent | Marcus Williams |
| Carlos Garcia | `parent.garcia@demo.com` | Parent | Sophia Garcia |

**Parent Features to Test:**
- ✅ **Achievement Center Dashboard** (NEW)
  - Real-time achievement notifications
  - Parent engagement badges
  - Smart reward recommendations
- ✅ Child progress monitoring
- ✅ Detailed analytics and reports
- ✅ Email notifications (integrated with Replit Mail)
- ✅ Multi-child management

---

### 👩‍🏫 Teacher Accounts
| Name | Email | Role | Subject | School |
|------|-------|------|---------|---------|
| Dr. Sarah Martinez | `teacher.math@demo.com` | Teacher | Mathematics | Caribbean International Academy |
| Prof. Michael Chen | `teacher.science@demo.com` | Teacher | Science | Sunshine Elementary School |
| Ms. Jennifer Brown | `teacher.english@demo.com` | Teacher | English | Various Schools |

**Teacher Features to Test:**
- ✅ Class management and student oversight
- ✅ Progress analytics and reporting
- ✅ Assignment creation and grading
- ✅ Student performance insights

---

### 👑 Administrator Accounts
| Name | Email | Role | Access Level |
|------|-------|------|--------------|
| Principal James Wilson | `admin.school@demo.com` | School Admin | Caribbean International Academy |
| Dr. Maria Rodriguez | `admin.district@demo.com` | District Admin | Port of Spain District |
| System Administrator | `admin.system@demo.com` | System Admin | Full Platform Access |

**Administrator Features to Test:**
- ✅ Institutional hierarchy management
- ✅ User management and role assignments
- ✅ System-wide analytics and reporting
- ✅ Multi-institutional oversight

---

## 🏗️ Demo Data Structure

### Institutional Hierarchy
```
Caribbean Region
└── Port of Spain District
    └── Caribbean International Academy
        └── Advanced Mathematics (Form 4)

US Southeast Region  
└── Miami-Dade County
    └── Sunshine Elementary School
        └── General Science (Grade 8)
```

### Student-Parent Relationships
- **Robert Johnson** → Parent of **Emily Johnson**
- **Lisa Williams** → Parent of **Marcus Williams**  
- **Carlos Garcia** → Parent of **Sophia Garcia**

### Class Assignments
- **Dr. Sarah Martinez** → Advanced Mathematics (Caribbean)
- **Prof. Michael Chen** → General Science (US)

---

## 🎮 Gamification Data Included

### Student Progress (Realistic Test Data)
- **XP Levels**: 1,500 - 2,700 XP across students
- **Achievement Badges**: "Week Warrior", "Problem Solver", etc.
- **Weekly Challenges**: Active math mastery challenge
- **Point Balances**: 150-400 available points for redemption
- **Streaks**: 7-18 day learning streaks

### Parent Engagement
- **Engagement Scores**: 75-95% across different families
- **Parent Badges**: "Supportive Parent", "Challenge Champion"
- **Notification History**: Recent achievement alerts and weekly summaries
- **Login Patterns**: Realistic weekly engagement data

---

## 🚀 Quick Testing Guide

### 1. Parent Dashboard Testing
1. Login as `parent.johnson@demo.com`
2. Navigate to **Achievement Center** tab
3. View real-time notifications and parent badges
4. Check smart reward recommendations for Emily

### 2. Student Experience
1. Login as `emily.student@demo.com`  
2. Access learning modules and complete lessons
3. View gamification progress and achievements
4. Test point redemption system

### 3. Teacher Management
1. Login as `teacher.math@demo.com`
2. View assigned classes and student progress
3. Access detailed analytics for Form 4 students

### 4. Administrator Overview
1. Login as `admin.system@demo.com`
2. View system-wide analytics and reports
3. Manage institutional hierarchy

---

## 📊 Automated Systems Active

- ✅ **Weekly Challenge System**: Auto-generates new challenges
- ✅ **Leaderboard Automation**: Updates daily/weekly/monthly rankings
- ✅ **Parent Notification Service**: Real-time achievement alerts
- ✅ **Badge System**: Automatic parent engagement tracking
- ✅ **Email Integration**: Replit Mail service for notifications

---

## 🔧 Technical Notes

- **Database**: PostgreSQL with comprehensive schema
- **Authentication**: JWT-based with role-based access control
- **Real-time Features**: Parent notifications and live progress updates
- **Email Service**: Integrated Replit Mail for production-ready notifications
- **API Status**: Backend running on port 3001, frontend on port 5000

---

## 🎯 Key Features to Demonstrate

1. **Multi-Institutional Support**: Caribbean vs US grade systems
2. **Comprehensive Role Management**: Students, parents, teachers, admins
3. **Advanced Gamification**: XP, achievements, challenges, leaderboards
4. **Parent Engagement Hub**: Notifications, badges, smart recommendations
5. **Real-time Analytics**: Progress tracking across all user types
6. **Educational AI**: Socratic method tutoring system
7. **Scalable Architecture**: Region → District → School → Class hierarchy

Login with any of the accounts above using password **`demo123`** and explore the full platform capabilities!