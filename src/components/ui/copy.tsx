"use client"

import { createContext, useContext, useState } from "react"

const CopyToClipboarContext = createContext<{
  isCopied: boolean
  setIsCopied: (isCopied: boolean) => void
}>({
  isCopied: false,
  setIsCopied: () => { }
})

export const CopyToClipboard = ({ children }: { children: React.ReactNode }) => {
  const [isCopied, setIsCopied] = useState(false)
  return (
    <CopyToClipboarContext.Provider value={{ isCopied, setIsCopied }}>
      {children}
    </CopyToClipboarContext.Provider>
  )
}

const useCopy = () => {
  const context = useContext(CopyToClipboarContext)
  if (!context) {
    throw new Error("useCopy must be used within a CopyToClipboardContext")
  }
  return context
}

export const CopyTrigger = ({ children, textToCopy, className }: { children: React.ReactNode, textToCopy: string, className?: string }) => {
  const { isCopied, setIsCopied } = useContext(CopyToClipboarContext)

  if (isCopied) {
    return null
  }

  return (
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
  )
}

export const CopyCopied = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const { isCopied } = useContext(CopyToClipboarContext)
  if (!isCopied) {
    return null
  }
  return (
    <div className={className}>
      {children}
    </div>
  )
}