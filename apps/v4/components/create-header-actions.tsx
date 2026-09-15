"use client"

import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"

const V0Button = dynamic(() =>
  import("@/app/(app)/create/components/v0-button").then((mod) => mod.V0Button)
)

const ProjectForm = dynamic(() =>
  import("@/app/(app)/create/components/project-form").then(
    (mod) => mod.ProjectForm
  )
)

export function CreateHeaderActions({
  variant,
}: {
  variant: "desktop" | "mobile"
}) {
  const pathname = usePathname()

  if (!pathname.startsWith("/create")) {
    return null
  }

  if (variant === "mobile") {
    return <V0Button />
  }

  return (
    <>
      <V0Button />
      <ProjectForm />
    </>
  )
}
