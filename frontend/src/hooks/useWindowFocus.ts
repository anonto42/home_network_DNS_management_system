import { useEffect } from 'react'

export function useWindowFocus(callback: () => void) {
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible') callback()
    }
    document.addEventListener('visibilitychange', handler)
    window.addEventListener('focus', callback)
    return () => {
      document.removeEventListener('visibilitychange', handler)
      window.removeEventListener('focus', callback)
    }
  }, [callback])
}
