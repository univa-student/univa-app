<?php

namespace App\Modules\User\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\User\Http\Requests\SearchUsersRequest;
use App\Modules\User\Http\Resources\FriendCardResource;
use App\Modules\User\Http\Resources\PendingFriendRequestResource;
use App\Modules\User\Services\FriendshipService;
use App\Modules\User\UseCases\AcceptFriendRequest;
use App\Modules\User\UseCases\RemoveFriendship;
use App\Modules\User\UseCases\SendFriendRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FriendshipController extends Controller
{
    public function index(Request $request, FriendshipService $friendships): JsonResponse
    {
        return ApiResponse::data(
            FriendCardResource::collection(
                $friendships->getFriends($request->user())
            )
        );
    }

    public function pending(Request $request, FriendshipService $friendships): JsonResponse
    {
        return ApiResponse::data(
            PendingFriendRequestResource::collection(
                $friendships->getPendingRequests($request->user())
            )
        );
    }

    public function search(SearchUsersRequest $request, FriendshipService $friendships): JsonResponse
    {
        return ApiResponse::data(
            FriendCardResource::collection(
                $friendships->searchUsers($request->user(), $request->searchTerm())
            )
        );
    }

    public function store(Request $request, User $user, SendFriendRequest $useCase): JsonResponse
    {
        $friendship = $useCase->execute($request->user(), $user);

        return ApiResponse::ok('Запит у друзі надіслано.', [
            'status' => $friendship->status,
        ]);
    }

    public function accept(Request $request, User $user, AcceptFriendRequest $useCase): JsonResponse
    {
        $friendship = $useCase->execute($request->user(), $user);

        return ApiResponse::ok('Запит у друзі прийнято.', [
            'status' => $friendship->status,
        ]);
    }

    public function destroy(Request $request, User $user, RemoveFriendship $useCase): JsonResponse
    {
        $useCase->execute($request->user(), $user);

        return ApiResponse::ok('Дружбу видалено.');
    }

    public function status(Request $request, User $user, FriendshipService $friendships): JsonResponse
    {
        return ApiResponse::data([
            'status' => $friendships->checkStatus($request->user(), $user->id),
        ]);
    }
}
