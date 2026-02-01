import Shepherd from 'shepherd.js'
import { getTourSteps } from './tourSteps'

const TOUR_STORAGE_KEY = 'arispay-tour-completed'
const TOUR_VERSION = '1.0.0'

let tourInstance = null

/**
 * Check if dark mode is currently active
 */
function isDarkMode() {
  return document.body.classList.contains('v-theme--dark')
}

/**
 * Get the appropriate theme class based on current mode
 */
function getThemeClasses() {
  const baseClass = 'shepherd-theme-custom'
  return isDarkMode() ? `${baseClass} shepherd-theme-dark` : baseClass
}

/**
 * Creates and manages the Shepherd.js tour instance
 * Singleton pattern ensures only one tour exists
 */
export function useTour() {
  /**
   * Initialize or get the existing tour instance
   */
  function getTour() {
    // Destroy existing instance to get fresh theme classes
    if (tourInstance) {
      // Remove event listeners before destroying to prevent marking as completed
      tourInstance.off('complete')
      tourInstance.off('cancel')

      // Only cancel if active
      if (tourInstance.isActive()) {
        tourInstance.cancel()
      }
      tourInstance = null
    }

    const themeClasses = getThemeClasses()

    tourInstance = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: {
          enabled: true,
        },
        classes: themeClasses,
        scrollTo: { behavior: 'smooth', block: 'center' },
      },
    })

    // Add all tour steps (resolved with current locale)
    getTourSteps().forEach(step => {
      tourInstance.addStep({
        ...step,
        classes: themeClasses,
      })
    })

    // Handle tour completion
    tourInstance.on('complete', () => {
      markTourCompleted()
    })

    // Handle tour cancellation (only when user cancels, not programmatic)
    tourInstance.on('cancel', () => {
      markTourCompleted()
    })

    return tourInstance
  }

  /**
   * Start the tour
   */
  function start() {
    const tour = getTour()

    // If tour is already active, don't restart
    if (tour.isActive()) {
      return
    }

    tour.start()
  }

  /**
   * Stop/cancel the tour
   */
  function stop() {
    if (tourInstance && tourInstance.isActive()) {
      tourInstance.cancel()
    }
  }

  /**
   * Check if tour should auto-start (first time user)
   */
  function shouldAutoStart() {
    const stored = localStorage.getItem(TOUR_STORAGE_KEY)

    if (!stored) {
      return true
    }

    try {
      const data = JSON.parse(stored)

      // If version changed, show tour again
      if (data.version !== TOUR_VERSION) {
        return true
      }

      return !data.completed
    } catch {
      return true
    }
  }

  /**
   * Mark the tour as completed in localStorage
   */
  function markTourCompleted() {
    const data = {
      completed: true,
      version: TOUR_VERSION,
      completedAt: new Date().toISOString(),
    }
    localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(data))
  }

  /**
   * Reset tour state (allows tour to auto-start again)
   */
  function reset() {
    localStorage.removeItem(TOUR_STORAGE_KEY)

    // Destroy existing tour instance so it can be recreated
    if (tourInstance) {
      // Remove event listeners before destroying
      tourInstance.off('complete')
      tourInstance.off('cancel')

      if (tourInstance.isActive()) {
        tourInstance.cancel()
      }
      tourInstance = null
    }
  }

  /**
   * Check if tour has been completed
   */
  function hasCompleted() {
    const stored = localStorage.getItem(TOUR_STORAGE_KEY)

    if (!stored) {
      return false
    }

    try {
      const data = JSON.parse(stored)
      return data.completed && data.version === TOUR_VERSION
    } catch {
      return false
    }
  }

  /**
   * Check if tour is currently active
   */
  function isActive() {
    return tourInstance?.isActive() || false
  }

  return {
    start,
    stop,
    shouldAutoStart,
    reset,
    hasCompleted,
    isActive,
    getTour,
  }
}
