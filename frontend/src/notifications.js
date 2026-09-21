const STORAGE_KEY = 'pharmashop_notifications'

export function getNotifications() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function addNotification({ title, message, roles = ['admin', 'pharmacist'], type = 'info' }) {
  const notifications = getNotifications()
  const notification = {
    id: Date.now() + Math.random(),
    title,
    message,
    roles,
    type,
    read: false,
    time: new Date().toLocaleString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify([notification, ...notifications]))
  window.dispatchEvent(new Event('notifications-updated'))
  return notification
}

export function markAsRead(id) {
  const notifications = getNotifications()
  const updated = notifications.map((n) => n.id === id ? { ...n, read: true } : n)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  window.dispatchEvent(new Event('notifications-updated'))
}

export function markAllRead() {
  const notifications = getNotifications()
  const updated = notifications.map((n) => ({ ...n, read: true }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  window.dispatchEvent(new Event('notifications-updated'))
}

export function removeNotification(id) {
  const notifications = getNotifications()
  const updated = notifications.filter((n) => n.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  window.dispatchEvent(new Event('notifications-updated'))
}

export function getUnreadCount(role) {
  return getNotifications().filter((n) => !n.read && n.roles.includes(role)).length
}
