"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { type ColorPalette } from "@/lib/colors"
import { cn } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "@/registry/new-york-v4/ui/scroll-area"

export function ColorsNav({
  className,
  colors,
  ...props
}: React.ComponentProps<"div"> & { colors: ColorPalette[] }) {
  const pathname = usePathname()

  return (
    <div className={cn("flex items-center", className)} {...props}>
      <ScrollArea className="max-w-full">
        <div className="flex items-center">
          {colors.map((colorPalette, index) => (
            <Link
              href={`/colors#${colorPalette.name}`}
              key={colorPalette.name}
              data-active={
                pathname?.startsWith(colorPalette.name) ||
                (index === 0 && pathname === "/colors")
              }
              className={cn(
                "flex h-7 items-center justify-center px-4 text-center text-base font-medium text-muted-foreground capitalize transition-colors hover:text-primary data-[active=true]:text-primary"
              )}
            >
              {colorPalette.name}
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  )
}
