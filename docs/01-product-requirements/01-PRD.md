# Udoy

## 1. Overview
**Udoy** is a lightweight digital learning environment designed to empower underprivileged students in **Classes 6 to 8**. It delivers structured, high-quality academic and life-skills education through an accessible, intuitive interface optimized for **low bandwidth** and **basic devices**.

This document defines the platform’s purpose, user roles, system flows, and technical subsystems to ensure shared understanding across product, design, and development teams.

---

## 2. Purpose
The platform aims to:
- Provide **equal access** to quality learning content for underserved students.  
- Offer a **guided, gamified learning journey** that sustains motivation.  
- Enable collaboration among creators, validators, coaches, sponsors, and administrators.  
- Ensure **secure and ethical data protection**, especially for minors.

---

## 3. User Roles & Responsibilities

### 3.1 Students
- Register and log in securely.  
- Manage personal profiles and learning preferences.  
- Browse, enroll in, and complete courses (online/offline).  
- Take quizzes, track progress, and earn rewards.  
- Receive notifications and updates.

### 3.2 Content Creators
- Develop structured, multimedia topics and quizzes.  
- Tag and align content with curriculum standards.  
- Save drafts, revise, and submit for validation.  
- Review engagement analytics.

### 3.3 Validators
- Review, edit, and approve content and quizzes.  
- Ensure academic quality, accuracy, and child-appropriate standards.  
- Manage version control and provide feedback.

### 3.4 Coaches
- Organize approved topics into chapters, subjects, and courses.  
- Track student performance and engagement.  
- Motivate learners using credits and badges.  
- Allocate credits and provide feedback.

### 3.5 Admins
- Manage user accounts, permissions, and content governance.  
- Configure platform settings and monitor performance.  
- Enforce security, compliance, and operational integrity.

### 3.6 Sponsors
- Contribute credits to support learning.  
- Access transparent reports on credit usage and impact.  
- Participate in sponsorship programs and track outcomes.

> **Note:** “Mentor” and “Coach” are unified under **Coach** for simplicity.

---

## 4. Key Features by Role

### 4.1 Students
- Secure registration, login, and profile management.  
- Access courses organized by subject, chapter, and topic.  
- Offline content access with auto-sync.  
- Progress tracking, achievements, and certificates (near real-time online; deferred offline).  
- Interactive quizzes with instant feedback.  
- Notifications for milestones and announcements.  
- In-app helpdesk or chatbot support.

### 4.2 Content Creators
- Author multimedia lessons and quizzes.  
- Use tagging and curriculum alignment tools.  
- Manage drafts, revisions, and publishing workflows.  
- Collaborate with validators and monitor engagement analytics.

### 4.3 Validators
- Review and approve submitted lessons and quizzes.  
- Ensure quality, accuracy, and readability.  
- Manage content versions and audit trails.  
- Generate content quality and compliance reports.

### 4.4 Coaches
- Build and structure courses from approved topics.  
- Track student progress and performance metrics.  
- Award credits, badges, and motivational rewards.  
- Send feedback and recommendations.  
- Collaborate on continuous course improvement.

### 4.5 Admins
- Manage users, roles, and permissions.  
- Oversee content libraries and credit distribution.  
- Configure notification templates and platform settings.  
- Monitor analytics and enforce compliance.  

### 4.6 Sponsors
- Donate learning credits.  
- Track credit distribution and usage.  
- View sponsorship impact dashboards.  
- Receive milestone notifications.
- Aggregated/anonymized reporting only; no student PII exposure.

---

## 5. Platform Flows

### 5.1 Content Creation Flow
1. Creator drafts topics and quizzes.  
2. Validator reviews and approves.  
3. Coach organizes approved content into courses.  
4. Students enroll and access published courses.

### 5.2 Student Learning Flow
1. Student logs in and browses courses.  
2. Completes lessons and quizzes.  
3. Progress auto-tracked in LMS.  
4. Credits and badges awarded upon completion (server-confirmed; deferred if offline).

### 5.3 Credit Distribution Flow
1. Sponsors donate credits.  
2. Credits are awarded when completions are confirmed server-side; offline completions are queued and processed on sync.  
3. Coaches can allocate additional rewards.  
4. Sponsors track distribution transparently via aggregated, privacy-preserving reports.

### 5.4 Notification Flow
- Key platform events (e.g., completions, approvals, awards) trigger automated notifications.  
- Primary: in-app and email; optional SMS for guardians. Templates are multi-language.

### 5.5 Administration Flow
- Admins manage users, content, notifications, and compliance.  
- Use analytics dashboards for governance and optimization.

---

## 6. Core Platform Systems
> Terminology note: In this document, "CMS" refers to Course Management System (not Content Management System).

### 6.1 User Management System (UMS)
**Purpose**  
Manage user registration, authentication, roles, and access permissions.

**Key Features**  
- Secure registration and login with age-appropriate flows.  
- Role-based access control for all user types.  
- Password reset and account recovery.  
- Account activation/deactivation by Admins.  
- Session and token management.
- Guardian/coach-assisted registration with email verification; session extension for intermittent connectivity.

**Roles & Responsibilities**  
- **Admins:** Manage users and roles.  
- **All Users:** Register, log in/out, and maintain account details.

**Inter-System Integration**  
- Foundation for all systems (PMS, LMS, CMS, CrMS).  
- Controls authentication and authorization across modules.

---

### 6.2 Profile Management System (PMS)
**Purpose**  
Enable users to personalize and manage profile information.

**Key Features**  
- Profile picture, bio, and contact details.  
- Learning preferences (language, topics, pace).  
- Notification and accessibility settings.  
- Admin moderation for child safety.

**Roles & Responsibilities**  
- **All Users:** Manage their profiles.  
- **Admins:** Moderate and edit profiles if needed.

**Inter-System Integration**  
- Linked to UMS for identity.  
- Feeds personalization into LMS, NS, and Compliance systems.

---

### 6.3 Notification System (NS)
**Purpose**  
Serve as a unified communication hub for automated alerts.

**Key Features**  
- Role-based triggers for key events.  
- Email delivery with reusable templates.  
- Multi-language and multi-channel support (in-app, email; optional SMS for guardians).  
- Logging and delivery tracking.

**Roles & Responsibilities**  
- **Admins:** Configure templates and frequency.  
- **All Users:** Receive relevant notifications.

**Inter-System Integration**  
- Integrated with UMS, LMS, CrMS, TMS, GS, and FSS.  
- Drives gamification and event communication.

---

### 6.4 Topic Management System (TMS)
**Purpose**  
Facilitate creation and management of educational topics.

**Key Features**  
- Block-style editor supporting multimedia.  
- Tagging for classification and curriculum alignment.  
- Draft, review, and publish workflows.  
- Accessibility and formatting tools.
- Multi-language authoring and translation linking with per-language metadata and accessibility.

**Roles & Responsibilities**  
- **Creators:** Author and tag topics.  
- **Validators:** Review and approve content.  
- **Admins:** Moderate topic libraries.

**Inter-System Integration**  
- Feeds CMS and LMS.  
- Linked with Version Control and Analytics.

---

### 6.5 Quiz Management System (QMS)
**Purpose**  
Manage creation, validation, and analysis of assessments.

**Key Features**  
- Multiple question types (MCQ, short answer, matching).  
- Quiz-item bank for reuse.  
- Scoring, timing, and attempt limits.  
- Randomization for integrity.  
- Result analytics and reporting.
- Offline attempt enforcement with local counters; server is source of truth on sync; reconciliation prevents exceeding limits.

**Roles & Responsibilities**  
- **Creators:** Design quizzes.  
- **Validators:** Review and approve.  
- **Students:** Attempt quizzes.  
- **Coaches/Admins:** Track performance.

**Inter-System Integration**  
- Embedded in LMS for delivery.  
- Feeds Gamification and Credit systems.

---

### 6.6 Course Management System (CMS)
**Purpose**  
Organize topics and quizzes into structured courses.

**Key Features**  
- Hierarchical structure (Topic → Chapter → Subject → Course).  
- Drafting, scheduling, and publishing tools.  
- Enrollment rules and curriculum tracking.  
- Multi-language and version support.

**Roles & Responsibilities**  
- **Coaches:** Build courses.  
- **Admins:** Manage releases and assignments.  
- **Students:** Enroll and learn.

**Inter-System Integration**  
- Pulls content from TMS and QMS.  
- Powers LMS delivery.  
- Connects with Notification and Analytics.

---

### 6.7 Learning Management System (LMS)
**Purpose**  
Deliver and track structured learning experiences.

**Key Features**  
- Course enrollment and progress tracking.  
- Online and offline content access.  
- Integrated quiz and grading engine.  
- Certificates and achievements generation.  
- Dashboards for learners and coaches.

**Roles & Responsibilities**  
- **Students:** Learn and monitor progress.  
- **Coaches:** Track student engagement.  
- **Admins:** Oversee usage analytics.

**Inter-System Integration**  
- Central consumer of CMS, TMS, QMS.  
- Feeds data to Gamification, Credit, and Analytics systems.  
- Triggers Notification events.

---

### 6.8 Feedback & Support System (FSS)
**Purpose**  
Enable users to provide feedback, rate content, and request support.

**Key Features**  
- Feedback forms for topics and courses.  
- Ratings, comments, and issue reporting.  
- Helpdesk or chatbot integration.  
- Admin issue tracking dashboard.

**Roles & Responsibilities**  
- **Students:** Submit feedback and requests.  
- **Admins:** Track and respond to issues.  
- **Creators/Validators:** Act on feedback for improvement.

**Inter-System Integration**  
- Feeds Analytics and Compliance systems.  
- Sends alerts through Notification System.

---

### 6.9 Version Control System (VCS)
**Purpose**  
Track content changes and enable rollback functionality.

**Key Features**  
- Version history and diff comparison.  
- Draft, approved, and published states.  
- Restore previous versions when needed.

**Roles & Responsibilities**  
- **Creators:** Manage versions.  
- **Validators:** Approve revisions.  
- **Admins:** Restore or enforce rollback.

**Inter-System Integration**  
- Works with TMS, QMS, CMS.  
- Logs updates for Analytics and Compliance.

---

### 6.10 Gamification System (GS)
**Purpose**  
Boost learner engagement through achievements and rewards.

**Key Features**  
- Points, badges, levels, streaks, and leaderboards.  
- Configurable reward rules.  
- Real-time leaderboard updates.  
- Milestone-based achievements.

**Roles & Responsibilities**  
- **Students:** Earn and view achievements.  
- **Coaches:** Recognize and reward learners.  
- **Admins:** Configure and monitor gamification rules.

**Inter-System Integration**  
- Linked to LMS for activity tracking.  
- Connects with Credit and Notification systems.

---

### 6.11 Credit Management System (CrMS)
**Purpose**  
Manage learning credits donated by sponsors and allocated to students.

**Key Features**  
- Credit pool and donation tracking.  
- Awards are granted when completions are confirmed server-side; offline completions are queued and processed on sync.  
- Manual allocation by coaches.  
- Transaction logs and balance updates with eventual consistency; near real-time when online.
- Insufficient credit pool policy: queue awards and notify sponsors/coaches/admins for action; allow admin top-ups; no partial awards without explicit policy.

**Roles & Responsibilities**  
- **Sponsors:** Donate and view impact.  
- **Coaches:** Allocate credits.  
- **Admins:** Oversee fairness and transparency.

**Inter-System Integration**  
- Connects with Gamification and LMS.  
- Sends award notifications.  
- Feeds data to Analytics.

---

### 6.12 Analytics & Reporting System (ARS)
**Purpose**  
Provide insights for data-driven decisions and performance tracking.

**Key Features**  
- Real-time dashboards and reports.  
- Metrics for engagement, completion, and credits.  
- Export and filter tools.  
- Early dropout risk detection.

**Roles & Responsibilities**  
- **Admins:** Monitor platform-wide metrics.  
- **Coaches:** Review learner performance.  
- **Sponsors:** View impact summaries.

**Inter-System Integration**  
- Aggregates data from LMS, CMS, TMS, QMS, CrMS, and GS.  
- Supports Compliance and Optimization functions.

---

### 6.13 Offline & Low-Bandwidth Optimization System (OLOS)
**Purpose**  
Ensure usability in limited or unstable network environments.

**Key Features**  
- Downloadable lessons and quizzes.  
- Auto-sync progress after reconnection.  
- Lightweight media optimization.  
- Resume and continuity support.
- Deferred progress and reward sync with idempotency to prevent duplicate awards.

**Roles & Responsibilities**  
- **Students:** Learn offline and sync later.  
- **Admins:** Track offline usage statistics.

**Inter-System Integration**  
- Extends LMS functionality.  
- Syncs progress into Analytics, Gamification, and Credit systems.

---

### 6.14 Compliance & Safety System (CSS)
**Purpose**  
Ensure child safety, privacy, and legal compliance.

**Key Features**  
- Role-based safety policies and access controls.  
- Guardian consent management for minors.  
- Moderation workflows and audit trails.  
- Data encryption and incident alerts.

**Roles & Responsibilities**  
- **Admins:** Enforce compliance and manage incidents.  
- **All Users:** Adhere to safety and privacy guidelines.

**Inter-System Integration**  
- Works with UMS, PMS, Notification, and Analytics.  
- Feeds data to legal and security monitoring systems.

---

## 7. Platform Rules & Guidelines
- All content must be validated before publication.  
- Student data must remain private and encrypted.  
- Interface must stay child-friendly and accessible.  
- Admins are responsible for integrity and compliance.  
- All platform-triggered notifications flow through the Notification System; conversational helpdesk is handled by the Feedback & Support System.  
- Gamification and credit rewards must remain transparent and ethical.

---

## 8. Feature Summary
- Lightweight, multilingual, and mobile-first.  
- Secure login and role-based access.  
- Structured learning with courses, quizzes, and rewards.  
- Integrated content, analytics, and credit systems.  
- Offline learning support.  
- Strong compliance for minors’ data and safety.

---

## 9. Ecosystem in Action
- **Students** learn and earn through gamified courses.  
- **Creators** produce quality content.  
- **Validators** ensure accuracy and standards.  
- **Coaches** guide and reward learners.  
- **Sponsors** fuel education through credits.  
- **Admins** ensure platform reliability and compliance.

> The **Udoy Learning Platform** functions as a complete **digital learning ecosystem**, blending access, quality, motivation, and equity for children who need it most.
