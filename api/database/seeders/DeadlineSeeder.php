<?php

namespace Database\Seeders;

use App\Modules\Deadlines\Models\Deadline;
use Illuminate\Database\Seeder;

class DeadlineSeeder extends Seeder
{
    public function run(): void
    {
       Deadline::factory()->count(20)->create();
    }
}
