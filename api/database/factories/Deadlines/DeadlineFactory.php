<?php

namespace Database\Factories\Deadlines;

use App\Modules\Deadlines\Models\Deadline;
use App\Modules\Subjects\Models\Subject;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Modules\Deadlines\Models\Deadline>
 */
class DeadlineFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => 1,
            'subject_id' => rand(1, 10),
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'type' => fake()->randomElement([
                Deadline::TYPE_HOMEWORK,
                Deadline::TYPE_LAB,
                Deadline::TYPE_PRACTICE,
                Deadline::TYPE_ESSAY,
                Deadline::TYPE_PRESENTATION,
                Deadline::TYPE_MODULE,
                Deadline::TYPE_COURSEWORK,
                Deadline::TYPE_EXAM,
                Deadline::TYPE_TEST,
                Deadline::TYPE_OTHER
            ]),
            'priority' => fake()->randomElement([
                Deadline::PRIORITY_LOW,
                Deadline::PRIORITY_MEDIUM,
                Deadline::PRIORITY_HIGH,
                Deadline::PRIORITY_CRITICAL
            ]),
            'status' => fake()->randomElement([
                Deadline::STATUS_NEW,
                Deadline::STATUS_IN_PROGRESS,
                Deadline::STATUS_COMPLETED,
            ]),
            'due_at' => fake()->dateTimeBetween('-1 week', '+4 weeks'),
            'completed_at' => fn (array $attributes) => $attributes['status'] === Deadline::STATUS_COMPLETED ? fake()->dateTimeBetween('-1 week', 'now') : null,
        ];
    }
}
