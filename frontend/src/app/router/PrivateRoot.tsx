import { Outlet } from "react-router-dom";
import { PrivateProviders } from "@/app/providers/providers";
import { AppFrame } from "@/shared/ui/layouts/app/app-frame";

export function PrivateRoot() {
    return (
        <PrivateProviders>
            <AppFrame>
                <Outlet />
            </AppFrame>
        </PrivateProviders>
    );
}