<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // ─── Lesson Types ─────────────────────────────────────────────────────
        $lessonTypes = [
            ['code' => 'lecture', 'name' => 'Лекція', 'color' => '#3b82f6'],
            ['code' => 'practice', 'name' => 'Практичне заняття', 'color' => '#10b981'],
            ['code' => 'laboratory', 'name' => 'Лабораторна робота', 'color' => '#f59e0b'],
            ['code' => 'seminar', 'name' => 'Семінар', 'color' => '#06b6d4'],
            ['code' => 'consultation', 'name' => 'Консультація', 'color' => '#64748b'],
        ];

        foreach ($lessonTypes as $type) {
            DB::table('lesson_types')->updateOrInsert(
                ['code' => $type['code']],
                ['name' => $type['name'], 'color' => $type['color'], 'updated_at' => now()]
            );
        }

        // ─── Exam Types ────────────────────────────────────────────────────────
        $examTypes = [
            ['code' => 'exam', 'name' => 'Іспит'],
            ['code' => 'credit', 'name' => 'Залік'],
            ['code' => 'diff_credit', 'name' => 'Диференційований залік'],
            ['code' => 'course_work', 'name' => 'Курсова робота'],
        ];

        foreach ($examTypes as $type) {
            DB::table('exam_types')->updateOrInsert(
                ['code' => $type['code']],
                ['name' => $type['name'], 'updated_at' => now()]
            );
        }

        // ─── Delivery Modes ────────────────────────────────────────────────────
        $deliveryModes = [
            ['code' => 'offline', 'name' => 'Офлайн'],
            ['code' => 'online', 'name' => 'Онлайн'],
            ['code' => 'hybrid', 'name' => 'Гібрид'],
        ];

        foreach ($deliveryModes as $mode) {
            DB::table('delivery_modes')->updateOrInsert(
                ['code' => $mode['code']],
                ['name' => $mode['name'], 'updated_at' => now()]
            );
        }

        // ─── Recurrence Rules ──────────────────────────────────────────────────
        $recurrenceRules = [
            ['code' => 'weekly', 'name' => 'Щотижня', 'meta' => json_encode([])],
            ['code' => 'biweekly_odd', 'name' => 'Чисельник (непарні тижні)', 'meta' => json_encode(['parity' => 'odd'])],
            ['code' => 'biweekly_even', 'name' => 'Знаменник (парні тижні)', 'meta' => json_encode(['parity' => 'even'])],
        ];

        foreach ($recurrenceRules as $rule) {
            DB::table('recurrence_rules')->updateOrInsert(
                ['code' => $rule['code']],
                ['name' => $rule['name'], 'meta' => $rule['meta'], 'updated_at' => now()]
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Typically we don't delete master data in down() unless it's strictly
        // temporary, but we could if needed. Since these are core to the system,
        // we leave them or just do nothing.
    }
};
