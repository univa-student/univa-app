<?php

declare(strict_types=1);

namespace App\Modules\Ai\Http\Requests;

use App\Core\Request\UnivaRequest;
use App\Core\Response\ResponseState;
use App\Core\UnivaHttpException;
use App\Modules\Ai\Enums\AiArtifactType;
use App\Modules\Ai\Models\AiArtifact;
use Illuminate\Validation\Rule;

class DeleteFileSummaryRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $artifact = $this->resolveArtifact();

        if ($user === null || ! $artifact instanceof AiArtifact) {
            return false;
        }

        return (int) $artifact->getAttribute('user_id') === (int) $user->getAuthIdentifier()
            && $this->isSummaryArtifact($artifact);
    }

    protected function prepareForValidation(): void
    {
        $artifactId = $this->resolveArtifactId();

        if ($artifactId !== null) {
            $this->merge([
                'artifact_id' => $artifactId,
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'artifact_id' => [
                'required',
                'integer',
                Rule::exists('ai_artifacts', 'id'),
            ],
        ];
    }

    public function artifact(): AiArtifact
    {
        $artifact = $this->resolveArtifact();

        if (! $artifact instanceof AiArtifact) {
            throw new UnivaHttpException('Конспект не знайдено.', ResponseState::NotFound);
        }

        return $artifact;
    }

    private function resolveArtifact(): ?AiArtifact
    {
        $routeArtifact = $this->route('artifact');

        if ($routeArtifact instanceof AiArtifact) {
            return $routeArtifact;
        }

        $artifactId = $this->resolveArtifactId();

        if ($artifactId === null) {
            return null;
        }

        return AiArtifact::query()->find($artifactId);
    }

    private function resolveArtifactId(): ?int
    {
        $routeArtifact = $this->route('artifact');

        if ($routeArtifact instanceof AiArtifact) {
            return (int) $routeArtifact->getKey();
        }

        if (is_numeric($routeArtifact)) {
            return (int) $routeArtifact;
        }

        return null;
    }

    private function isSummaryArtifact(AiArtifact $artifact): bool
    {
        $type = $artifact->getAttribute('type');

        if ($type instanceof AiArtifactType) {
            return $type === AiArtifactType::SUMMARY;
        }

        return (string) $type === AiArtifactType::SUMMARY->value;
    }
}
