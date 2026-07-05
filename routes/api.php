<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\FormController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\AnswerController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\AdmissionController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\CategoryController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Routes
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/register', [AuthController::class, 'register']);
Route::get('/forms', [FormController::class, 'index']); // Public for Popular Courses
Route::get('/forms/{id}', [FormController::class, 'show']); // Public to view course details
Route::get('/categories', [CategoryController::class, 'index']); // Public to view categories
Route::get('/plans', [PlanController::class, 'index']); // Public to view plans on landing page
Route::get('/feedbacks', [FeedbackController::class, 'index']); // Public to view reviews

// Public user search and profile viewing
Route::get('/users', [UserController::class, 'index']); // Search users
Route::get('/users/{id}', [UserController::class, 'show']); // View user profile

Route::middleware('auth:sanctum')->group(function () {
    // Auth User
    Route::get('/user/me', [UserController::class, 'me']);

    // Core Resources
    Route::post('/users/{id}/photo', [UserController::class, 'uploadPhoto']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::apiResource('plans', PlanController::class)->except(['index']);

    // Categories
    Route::post('/categories/find-or-create', [CategoryController::class, 'findOrCreate']);
    Route::apiResource('categories', CategoryController::class)->except(['index']);

    // Subscriptions
    Route::post('/subscriptions/{id}/activate', [SubscriptionController::class, 'activate']);
    Route::apiResource('subscriptions', SubscriptionController::class);

    // Invoices
    Route::post('/invoices/{id}/pay', [InvoiceController::class, 'markAsPaid']);
    Route::apiResource('invoices', InvoiceController::class);

    // Coupons
    Route::post('/coupons/validate', [CouponController::class, 'validateCoupon']);
    Route::apiResource('coupons', CouponController::class);

    // Education Resources
    Route::apiResource('forms', FormController::class)->except(['index', 'show']);
    Route::post('/forms/{id}/purchase', [FormController::class, 'purchase']);
    Route::apiResource('questions', QuestionController::class);
    Route::apiResource('answers', AnswerController::class);

    // Sessions
    Route::post('/sessions/{id}/confirm', [SessionController::class, 'confirm']);
    Route::apiResource('sessions', SessionController::class);

    // Lessons
    Route::post('/lessons/{id}/complete', [LessonController::class, 'complete']);
    Route::apiResource('lessons', LessonController::class);


    Route::apiResource('topics', \App\Http\Controllers\TopicController::class);

    // Image Upload
    Route::post('/upload/course-image', [\App\Http\Controllers\ImageUploadController::class, 'uploadCourseImage']);
    Route::post('/upload/topic-image', [\App\Http\Controllers\ImageUploadController::class, 'uploadTopicImage']);
    Route::post('/upload/multiple-images', [\App\Http\Controllers\ImageUploadController::class, 'uploadMultipleImages']);
    Route::delete('/upload/delete-image', [\App\Http\Controllers\ImageUploadController::class, 'deleteImage']);

    // Interaction Resources
    Route::apiResource('admissions', AdmissionController::class);
    Route::apiResource('feedbacks', FeedbackController::class)->except(['index']);

    // Favorites
    Route::get('/favorites', [\App\Http\Controllers\FavoriteController::class, 'index']);
    Route::post('/favorites/toggle/{courseId}', [\App\Http\Controllers\FavoriteController::class, 'toggle']);

    // Notifications
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [\App\Http\Controllers\NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [\App\Http\Controllers\NotificationController::class, 'destroy']);

    // Payments
    Route::post('/payments/{id}/accept', [\App\Http\Controllers\PaymentController::class, 'accept']);
    Route::post('/payments/{id}/reject', [\App\Http\Controllers\PaymentController::class, 'reject']);
    Route::apiResource('payments', \App\Http\Controllers\PaymentController::class);
});
