# NextLearn Clean Rebuild Plan

## Project Overview
This is a complete rebuild of the E-Learning platform (V1) using modern Laravel 8 best practices. The goal is to create a clean, maintainable, and production-ready codebase while preserving all database structures and business logic.

## Database Schema Analysis

### Core Tables

#### 1. **users** - User Management
- Roles: Admin, Student, Tutor
- States: Inactive, Active, On Validation, Banned
- Features: credits, reputation, API tokens, soft deletes
- Relationships: Has one person, addresses, phones, bank_account, preferences, settings

#### 2. **people** - User Profile Details
- Personal information (names, document, birth, gender, nationality)
- One-to-one with users

#### 3. **addresses** - User Addresses
- One-to-one with users

#### 4. **phones** - User Phone Numbers
- One-to-one with users

#### 5. **bank_accounts** - Payment Information
- One-to-one with users

#### 6. **preferences** - User Preferences
- One-to-one with users

#### 7. **settings** - User Settings
- One-to-one with users

### Merchant/Subscription Tables

#### 8. **plans** - Subscription Plans
- Fields: name, price, interval (Single, Weekly, Monthly, Yearly)
- Features: is_recommended flag
- Relationships: Has many features, subscriptions

#### 9. **features** - Plan Features
- Credits, frequency, duration
- Belongs to plan

#### 10. **coupons** - Discount Coupons
- Fields: slug, discount, expires_at
- Relationships: Has many subscriptions

#### 11. **subscriptions** - User Subscriptions
- States: Pending, Activated, Failed
- Relationships: Belongs to user, plan, coupon

#### 12. **invoices** - Payment Invoices
- Relationships: Belongs to subscription

### Education/Learning Tables

#### 13. **forms** - Quizzes/Forms
- Types: Admission, Audition, Exercise, Exam
- States: Draft, Published
- Relationships: Belongs to user (creator), has many questions

#### 14. **questions** - Form Questions
- Types: Short, Link, Text, Select, Check
- Features: correct_answers, is_required, is_matchable
- Relationships: Belongs to form, has many answers

#### 15. **answers** - User Answers
- Relationships: Belongs to user, question, form, session (optional)

#### 16. **sessions** - Learning Sessions
- States: Pending, Confirmed, Canceled, Ongoing, Finished
- Relationships: Student (user), Tutor (user), has many lessons, auditions, lives

#### 17. **lessons** - Completed Lessons
- Relationships: Belongs to session, form

#### 18. **admissions** - Student/Tutor Admissions
- Approval workflow
- Relationships: Belongs to user, form, admin (user)

#### 19. **auditions** - Session Auditions
- Relationships: Belongs to user, session, form

#### 20. **lives** - Live Session Tracking
- Timestamps for session lifecycle
- Relationships: Belongs to session

#### 21. **deposits** - Credit Deposits
- (Schema to be analyzed)

### System Tables

#### 22. **notifications** - User Notifications
- Laravel default notifications table

#### 23. **password_resets** - Password Reset Tokens
- Laravel default

#### 24. **failed_jobs** - Failed Queue Jobs
- Laravel default

#### 25. **jobs** - Queue Jobs
- Laravel default

#### 26. **feedbacks** - User Feedback
- User feedback submissions

## Architecture Design

### Directory Structure
```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Api/
│   │   │   ├── Auth/
│   │   │   ├── User/
│   │   │   ├── Education/
│   │   │   └── Merchant/
│   │   └── Web/
│   ├── Middleware/
│   ├── Requests/
│   └── Resources/
├── Models/
│   ├── User.php
│   ├── Person.php
│   ├── Plan.php
│   ├── Session.php
│   ├── Form.php
│   └── ...
├── Services/
│   ├── Auth/
│   ├── Education/
│   │   ├── SessionService.php
│   │   ├── FormService.php
│   │   └── AdmissionService.php
│   └── Merchant/
│       ├── SubscriptionService.php
│       └── PlanService.php
├── Repositories/ (optional, if needed)
└── Policies/
```

### Key Principles

1. **Thin Controllers**: Controllers only handle HTTP requests/responses
2. **Service Layer**: Business logic lives in service classes
3. **Eloquent Models**: Rich models with relationships and scopes
4. **Form Requests**: Validation in dedicated request classes
5. **API Resources**: Consistent API responses
6. **Policies**: Authorization logic
7. **Events & Listeners**: For decoupled features (notifications, etc.)

## Implementation Phases

### Phase 1: Foundation (Database & Models)
1. Create all migrations
2. Create all Eloquent models with relationships
3. Create model factories for testing
4. Create seeders for initial data

### Phase 2: Authentication & Authorization
1. Implement multi-role authentication (Admin, Student, Tutor)
2. Create policies for authorization
3. API token authentication (Sanctum)
4. Email verification

### Phase 3: Core Services
1. User management service
2. Subscription/plan service
3. Session management service
4. Form/quiz service
5. Admission service

### Phase 4: API Endpoints
1. Auth endpoints
2. User/profile endpoints
3. Education endpoints (sessions, forms, lessons)
4. Merchant endpoints (plans, subscriptions)
5. Admin endpoints

### Phase 5: Testing & Documentation
1. Unit tests for services
2. Feature tests for API endpoints
3. API documentation
4. README with setup instructions

## Migration Strategy

### Database Compatibility
- Use same table names
- Use same column names and types
- Preserve foreign key relationships
- Add indexes for performance
- Use modern Laravel migration features

### Data Migration (if needed)
- Export data from old database
- Import into new database
- Verify data integrity

## Technology Stack

- **Framework**: Laravel 8.x
- **PHP**: 7.3+ / 8.0+
- **Database**: MySQL/PostgreSQL (configurable)
- **Authentication**: Laravel Sanctum (API tokens)
- **Queue**: Database/Redis (configurable)
- **Cache**: File/Redis (configurable)
- **Testing**: PHPUnit

## Development Workflow

1. Create migrations (bottom-up: users → related tables)
2. Create models with relationships
3. Create factories and seeders
4. Create services for business logic
5. Create controllers (thin, delegate to services)
6. Create form requests for validation
7. Create API resources for responses
8. Create policies for authorization
9. Write tests
10. Document APIs

## Configuration

### Environment Variables
```env
APP_NAME=NextLearn
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nextlearn_clean
DB_USERNAME=root
DB_PASSWORD=

CACHE_DRIVER=file
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
```

## Next Steps

1. ✅ Analyze old project structure
2. ✅ Create rebuild plan
3. ⏳ Create database migrations
4. ⏳ Create Eloquent models
5. ⏳ Create seeders
6. ⏳ Implement services
7. ⏳ Create controllers
8. ⏳ Create routes
9. ⏳ Write tests
10. ⏳ Create documentation

---

**Last Updated**: 2025-12-27
**Status**: Planning Complete - Ready for Implementation
