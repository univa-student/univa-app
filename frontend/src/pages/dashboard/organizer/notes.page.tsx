import usePageTitle from "@/shared/hooks/usePageTitle";
import { NotesWorkspace } from "@/modules/organizer/ui/notes-workspace";

export function OrganizerNotesPage() {
    usePageTitle("Нотатки | Univa", { suffix: true });

    return <NotesWorkspace />;
}
