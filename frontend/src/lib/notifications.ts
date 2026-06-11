import { apiGet, apiPut, apiDelete } from '../hooks/api'

export interface SystemNotification {
  id: number
  type: 'info' | 'warning' | 'success' | 'error'
  title: string
  message: string
  created_at: string
  read: boolean
}

export async function fetchNotifications(): Promise<SystemNotification[]> {
  try {
    const list = await apiGet<SystemNotification[]>('/notifications')
    return list || []
  } catch (err) {
    console.error('Failed to fetch notifications:', err)
    return []
  }
}

export function dispatchNotificationsUpdate() {
  window.dispatchEvent(new Event('netshield_notifications_update'))
}

export async function markAllAsRead(): Promise<void> {
  try {
    await apiPut('/notifications/read', { all: true })
    dispatchNotificationsUpdate()
  } catch (err) {
    console.error('Failed to mark all as read:', err)
  }
}

export async function markAsRead(id: number): Promise<void> {
  try {
    await apiPut('/notifications/read', { id, all: false })
    dispatchNotificationsUpdate()
  } catch (err) {
    console.error('Failed to mark as read:', err)
  }
}

export async function deleteNotification(id: number): Promise<void> {
  try {
    await apiDelete('/notifications', { id, all: false })
    dispatchNotificationsUpdate()
  } catch (err) {
    console.error('Failed to delete notification:', err)
  }
}

export async function clearAllNotifications(): Promise<void> {
  try {
    await apiDelete('/notifications', { all: true })
    dispatchNotificationsUpdate()
  } catch (err) {
    console.error('Failed to clear notifications:', err)
  }
}
