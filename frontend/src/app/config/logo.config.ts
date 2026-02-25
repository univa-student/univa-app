import fullLogoBlack from "@/assets/univa-full-logo-white.svg";
import fullLogoBlackNoBg from "@/assets/univa-full-logo-white-no-bg.svg";
import fullLogoWhite from "@/assets/univa-full-logo-black.svg";
import fullLogoWhiteNoBg from "@/assets/univa-full-logo-black-no-bg.svg";

import logoBlack from "@/assets/univa-logo-white.svg";
import logoBlackCircle from "@/assets/univa-logo-white-circle.svg";
import logoBlackNoBg from "@/assets/univa-logo-white-no-bg.svg";
import logoWhite from "@/assets/univa-logo-black.svg";
import logoWhiteCircle from "@/assets/univa-logo-black-circle.svg";
import logoWhiteNoBg from "@/assets/univa-logo-black-no-bg.svg";

/* ═══════════════════════════════════════════════════════════════
   EXPLICIT LOGO MAP (kept for backward compat)
   ═══════════════════════════════════════════════════════════ */
const logoConfig = {
    "full-logo-black": fullLogoBlack,
    "full-logo-black-no-bg": fullLogoBlackNoBg,
    "full-logo-white": fullLogoWhite,
    "full-logo-white-no-bg": fullLogoWhiteNoBg,

    "logo-black": logoBlack,
    "logo-black-circle": logoBlackCircle,
    "logo-black-no-bg": logoBlackNoBg,
    "logo-white": logoWhite,
    "logo-white-circle": logoWhiteCircle,
    "logo-white-no-bg": logoWhiteNoBg,
} as const;

export default logoConfig;

/* ═══════════════════════════════════════════════════════════════
   THEME-AWARE ALIASES
   Usage:  import { themedLogo } from "@/app/config/logo.config"
           <img src={themedLogo("full-no-bg")} />

   These resolve to the correct black/white variant
   based on the current theme (Tailwind `dark` class on <html>).
   ═══════════════════════════════════════════════════════════ */

type ThemeVariants = {
    light: string;
    dark: string;
};

/** All theme-aware logo keys */
const themeMap = {
    "full": { light: fullLogoBlack, dark: fullLogoWhite },
    "full-no-bg": { light: fullLogoBlackNoBg, dark: fullLogoWhiteNoBg },
    "logo": { light: logoBlack, dark: logoWhite },
    "logo-circle": { light: logoBlackCircle, dark: logoWhiteCircle },
    "logo-no-bg": { light: logoBlackNoBg, dark: logoWhiteNoBg },
} as const satisfies Record<string, ThemeVariants>;

export type ThemedLogoKey = keyof typeof themeMap;

/** Returns true when the document has the `dark` class */
function isDarkMode(): boolean {
    if (typeof document === "undefined") return false;
    return document.documentElement.classList.contains("dark");
}

/**
 * Get the correct logo path for the current theme.
 * Call this inside a render to get the right variant.
 *
 * @example
 * <img src={themedLogo("full-no-bg")} alt="Univa" />
 */
export function themedLogo(key: ThemedLogoKey): string {
    const pair = themeMap[key];
    return isDarkMode() ? pair.dark : pair.light;
}

/**
 * Get both variants for CSS-based switching (dark:hidden pattern).
 *
 * @example
 * const { light, dark } = themedLogoPair("logo-no-bg")
 * <img src={light} className="dark:hidden" />
 * <img src={dark}  className="hidden dark:block" />
 */
export function themedLogoPair(key: ThemedLogoKey): ThemeVariants {
    return themeMap[key];
}