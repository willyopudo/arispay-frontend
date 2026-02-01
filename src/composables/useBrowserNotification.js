import { ref, computed } from 'vue'

const STORAGE_KEY = 'arispay-browser-notifications'

const permission = ref(typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default')
const isEnabled = ref(localStorage.getItem(STORAGE_KEY) === 'true')
const isSupported = computed(() => typeof window !== 'undefined' && 'Notification' in window)

export function useBrowserNotification() {
  async function requestPermission() {
    if (!isSupported.value) return 'denied'

    const result = await Notification.requestPermission()
    permission.value = result

    return result
  }

  function enable() {
    isEnabled.value = true
    localStorage.setItem(STORAGE_KEY, 'true')
  }

  function disable() {
    isEnabled.value = false
    localStorage.setItem(STORAGE_KEY, 'false')
  }

  function showNotification(title, body, options = {}) {
    if (!isSupported.value) return null
    if (permission.value !== 'granted') return null
    if (!isEnabled.value) return null
    if (document.hasFocus()) return null

    const notification = new Notification(title || 'ArisPay', {
      body: body || '',
      icon: '/favicon.ico',
      tag: options.tag || 'arispay-notification',
      ...options,
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
    }

    setTimeout(() => notification.close(), 10000)

    return notification
  }

  return {
    permission,
    isEnabled,
    isSupported,
    requestPermission,
    enable,
    disable,
    showNotification,
  }
}
