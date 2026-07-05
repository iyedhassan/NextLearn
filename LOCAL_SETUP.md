# Local Development Setup Guide

## Quick Start

Follow these steps to get NextLearn running on your local machine in under 5 minutes.

### Prerequisites

- PHP 7.3+ installed
- Composer installed
- MySQL or PostgreSQL database
- Node.js and NPM installed

### Step-by-Step Setup

#### 1. Install Dependencies

```bash
composer install
npm install
```

#### 2. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

#### 3. Database Setup

Create a new database:

```sql
CREATE DATABASE nextlearn_clean CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Update `.env` with your database credentials:

```env
DB_DATABASE=nextlearn_clean
DB_USERNAME=root
DB_PASSWORD=your_password
```

#### 4. Run Migrations

```bash
php artisan migrate
```

#### 5. (Optional) Seed Database

```bash
php artisan db:seed
```

This will create:
- Sample admin user (admin@nextlearn.com / password)
- Sample students and tutors
- Sample plans and features
- Sample forms and questions

#### 6. Compile Assets

```bash
npm run dev
```

#### 7. Start Development Server

```bash
php artisan serve
```

Visit: http://localhost:8000

### Default Credentials

After seeding, you can login with:

**Admin:**
- Email: admin@nextlearn.com
- Password: password

**Student:**
- Email: student@nextlearn.com
- Password: password

**Tutor:**
- Email: tutor@nextlearn.com
- Password: password

## Development Tools

### Database Management

**Using Tinker:**

```bash
php artisan tinker
```

```php
// Create a user
$user = App\Models\User::create([
    'name' => 'John Doe',
    'email' => 'john@example.com',
    'password' => bcrypt('password'),
    'role' => 'Student',
    'state' => 'Active',
]);

// Query users
App\Models\User::where('role', 'Student')->get();
```

### Clearing Caches

```bash
# Clear all caches
php artisan optimize:clear

# Or individually:
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### Running Tests

```bash
# Run all tests
php artisan test

# Run specific test
php artisan test --filter UserTest

# With coverage
php artisan test --coverage
```

### Queue Workers

For local development with queues:

```bash
# Start queue worker
php artisan queue:work

# Or use queue:listen for auto-reloading
php artisan queue:listen
```

### Watching Assets

For automatic asset recompilation:

```bash
npm run watch
```

## Using SQLite for Local Development

For simpler local development, you can use SQLite:

1. Update `.env`:

```env
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database.sqlite
```

2. Create the database file:

```bash
touch database/database.sqlite
```

3. Run migrations:

```bash
php artisan migrate
```

## Troubleshooting

### Migration Errors

If you encounter migration errors:

```bash
# Reset and re-run migrations
php artisan migrate:fresh

# With seeding
php artisan migrate:fresh --seed
```

### Permission Issues

On Linux/Mac, ensure storage and cache directories are writable:

```bash
chmod -R 775 storage bootstrap/cache
```

### Composer Issues

If composer install fails:

```bash
# Update composer
composer self-update

# Clear composer cache
composer clear-cache

# Try again
composer install
```

### Node/NPM Issues

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

## IDE Setup

### VS Code

Recommended extensions:
- PHP Intelephense
- Laravel Extension Pack
- Laravel Blade Snippets
- PHP Debug

### PHPStorm

1. Install Laravel Plugin
2. Enable Laravel support in settings
3. Configure PHP interpreter
4. Set up database connection

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "Add my feature"

# Push to remote
git push origin feature/my-feature
```

## Next Steps

1. Read the main [README.md](README.md) for full documentation
2. Check [REBUILD_PLAN.md](REBUILD_PLAN.md) for architecture details
3. Explore the API endpoints
4. Start building features!

## Getting Help

- Check the documentation
- Review existing code
- Ask in team chat
- Open an issue on GitHub

---

Happy coding! 🚀
