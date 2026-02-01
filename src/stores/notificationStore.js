import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { axiosApiCall } from '@/composables/useAxios'
import { useBrowserNotification } from '@/composables/useBrowserNotification'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const unreadCount = ref(0)

  const totalUnseen = computed(() => {
    return notifications.value.filter(n => !n.isSeen).length
  })

  function formatTimeAgo(timestamp) {
    if (!timestamp) return ''

    const now = new Date()
    const then = new Date(timestamp)
    const diffMs = now - then
    const diffMins = Math.floor(diffMs / 1000 / 60)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} ${diffHours > 1 ? 'hours ago' : 'hour ago'}`

    const diffDays = Math.floor(diffHours / 24)

    return `${diffDays} ${diffDays > 1 ? 'days ago' : 'day ago'}`
  }

  function mapNotification(dto) {
    return {
      id: dto.id,
      title: dto.title,
      subtitle: dto.subtitle,
      time: formatTimeAgo(dto.timestamp),
      isSeen: dto.isSeen,
      icon: dto.icon,
      color: dto.color,
      eventType: dto.eventType,
      metadata: dto.metadata,
    }
  }

  async function fetchAllNotifications(limit = 100) {
    try {
      const { data, error } = await axiosApiCall(`/notifications?limit=${limit}`, { method: 'GET' })

      if (data && !error) {
        return data.map(mapNotification)
      }

      return []
    } catch (error) {
      console.error('Error fetching all notifications:', error)

      return []
    }
  }

  async function fetchNotifications(limit = 20) {
    try {
      const { data, error } = await axiosApiCall(`/notifications?limit=${limit}`, { method: 'GET' })

      if (data && !error) {
        notifications.value = data.map(mapNotification)
        unreadCount.value = notifications.value.filter(n => !n.isSeen).length
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  async function fetchUnreadCount() {
    try {
      const { data, error } = await axiosApiCall('/notifications/unread-count', { method: 'GET' })

      if (data && !error) {
        unreadCount.value = data.count
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  function addRealTimeNotification(dto) {
    const mapped = mapNotification(dto)

    notifications.value.unshift(mapped)
    unreadCount.value++

    const { showNotification } = useBrowserNotification()
    showNotification(dto.title, dto.subtitle, { tag: `arispay-notif-${dto.id}` })
  }

  function setNotifications(dtoList) {
    notifications.value = dtoList.map(mapNotification)
    unreadCount.value = notifications.value.filter(n => !n.isSeen).length
  }

  async function markAsRead(ids) {
    try {
      for (const id of ids) {
        await axiosApiCall(`/notifications/${id}/read`, { method: 'PUT' })

        const notification = notifications.value.find(n => n.id === id)
        if (notification) {
          notification.isSeen = true
        }
      }
      unreadCount.value = notifications.value.filter(n => !n.isSeen).length
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  }

  async function markAsUnread(ids) {
    try {
      for (const id of ids) {
        await axiosApiCall(`/notifications/${id}/unread`, { method: 'PUT' })

        const notification = notifications.value.find(n => n.id === id)
        if (notification) {
          notification.isSeen = false
        }
      }
      unreadCount.value = notifications.value.filter(n => !n.isSeen).length
    } catch (error) {
      console.error('Error marking notifications as unread:', error)
    }
  }

  async function markAllAsRead() {
    try {
      await axiosApiCall('/notifications/read-all', { method: 'PUT' })
      notifications.value.forEach(n => n.isSeen = true)
      unreadCount.value = 0
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  async function removeNotification(id) {
    try {
      await axiosApiCall(`/notifications/${id}`, { method: 'DELETE' })
      notifications.value = notifications.value.filter(n => n.id !== id)
      unreadCount.value = notifications.value.filter(n => !n.isSeen).length
    } catch (error) {
      console.error('Error removing notification:', error)
    }
  }

  return {
    notifications,
    unreadCount,
    totalUnseen,
    fetchNotifications,
    fetchAllNotifications,
    fetchUnreadCount,
    addRealTimeNotification,
    setNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    removeNotification,
  }
})
