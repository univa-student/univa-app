/**
 * shared/ui/tip.tsx — dead-simple tooltip wrapper.
 *
 * Usage:
 *   <Tip label="Delete file">
 *     <Button size="icon"><TrashIcon /></Button>
 *   </Tip>
 *
 * TooltipProvider is already mounted at root (providers.tsx), so you
 * never need to add it yourself. Just import <Tip> and use it.
 */
import React from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/shared/shadcn/ui/tooltip.tsx";
import type { TooltipContentProps } from "@radix-ui/react-tooltip";

interface TipProps {
    /** Tooltip text (or any ReactNode). */
    label: React.ReactNode;
    /** Delay before tooltip appears, ms. Default: 0 (instant). */
    delay?: number;
    /** Side to show tooltip on. Default: "top". */
    side?: TooltipContentProps["side"];
    /** Alignment. Default: "center". */
    align?: TooltipContentProps["align"];
    /** If false, tooltip is disabled entirely. Default: true. */
    enabled?: boolean;
    children: React.ReactElement;
}

export function Tip({
    label,
    delay = 0,
    side = "top",
    align = "center",
    enabled = true,
    children,
}: TipProps) {
    if (!enabled || !label) return children;

    return (
        <Tooltip delayDuration={delay}>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent side={side} align={align} className="max-w-[240px] text-center">
                {label}
            </TooltipContent>
        </Tooltip>
    );
}

// Convenience re-exports for places that need raw parts
export { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/shadcn/ui/tooltip.tsx";
