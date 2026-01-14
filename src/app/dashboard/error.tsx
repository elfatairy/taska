'use client'

import { useEffect } from 'react'
import { Button } from '@/common/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/common/components/ui/empty'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

const defaultReset = () => {
  window.location.reload();
};

export default function Error({ error, reset = defaultReset }: ErrorProps) {
  useEffect(() => {
    console.error('Dashboard Error:', error)
  }, [error])

  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <Empty className="min-h-[400px]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-6 text-destructive"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </EmptyMedia>
        <EmptyTitle>Something went wrong!</EmptyTitle>
        <EmptyDescription>
          An unexpected error occurred. Please try again or contact support if the problem persists.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-col gap-3 w-full">
          <Button onClick={reset} variant="default" size="sm">
            Try again
          </Button>
          {isDevelopment && (
            <details className="mt-4 text-left w-full max-w-md">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                Error details (development only)
              </summary>
              <div className="mt-2 p-3 bg-muted rounded-md text-xs font-mono overflow-auto">
                <div className="mb-2">
                  <strong>Message:</strong> {error.message}
                </div>
                {error.digest && (
                  <div className="mb-2">
                    <strong>Digest:</strong> {error.digest}
                  </div>
                )}
                {error.stack && (
                  <div>
                    <strong>Stack:</strong>
                    <pre className="mt-1 whitespace-pre-wrap wrap-break-word">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      </EmptyContent>
    </Empty>
  )
}

