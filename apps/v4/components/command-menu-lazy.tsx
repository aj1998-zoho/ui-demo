"use client"

import * as React from "react"

import { type source } from "@/lib/source"
import { Button } from "@/registry/new-york-v4/ui/button"

const SEARCH_BUTTON_CLASSNAME =
  "relative h-8 w-full justify-start rounded-lg border-none bg-muted pl-3 text-foreground shadow-none transition-colors hover:bg-muted/50 md:w-48 lg:w-40 xl:w-64 dark:bg-card"

function SearchButtonPlaceholder({ onClick }: { onClick?: () => void }) {
  return (
    <Button
      variant="outline"
      className={SEARCH_BUTTON_CLASSNAME}
      onClick={onClick}
    >
      <span className="hidden xl:inline-flex">Search documentation...</span>
      <span className="inline-flex xl:hidden">Search...</span>
    </Button>
  )
}

function isEditableTarget(target: EventTarget | null) {
  return (
    (target instanceof HTMLElement && target.isContentEditable) ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  )
}

function onIdle(callback: () => void) {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(callback)
    return () => window.cancelIdleCallback(id)
  }

  const id = window.setTimeout(callback, 1)
  return () => window.clearTimeout(id)
}

type CommandMenuLazyProps = {
  tree: typeof source.pageTree
  navItems?: { href: string; label: string }[]
  defaultOpen?: boolean
}

export function CommandMenuLazy(props: CommandMenuLazyProps) {
  const [Menu, setMenu] =
    React.useState<React.ComponentType<CommandMenuLazyProps> | null>(null)
  const [openOnMount, setOpenOnMount] = React.useState(false)
  const loadedRef = React.useRef(false)
  const loadRef = React.useRef<(shouldOpen?: boolean) => void>(() => {})

  React.useEffect(() => {
    let cancelled = false

    const load = (shouldOpen = false) => {
      if (shouldOpen) {
        setOpenOnMount(true)
      }

      if (loadedRef.current) {
        return
      }

      loadedRef.current = true
      void import("@/components/command-menu").then((mod) => {
        if (!cancelled) {
          setMenu(() => mod.CommandMenu)
        }
      })
    }

    loadRef.current = load

    const onKeyDown = (event: KeyboardEvent) => {
      if (loadedRef.current) {
        return
      }

      if (
        ((event.key === "k" && (event.metaKey || event.ctrlKey)) ||
          event.key === "/") &&
        !isEditableTarget(event.target)
      ) {
        event.preventDefault()
        load(true)
      }
    }

    document.addEventListener("keydown", onKeyDown)
    const cancelIdle = onIdle(() => load(false))

    return () => {
      cancelled = true
      document.removeEventListener("keydown", onKeyDown)
      cancelIdle()
    }
  }, [])

  if (!Menu) {
    return <SearchButtonPlaceholder onClick={() => loadRef.current(true)} />
  }

  return <Menu {...props} defaultOpen={openOnMount} />
}
