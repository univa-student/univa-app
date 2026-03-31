<?php

declare(strict_types=1);

namespace Tests\Unit\Ai;

use App\Modules\Ai\DTO\SummarizeFileData;
use App\Modules\Ai\Enums\AiSummaryStyle;
use Tests\TestCase;

class SummarizeFileDataTest extends TestCase
{
    public function test_it_builds_multi_file_summary_payload_with_style_and_flashcards(): void
    {
        $data = SummarizeFileData::fromArray([
            'user_id' => 15,
            'file_ids' => [4, 8],
            'style' => 'beginner',
            'include_flashcards' => true,
            'notes' => 'Поясни максимально просто',
        ]);

        $this->assertSame(15, $data->userId);
        $this->assertSame([4, 8], $data->fileIds);
        $this->assertTrue($data->isMultiFile());
        $this->assertSame(4, $data->primaryFileId());
        $this->assertSame(AiSummaryStyle::BEGINNER, $data->style);
        $this->assertTrue($data->includeFlashcards);
        $this->assertSame('Поясни максимально просто', $data->notes);
    }

    public function test_it_keeps_single_file_summary_compatible_with_existing_flow(): void
    {
        $data = SummarizeFileData::fromArray([
            'user_id' => 9,
            'file_id' => 21,
            'style' => 'teacher',
            'include_flashcards' => false,
        ]);

        $this->assertSame([21], $data->fileIds);
        $this->assertFalse($data->isMultiFile());
        $this->assertSame(AiSummaryStyle::TEACHER, $data->style);
        $this->assertFalse($data->includeFlashcards);
    }
}
