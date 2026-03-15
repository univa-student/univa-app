import { Link } from "react-router-dom";
import type { ReactNode } from "react";

import { themedLogo } from "@/app/config/logo.config";
import { OrbitHero } from "@/shared/ui/animations/orbit-hero.animations";

type AuthPageShellProps = {
    children: ReactNode;
};

export function AuthPageShell({ children }: AuthPageShellProps) {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center">
                    <Link to="/" className="flex items-center font-medium">
                        <div className="flex h-16 w-full items-center">
                            <img src={themedLogo("full-no-bg")} alt="Univa" className="w-48" />
                        </div>
                    </Link>
                </div>

                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-md">
                        {children}
                    </div>
                </div>
            </div>

            <div className="bg-muted relative hidden h-svh lg:block">
                <div className="sticky top-0 flex h-svh items-center justify-center pointer-events-none">
                    <OrbitHero />
                </div>
            </div>
        </div>
    );
}
