import React, { createContext, useContext, useState, useCallback, useMemo } from "react"

interface RefreshContextType {
  refreshKey: number
  triggerRefresh: () => void
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined)

export const RefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0)

  const triggerRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1)
  }, [])

  const value = useMemo(() => ({ refreshKey, triggerRefresh }), [refreshKey, triggerRefresh])

  return (
    <RefreshContext.Provider value={value}>
      {children}
    </RefreshContext.Provider>
  )
}

export const useRefresh = () => {
  const context = useContext(RefreshContext)
  if (!context) throw new Error("useRefresh must be used within a RefreshProvider")
  return context
}
