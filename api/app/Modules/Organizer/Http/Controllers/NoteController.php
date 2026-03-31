<?php

namespace App\Modules\Organizer\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Http\Controllers\Controller;
use App\Modules\Organizer\Http\Requests\ArchiveNoteRequest;
use App\Modules\Organizer\Http\Requests\PinNoteRequest;
use App\Modules\Organizer\Http\Requests\StoreNoteRequest;
use App\Modules\Organizer\Http\Requests\UpdateNoteRequest;
use App\Modules\Organizer\Http\Resources\NoteResource;
use App\Modules\Organizer\Models\Note;
use App\Modules\Organizer\Services\NoteQueryService;
use App\Modules\Organizer\UseCases\CreateNote;
use App\Modules\Organizer\UseCases\SetNoteArchivedState;
use App\Modules\Organizer\UseCases\SetNotePinnedState;
use App\Modules\Organizer\UseCases\UpdateNote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    public function index(Request $request, NoteQueryService $queryService): JsonResponse
    {
        $this->authorize('viewAny', Note::class);

        $notes = $queryService->getFilteredNotes($request->user(), $request->all())->get();

        return ApiResponse::data(NoteResource::collection($notes));
    }

    public function store(StoreNoteRequest $request, CreateNote $action): JsonResponse
    {
        $this->authorize('create', Note::class);

        $note = $action->handle($request->user(), $request->validated());

        return ApiResponse::created(data: new NoteResource($note));
    }

    public function show(Note $note): JsonResponse
    {
        $this->authorize('view', $note);
        $note->load('tasks');

        return ApiResponse::data(new NoteResource($note));
    }

    public function update(UpdateNoteRequest $request, Note $note, UpdateNote $action): JsonResponse
    {
        $this->authorize('update', $note);

        $note = $action->handle($note, $request->validated());

        return ApiResponse::ok('Нотатку успішно оновлено.', new NoteResource($note));
    }

    public function pin(PinNoteRequest $request, Note $note, SetNotePinnedState $action): JsonResponse
    {
        $this->authorize('update', $note);

        $note = $action->handle($note, $request->boolean('is_pinned'));

        return ApiResponse::ok('Стан закріплення нотатки успішно оновлено.', new NoteResource($note));
    }

    public function archive(ArchiveNoteRequest $request, Note $note, SetNoteArchivedState $action): JsonResponse
    {
        $this->authorize('update', $note);

        $note = $action->handle($note, $request->boolean('archived'));

        return ApiResponse::ok('Стан архівації нотатки успішно оновлено.', new NoteResource($note));
    }

    public function destroy(Note $note): JsonResponse
    {
        $this->authorize('delete', $note);

        $note->delete();

        return ApiResponse::ok('Нотатку успішно видалено.');
    }
}
