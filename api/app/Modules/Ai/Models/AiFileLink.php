<?php

declare(strict_types=1);

namespace App\Modules\Ai\Models;

use App\Models\Files\File;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiFileLink extends Model
{
    protected $table = 'ai_file_links';

    protected $fillable = [
        'file_id',
        'provider',
        'provider_file_id',
        'provider_store_id',
        'provider_store_document_id',
        'status',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
    ];

    public function file(): BelongsTo
    {
        return $this->belongsTo(File::class, 'file_id');
    }

    public function isReady(): bool
    {
        return $this->status === 'stored';
    }

    public function hasProviderFile(): bool
    {
        return !empty($this->provider_file_id);
    }

    public function hasStoreDocument(): bool
    {
        return !empty($this->provider_store_document_id);
    }
}
