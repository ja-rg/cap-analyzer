// context/LoadingContext.tsx
import { createContext, useContext, useState } from "react"

type LoadingContextType = {
  loading: boolean
  setLoading: (value: boolean) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) throw new Error("useLoading must be used inside LoadingProvider")
  return context
}

export const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(false)
  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  )
}
