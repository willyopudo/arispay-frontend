import { ref, onMounted, onUnmounted } from 'vue'
import SockJS from 'sockjs-client'
import { Stomp } from '@stomp/stompjs'
import { useNotificationStore } from '@/stores/notificationStore'

export function useNotificationWebSocket() {
  const isConnected = ref(false)
  const stompClient = ref(null)

  const connect = () => {
    const accessToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('accessToken='))
      ?.split('=')[1]

    if (!accessToken) {
      console.warn('No access token found, skipping notification WebSocket connection')

      return
    }

    let companyId
    try {
      const tokenParts = accessToken.split('.')
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]))

        companyId = payload.companyId
      }
    } catch (error) {
      console.error('Error decoding JWT token:', error)

      return
    }

    if (!companyId) {
      console.warn('No companyId found in token, skipping notification WebSocket connection')

      return
    }

    const store = useNotificationStore()

    try {
      stompClient.value = Stomp.over(() => new SockJS('http://localhost:8082/ws'))
      stompClient.value.debug = () => {}

      stompClient.value.connect(
        { Authorization: `Bearer ${accessToken}` },
        frame => {
          isConnected.value = true
          console.log('Notification WebSocket connected')

          // Subscribe to notification history (initial load)
          stompClient.value.subscribe('/user/queue/notification-history', message => {
            try {
              const history = JSON.parse(message.body)
              if (Array.isArray(history)) {
                store.setNotifications(history)
              }
            } catch (error) {
              console.error('Error parsing notification history:', error)
            }
          })

          // Subscribe to real-time notifications for this company
          const notificationTopic = `/topic/notifications/${companyId}`

          stompClient.value.subscribe(notificationTopic, message => {
            try {
              const notification = JSON.parse(message.body)

              store.addRealTimeNotification(notification)
              console.log('New notification received:', notification.title)
            } catch (error) {
              console.error('Error parsing notification:', error)
            }
          })

          // Request historical notifications
          stompClient.value.send('/app/notification-subscribe', {}, {})
        },
        error => {
          console.error('Notification WebSocket connection error:', error)
          isConnected.value = false

          setTimeout(() => {
            console.log('Retrying notification WebSocket connection...')
            connect()
          }, 5000)
        },
      )
    } catch (error) {
      console.error('Error initializing notification WebSocket:', error)
      isConnected.value = false
    }
  }

  const disconnect = () => {
    if (stompClient.value && stompClient.value.connected) {
      stompClient.value.disconnect(() => {
        console.log('Notification WebSocket disconnected')
        isConnected.value = false
      })
    }
  }

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    disconnect()
  })

  return {
    isConnected,
    connect,
    disconnect,
  }
}
