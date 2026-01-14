import { ref, onMounted, onUnmounted } from 'vue'
import SockJS from 'sockjs-client'
import { Stomp } from '@stomp/stompjs'

export function useActivityWebSocket() {
  const activities = ref([])
  const isConnected = ref(false)
  const stompClient = ref(null)

  const connect = () => {
    // Get access token from cookie
    const accessToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('accessToken='))
      ?.split('=')[1]

    if (!accessToken) {
      console.warn('No access token found, skipping WebSocket connection')
      return
    }

    // Decode JWT to get companyId
    let companyId
    try {
      const tokenParts = accessToken.split('.')
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]))
        companyId = payload.companyId
        console.log('Extracted companyId from token:', companyId)
      }
    } catch (error) {
      console.error('Error decoding JWT token:', error)
      return
    }

    if (!companyId) {
      console.warn('No companyId found in token, skipping WebSocket connection')
      return
    }

    try {
      // Use factory function for better auto-reconnect support
      stompClient.value = Stomp.over(() => new SockJS('http://localhost:8082/ws'))

      // Disable console debug logs
      stompClient.value.debug = () => {}

      stompClient.value.connect(
        { Authorization: `Bearer ${accessToken}` },
        frame => {
          isConnected.value = true
          console.log('WebSocket connected successfully')

          // Subscribe to user-specific history queue
          stompClient.value.subscribe('/user/queue/activity-history', message => {
            try {
              const history = JSON.parse(message.body)
              activities.value = Array.isArray(history) ? history : []
              console.log(`Loaded ${activities.value.length} historical activities`)
            } catch (error) {
              console.error('Error parsing activity history:', error)
            }
          })

          // Subscribe to company-specific activity topic with companyId
          const activityTopic = `/topic/activity/${companyId}`
          console.log('Subscribing to activity topic:', activityTopic)

          stompClient.value.subscribe(activityTopic, message => {
            try {
              const activity = JSON.parse(message.body)
              activities.value.unshift(activity) // Add to beginning

              // Keep only last 4 activities for dashboard display
              if (activities.value.length > 4) {
                activities.value.pop()
              }

              console.log('New activity received:', activity.title)
            } catch (error) {
              console.error('Error parsing activity:', error)
            }
          })

          // Send subscription request to get historical activities
          stompClient.value.send('/app/activity-subscribe', {}, {})
        },
        error => {
          console.error('WebSocket connection error:', error)

          // Log detailed error information
          if (error.headers) {
            console.error('Error headers:', error.headers)
          }
          if (error.body) {
            console.error('Error body:', error.body)
          }
          if (error.command) {
            console.error('Error command:', error.command)
          }

          isConnected.value = false

          // Retry connection after 5 seconds
          setTimeout(() => {
            console.log('Retrying WebSocket connection...')
            connect()
          }, 5000)
        },
      )
    } catch (error) {
      console.error('Error initializing WebSocket:', error)
      isConnected.value = false
    }
  }

  const disconnect = () => {
    if (stompClient.value && stompClient.value.connected) {
      stompClient.value.disconnect(() => {
        console.log('WebSocket disconnected')
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
    activities,
    isConnected,
    connect,
    disconnect,
  }
}
