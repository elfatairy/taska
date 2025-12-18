"use client"

import { createContext, useContext, useState } from "react"

const CopyToClipboarContext = createContext<{
  isCopied: boolean
  setIsCopied: (isCopied: boolean) => void
}>({
  isCopied: false,
  setIsCopied: () => { }
})

export const CopyToClipboard = ({ children, className, textToCopy }: { children: React.ReactNode, className?: string, textToCopy: string }) => {
  const [isCopied, setIsCopied] = useState(false)
  return (
    <CopyToClipboarContext.Provider value={{ isCopied, setIsCopied }}>
      <button
        className={className}
        onClick={(e) => {
          e.preventDefault()
          navigator.clipboard.writeText(textToCopy)
          setIsCopied(true)
          setTimeout(() => setIsCopied(false), 2000)
        }}>
        {children}
      </button>
    </CopyToClipboarContext.Provider>
  )
}

export const useCopy = () => {
  const context = useContext(CopyToClipboarContext)
  if (!context) {
    throw new Error("useCopy must be used within a CopyToClipboardContext")
  }
  return context
}

export const CopyCopied = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const { isCopied } = useCopy()
  if (!isCopied) {
    return null
  }
  return (
    <div className={className}>
      {children}
    </div>
  )
}

export const CopyUncopied = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const { isCopied } = useCopy()
  if (isCopied) {
    return null
  }
  return (
    <div className={className}>
      {children}
    </div>
  )
}