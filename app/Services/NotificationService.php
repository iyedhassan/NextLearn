<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Send a notification to a user.
     *
     * @param User $user
     * @param string $title
     * @param string $message
     * @param array $data
     * @return bool
     */
    public function notify(User $user, string $title, string $message, array $data = [])
    {
        // Store notification in database
        \App\Models\Notification::create([
            'user_id' => $user->id,
            'title' => $title,
            'message' => $message,
            'type' => $data['type'] ?? 'info',
            'data' => $data,
        ]);

        // Also log for debugging
        Log::info("Notification to User {$user->id} ({$user->email}): [{$title}] {$message}", $data);

        // In a real app, this could also send an email, push notification, or SMS
        // Mail::to($user->email)->send(new GeneralNotification($title, $message));

        return true;
    }

    /**
     * Send an email verification notification.
     */
    public function sendEmailVerification(User $user)
    {
        return $this->notify($user, "Vérifiez votre email", "Veuillez cliquer sur le lien suivant pour vérifier votre compte.");
    }

    /**
     * Send a welcome notification.
     */
    public function sendWelcome(User $user)
    {
        return $this->notify($user, "Bienvenue sur NextLearn !", "Exploration passionnante en vue. Commencez votre premier cours dès maintenant !");
    }

    /**
     * Notify about successful payment.
     */
    public function notifyPaymentSuccess(User $user, $amount)
    {
        return $this->notify($user, "Paiement réussi", "Nous avons bien reçu votre paiement de {$amount}. Votre abonnement est maintenant actif.");
    }
}
