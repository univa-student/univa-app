import { Outlet } from "react-router-dom";
import { PrivateProviders } from "@/app/providers/providers";

export function PrivateRoot() {
    return (
        <PrivateProviders>
            <Outlet />
        </PrivateProviders>
    );
}