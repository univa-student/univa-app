import usePageTitle from "@/shared/hooks/usePageTitle";
import { OrganizerHub } from "@/modules/organizer/ui/organizer-hub";

export function OrganizerPage() {
    usePageTitle("Органайзер | Univa", { suffix: true });

    return <OrganizerHub />;
}
