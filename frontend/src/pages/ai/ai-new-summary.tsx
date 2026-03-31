import { AiStudyWorkbench } from "@/modules/ai/ui";
import { AiPanel } from "./ai-panel";

export function AiNewSummaryPage() {
    return (
        <div className="w-full">
            <AiPanel />
            <AiStudyWorkbench />
        </div>
    );
}
