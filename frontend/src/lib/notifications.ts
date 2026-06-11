export interface SystemNotification {
  id: string
  type: 'info' | 'warning' | 'success'
  title: string
  description: string
  timestamp: string
  read: boolean
}

const STORAGE_KEY = 'netshield_notifications'

// Initial dummy alerts if storage is empty, to make it feel alive immediately
const DUMMY_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'dummy-1',
    type: 'warning',
    title: 'High Traffic Warning',
    description: 'Elevated latency detected on primary upstream resolver.',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 'dummy-2',
    type: 'success',
    title: 'Sync Complete',
    description: 'All system blocklists and steering rules compiled successfully.',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    read: false,
  }
]

export function getNotifications(): SystemNotification[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DUMMY_NOTIFICATIONS))
    return DUMMY_NOTIFICATIONS
  }
  try {
    return JSON.parse(stored) as SystemNotification[]
  } catch {
    return []
  }
}

export function addNotification(
  type: 'info' | 'warning' | 'success',
  title: string,
  description: string
) {
  const current = getNotifications()
  const newNotif: SystemNotification = {
    id: Math.random().toString(36).substring(2, 9),
    type,
    title,
    description,
    timestamp: new Date().toISOString(),
    read: false,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify([newNotif, ...current]))
  window.dispatchEvent(new Event('netshield_notifications_update'))
}

export function markAllAsRead() {
  const current = getNotifications()
  const updated = current.map(n => ({ ...n, read: true }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  window.dispatchEvent(new Event('netshield_notifications_update'))
}

export function markAsRead(id: string) {
  const current = getNotifications()
  const updated = current.map(n => (n.id === id ? { ...n, read: true } : n))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  window.dispatchEvent(new Event('netshield_notifications_update'))
}

export function deleteNotification(id: string) {
  const current = getNotifications()
  const updated = current.filter(n => n.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  window.dispatchEvent(new Event('netshield_notifications_update'))
}

export function clearAllNotifications() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
  window.dispatchEvent(new Event('netshield_notifications_update'))
}
