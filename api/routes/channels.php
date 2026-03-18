<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('space.{id}', function ($user, $id) {
    // В ідеалі: return $user->spaces->contains($id);
    return true; 
});

Broadcast::channel('file.{id}', function ($user, $id) {
    // Чи має користувач доступ до файлу
    return true;
});
