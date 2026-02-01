<script setup>
import { onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notificationStore'
import { useNotificationWebSocket } from '@/composables/useNotificationWebSocket'

const store = useNotificationStore()

console.log('[NavBarNotifications] Component setup - initializing WebSocket and store')

useNotificationWebSocket()

onMounted(() => {
  console.log('[NavBarNotifications] Component mounted - fetching notifications')
  store.fetchNotifications()
})

const handleNotificationClick = notification => {
  if (!notification.isSeen)
    store.markAsRead([notification.id])
}
</script>

<template>
  <Notifications
    :notifications="store.notifications"
    @remove="id => store.removeNotification(id)"
    @read="ids => store.markAsRead(ids)"
    @unread="ids => store.markAsUnread(ids)"
    @click:notification="handleNotificationClick"
  />
</template>
