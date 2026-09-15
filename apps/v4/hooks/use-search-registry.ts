import * as React from "react"
import { debounce, parseAsInteger, useQueryState } from "nuqs"

import { useMounted } from "@/hooks/use-mounted"
import globalRegistries from "@/registry/directory.json"

const PAGE_SIZE = 10

const normalizeQuery = (query: string) =>
  query.toLowerCase().replaceAll(" ", "").replaceAll("@", "")

const SEARCH_INDEX = globalRegistries.map((registry) => ({
  registry,
  name: normalizeQuery(registry.name),
  description: normalizeQuery(registry.description),
}))

const searchDirectory = (query: string | null) => {
  if (!query) return globalRegistries

  const normalizedQuery = normalizeQuery(query)

  return SEARCH_INDEX.filter(
    ({ name, description }) =>
      name.includes(normalizedQuery) || description.includes(normalizedQuery)
  ).map(({ registry }) => registry)
}

export function useSearchRegistry() {
  const mounted = useMounted()
  const [query, setQuery] = useQueryState("q", {
    defaultValue: "",
    limitUrlUpdates: debounce(250),
  })

  const [page, setPage] = useQueryState("page", {
    ...parseAsInteger,
    defaultValue: 1,
    history: "push",
  })

  const currentQuery = mounted ? query : ""
  const currentPageValue = mounted ? page : 1

  const registries = React.useMemo(
    () => searchDirectory(currentQuery),
    [currentQuery]
  )
  const totalPages = Math.ceil(registries.length / PAGE_SIZE)

  // Clamp page to valid range.
  const currentPage = Math.max(1, Math.min(currentPageValue, totalPages))

  const paginatedRegistries = React.useMemo(
    () =>
      registries.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [registries, currentPage]
  )

  const updateQuery = React.useCallback(
    (value: string | null) => {
      setQuery(value)
      setPage(null)
    },
    [setQuery, setPage]
  )

  return {
    isLoading: !mounted,
    query: currentQuery,
    setQuery: updateQuery,
    registries,
    paginatedRegistries,
    page: currentPage,
    totalPages,
    setPage,
  }
}
