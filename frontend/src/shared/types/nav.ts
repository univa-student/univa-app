/** Navigation sub-item (leaf route) */
export interface NavSubItem {
    title: string;
    url: string;
}

/** Top-level navigation item */
export interface NavItem {
    title: string;
    url: string;
    icon?: import("lucide-react").LucideIcon;
    isActive?: boolean;
    badge?: string | number;
    items?: NavSubItem[];
}
