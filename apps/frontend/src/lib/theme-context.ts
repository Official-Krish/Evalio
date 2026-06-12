import { createContext } from "react"

type Theme = "dark" | "light"

export const ThemeContext = createContext<{
  theme: Theme
  toggle: () => void
}>({ theme: "dark", toggle: () => {} })
