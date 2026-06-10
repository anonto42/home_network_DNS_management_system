import { useEffect, useRef } from 'react'

export function usePolling(callback: () => void, intervalMs: number, deps: unknown[] = []) {
  const saved = useRef(callback)

  useEffect(() => {
    saved.current = callback
  }, [callback])

  useEffect(() => {
    saved.current()
    const id = setInterval(() => saved.current(), intervalMs)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, ...deps])
}
