import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useTour } from '@/composables/useTour'

export const useTourStore = defineStore('tour', () => {
  const tour = useTour()
  const isActive = ref(false)

  // Getters
  const hasCompletedTour = computed(() => tour.hasCompleted())

  // Actions
  function startTour() {
    console.log('[tourStore] startTour() called')
    try {
      tour.start()
      console.log('[tourStore] tour.start() completed')
      isActive.value = true
    } catch (error) {
      console.error('[tourStore] Error in startTour:', error)
    }
  }

  function stopTour() {
    tour.stop()
    isActive.value = false
  }

  function resetTour() {
    tour.reset()
  }

  /**
   * Check if tour should auto-start and start it if so
   * Call this on dashboard mount
   */
  function checkAndAutoStart() {
    if (tour.shouldAutoStart()) {
      // Delay to allow UI to fully render
      setTimeout(() => {
        startTour()
      }, 1500)
    }
  }

  return {
    // State
    isActive,

    // Getters
    hasCompletedTour,

    // Actions
    startTour,
    stopTour,
    resetTour,
    checkAndAutoStart,
  }
})
