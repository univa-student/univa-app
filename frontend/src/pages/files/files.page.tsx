import usePageTitle from "@/shared/hooks/usePageTitle.ts";
import { FilesBrowser } from "@/widgets/files-browser";

export function FilesPage() {
    usePageTitle("Файли", { suffix: true });
    return <FilesBrowser />;
}