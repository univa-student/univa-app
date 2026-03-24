import usePageTitle from "@/shared/hooks/usePageTitle";
import { SubjectsPanel } from "@/modules/subjects/ui/subjects-panel";

export function SubjectsPage() {
    usePageTitle("Предмети", { suffix: true });
    return <SubjectsPanel />;
}