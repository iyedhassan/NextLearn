# NextLearn - Clean E-Learning Platform

![Laravel](https://img.shields.io/badge/Laravel-8.x-red.svg)
![PHP](https://img.shields.io/badge/PHP-7.3%2B-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

A modern, clean, and maintainable e-learning platform built with Laravel 8. This is a complete rebuild of the legacy E-Learning V1 project, following modern Laravel best practices and clean architecture principles.

## 🎯 Project Overview

NextLearn is a comprehensive e-learning platform that supports:

- **Multi-role System**: Admin, Student, and Tutor roles
- **Subscription Management**: Flexible plans with features and coupons
- **Learning Sessions**: One-on-one tutoring sessions with scheduling
- **Assessment System**: Forms, quizzes, exams with auto-grading
- **Admission Workflow**: Student and tutor application process
- **Payment Processing**: Invoice generation and payment tracking
- **Gamification**: Credits and reputation system
- **Real-time Sessions**: Live session tracking and monitoring

## 📋 Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Database Schema](#database-schema)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### User Management
- Multi-role authentication (Admin, Student, Tutor)
- Comprehensive user profiles with personal information
- Address, phone, and bank account management
- User preferences and settings
- Activity tracking (last login, last seen)
- API token authentication via Laravel Sanctum

### Subscription & Billing
- Flexible subscription plans (Single, Weekly, Monthly, Yearly)
- Plan features with credits and session allowances
- Coupon system with expiration and usage limits
- Invoice generation and payment tracking
- Subscription lifecycle management

### Education System
- **Forms & Assessments**: Create quizzes, exams, exercises, and auditions
- **Question Types**: Short answer, link, text, select, checkbox
- **Auto-grading**: Automatic scoring with correct answers
- **Sessions**: Schedule and manage tutoring sessions
- **Admissions**: Application and approval workflow
- **Lessons**: Track completed learning activities
- **Live Sessions**: Real-time session monitoring

### Gamification
- Credits system for transactions
- Reputation points for user engagement
- Deposit and withdrawal tracking

## 🔧 Requirements

- **PHP**: 7.3 or higher (8.0+ recommended)
- **Composer**: Latest version
- **Database**: MySQL 5.7+ or PostgreSQL 9.6+
- **Node.js**: 12.x or higher (for asset compilation)
- **Web Server**: Apache or Nginx

## 📦 Installation

### 1. Clone the Repository

```bash
git clone <repository-url> nextlearn-clean
cd nextlearn-clean
```

### 2. Install Dependencies

```bash
# Install PHP dependencies
composer install

# Install Node dependencies
npm install
```

### 3. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 4. Configure Database

Edit `.env` file with your database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nextlearn_clean
DB_USERNAME=root
DB_PASSWORD=your_password
```

### 5. Run Migrations

```bash
# Run all migrations
php artisan migrate

# (Optional) Seed the database with sample data
php artisan db:seed
```

### 6. Compile Assets

```bash
# Development
npm run dev

# Production
npm run production
```

### 7. Start the Development Server

```bash
php artisan serve
```

Visit `http://localhost:8000` in your browser.

## 🗄️ Database Schema

### Core Tables

#### Users & Profiles
- `users` - Main user accounts with roles and authentication
- `people` - Extended user profile information
- `addresses` - User addresses
- `phones` - User phone numbers
- `bank_accounts` - Payment information
- `preferences` - User application preferences
- `settings` - Profile customization and privacy settings

#### Merchant/Subscription
- `plans` - Subscription plans and pricing
- `features` - Plan features and allowances
- `coupons` - Discount coupons
- `subscriptions` - User subscriptions
- `invoices` - Payment invoices

#### Education
- `sessions` - Tutoring sessions
- `forms` - Quizzes, exams, and assessments
- `questions` - Form questions
- `answers` - User answers
- `admissions` - Application approvals
- `lessons` - Completed lessons
- `auditions` - Session assessments
- `lives` - Live session tracking
- `deposits` - Credit transactions

#### System
- `feedbacks` - User feedback
- `notifications` - User notifications
- `password_resets` - Password reset tokens
- `failed_jobs` - Failed queue jobs
- `personal_access_tokens` - API tokens (Sanctum)

See `REBUILD_PLAN.md` for detailed schema documentation.

## ⚙️ Configuration

### Application Settings

Edit `.env` file:

```env
APP_NAME=NextLearn
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

# Timezone and Localization
APP_TIMEZONE=UTC
APP_LOCALE=en
```

### Mail Configuration

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@nextlearn.com
MAIL_FROM_NAME="${APP_NAME}"
```

### Queue Configuration

For production, use Redis or database queue:

```env
QUEUE_CONNECTION=database
```

Then run the queue worker:

```bash
php artisan queue:work
```

### Cache Configuration

```env
CACHE_DRIVER=redis
SESSION_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

## 🚀 Usage

### Creating an Admin User

```bash
php artisan tinker
```

```php
$user = App\Models\User::create([
    'name' => 'Admin User',
    'email' => 'admin@nextlearn.com',
    'password' => bcrypt('password'),
    'role' => 'Admin',
    'state' => 'Active',
    'email_verified_at' => now(),
]);
```

### User Roles

- **Admin**: Full system access, manage users, plans, and content
- **Student**: Enroll in sessions, take assessments, view progress
- **Tutor**: Create content, manage sessions, grade assessments

### API Authentication

The API uses Laravel Sanctum for token-based authentication:

```bash
# Login to get token
POST /api/login
{
    "email": "user@example.com",
    "password": "password"
}

# Use token in subsequent requests
Authorization: Bearer {token}
```

## 📚 API Documentation

### Authentication Endpoints

```
POST   /api/register          - Register new user
POST   /api/login             - Login and get token
POST   /api/logout            - Logout and revoke token
GET    /api/user              - Get authenticated user
```

### User Endpoints

```
GET    /api/users             - List users (Admin only)
GET    /api/users/{id}        - Get user details
PUT    /api/users/{id}        - Update user
DELETE /api/users/{id}        - Delete user (Admin only)
```

### Session Endpoints

```
GET    /api/sessions          - List sessions
POST   /api/sessions          - Create session
GET    /api/sessions/{id}     - Get session details
PUT    /api/sessions/{id}     - Update session
DELETE /api/sessions/{id}     - Cancel session
```

### Form Endpoints

```
GET    /api/forms             - List forms
POST   /api/forms             - Create form
GET    /api/forms/{id}        - Get form with questions
PUT    /api/forms/{id}        - Update form
DELETE /api/forms/{id}        - Delete form
POST   /api/forms/{id}/submit - Submit form answers
```

### Plan Endpoints

```
GET    /api/plans             - List plans
GET    /api/plans/{id}        - Get plan details
POST   /api/subscribe         - Subscribe to plan
GET    /api/subscriptions     - List user subscriptions
```

## 🧪 Testing

```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature

# Run with coverage
php artisan test --coverage
```

## 🌐 Deployment

### Production Checklist

1. **Environment Configuration**
   ```bash
   APP_ENV=production
   APP_DEBUG=false
   ```

2. **Optimize Application**
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   composer install --optimize-autoloader --no-dev
   ```

3. **Database**
   ```bash
   php artisan migrate --force
   ```

4. **Queue Worker**
   ```bash
   # Use supervisor to keep queue worker running
   php artisan queue:work --daemon
   ```

5. **Scheduler**
   ```bash
   # Add to crontab
   * * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
   ```

### Server Requirements

- PHP 7.3+ with required extensions (see composer.json)
- MySQL 5.7+ or PostgreSQL 9.6+
- Redis (recommended for cache and sessions)
- Supervisor (for queue workers)
- SSL certificate (Let's Encrypt recommended)

## 🏗️ Architecture

### Directory Structure

```
app/
├── Http/
│   ├── Controllers/     # HTTP controllers
│   ├── Middleware/      # Custom middleware
│   ├── Requests/        # Form request validation
│   └── Resources/       # API resources
├── Models/              # Eloquent models
├── Services/            # Business logic
└── Policies/            # Authorization policies

database/
├── migrations/          # Database migrations
├── seeders/            # Database seeders
└── factories/          # Model factories

routes/
├── web.php             # Web routes
├── api.php             # API routes
└── channels.php        # Broadcast channels
```

### Design Principles

- **Thin Controllers**: Controllers only handle HTTP requests/responses
- **Service Layer**: Business logic encapsulated in service classes
- **Repository Pattern**: (Optional) Data access abstraction
- **Form Requests**: Validation in dedicated request classes
- **API Resources**: Consistent API response formatting
- **Policies**: Authorization logic separation
- **Events & Listeners**: Decoupled feature implementation

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Follow PSR-12 coding standards
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Original Project**: E-Learning V1
- **Rebuild**: NextLearn Clean (2025)

## 🙏 Acknowledgments

- Laravel Framework
- Laravel Sanctum for API authentication
- All contributors to the original project

## 📞 Support

For support, email support@nextlearn.com or open an issue on GitHub.

---

**Built with ❤️ using Laravel 8**
#   N e x t L e a r n  
 