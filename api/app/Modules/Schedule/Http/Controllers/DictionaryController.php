<?php

namespace App\Modules\Schedule\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Http\Controllers\Controller;
use App\Modules\Schedule\Models\DeliveryMode;
use App\Modules\Schedule\Models\ExamType;
use App\Modules\Schedule\Models\LessonType;
use App\Modules\Schedule\Models\RecurrenceRule;
use Illuminate\Http\JsonResponse;

class DictionaryController extends Controller
{
    public function lessonTypes(): JsonResponse
    {
        $lessonTypes = LessonType::all();

        return ApiResponse::data($lessonTypes);
    }

    public function deliveryModes(): JsonResponse
    {
        $deliveryModes = DeliveryMode::all();

        return ApiResponse::data($deliveryModes);
    }

    public function examTypes(): JsonResponse
    {
        $examTypes = ExamType::all();

        return ApiResponse::data($examTypes);
    }

    public function recurrenceRules(): JsonResponse
    {
        $recurrenceRules = RecurrenceRule::all();

        return ApiResponse::data($recurrenceRules);
    }
}
