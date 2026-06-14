import { useEffect } from "react"

const BASE = "Evalio"

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${BASE} — ${title}` : BASE
  }, [title])
}
