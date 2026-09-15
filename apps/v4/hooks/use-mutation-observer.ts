import * as React from "react"

const DEFAULT_OPTIONS: MutationObserverInit = {
  attributes: true,
  attributeFilter: ["aria-selected"],
}

export const useMutationObserver = (
  ref: React.RefObject<HTMLElement | null>,
  callback: MutationCallback,
  options: MutationObserverInit = DEFAULT_OPTIONS
) => {
  React.useEffect(() => {
    const element = ref.current
    if (!element) {
      return
    }

    const observer = new MutationObserver(callback)
    observer.observe(element, options)
    return () => observer.disconnect()
  }, [ref, callback, options])
}
