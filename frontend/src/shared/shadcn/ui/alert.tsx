import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/shadcn/lib/utils"

const alertVariants = cva("grid gap-0.5 rounded-lg border px-2.5 py-2 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4 w-full relative group/alert", {
    variants: {
        variant: {
            default:
                "bg-card text-card-foreground border-border",

            destructive:
                "bg-red-100 text-red-800 border-red-500 " +
                "*:data-[slot=alert-description]:text-red-700 " +
                "*:[svg]:text-current",

            success:
                "bg-green-100 text-green-800 border-green-500 " +
                "*:data-[slot=alert-description]:text-green-700 " +
                "*:[svg]:text-current",

            warning:
                "bg-yellow-100 text-yellow-900 border-yellow-500 " +
                "*:data-[slot=alert-description]:text-yellow-800 " +
                "*:[svg]:text-current",

            info:
                "bg-blue-100 text-blue-800 border-blue-500 " +
                "*:data-[slot=alert-description]:text-blue-700 " +
                "*:[svg]:text-current",
        },
    },
  defaultVariants: {
    variant: "default",
  },
})

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-medium group-has-[>svg]/alert:col-start-2 [&_a]:hover:text-foreground [&_a]:underline [&_a]:underline-offset-3",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground text-sm text-balance md:text-pretty [&_p:not(:last-child)]:mb-4 [&_a]:hover:text-foreground [&_a]:underline [&_a]:underline-offset-3",
        className
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-2 right-2", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
