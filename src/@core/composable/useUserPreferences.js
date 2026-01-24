import { useTheme } from 'vuetify'
import { useConfigStore } from '@core/stores/config'
import { cookieRef, namespaceConfig } from '@layouts/stores/config'
import { useStorage } from '@vueuse/core'

/**
 * Composable to handle loading and applying user theme preferences from the login response
 * Reads theme customizations from userPreferences.themeCustomizations JSON string
 */
export const useUserPreferences = () => {
  const vuetifyTheme = useTheme()
  const configStore = useConfigStore()

  /**
   * Parse and validate theme customizations object
   * @param {string|object} themeCustomizations - Theme customizations (string or object)
   * @returns {object|null} Parsed theme customizations or null if invalid
   */
  const parseThemeCustomizations = (themeCustomizations) => {
    try {
      if (!themeCustomizations)
        return null

      // Handle both string and object formats for backward compatibility
      const parsed = typeof themeCustomizations === 'string'
        ? JSON.parse(themeCustomizations)
        : themeCustomizations

      return parsed
    } catch (error) {
      console.warn('Failed to parse theme customizations:', error)
      return null
    }
  }

  /**
   * Apply theme customizations to the app
   * @param {object} themeCustomizations - Theme customizations object
   */
  const applyThemeCustomizations = (themeCustomizations) => {
    if (!themeCustomizations)
      return

    const {
      primaryColor,
      fontSize,
      theme,
      skin,
      contentWidth,
      navLayout,
      navDarkMode,
      rtl,
    } = themeCustomizations

    // Apply primary color if provided
    if (primaryColor) {
      try {
        vuetifyTheme.themes.value.light.colors.primary = primaryColor
        vuetifyTheme.themes.value.dark.colors.primary = primaryColor
        
        // Store in cookies for persistence
        cookieRef('lightThemePrimaryColor', null).value = primaryColor
        cookieRef('darkThemePrimaryColor', null).value = primaryColor
        useStorage(namespaceConfig('initial-loader-color'), null).value = primaryColor
      } catch (error) {
        console.warn('Failed to apply primary color:', error)
      }
    }

    // Apply theme (light/dark/system)
    if (theme) {
      try {
        configStore.theme = theme
      } catch (error) {
        console.warn('Failed to apply theme:', error)
      }
    }

    // Apply skin (default/bordered)
    if (skin) {
      try {
        configStore.skin = skin
      } catch (error) {
        console.warn('Failed to apply skin:', error)
      }
    }

    // Apply font size if provided
    if (fontSize) {
      try {
        configStore.fontSize = fontSize
      } catch (error) {
        console.warn('Failed to apply fontSize:', error)
      }
    }

    // Apply content width (compact/wide)
    if (contentWidth) {
      try {
        configStore.appContentWidth = contentWidth
      } catch (error) {
        console.warn('Failed to apply content width:', error)
      }
    }

    // Apply navigation layout (vertical/horizontal/collapsed)
    if (navLayout) {
      try {
        configStore.appContentLayoutNav = navLayout
      } catch (error) {
        console.warn('Failed to apply nav layout:', error)
      }
    }

    // Apply semi-dark navbar mode
    if (navDarkMode !== undefined) {
      try {
        configStore.isVerticalNavSemiDark = navDarkMode
      } catch (error) {
        console.warn('Failed to apply nav dark mode:', error)
      }
    }

    // Apply RTL (right-to-left) mode
    if (rtl !== undefined) {
      try {
        configStore.isAppRTL = rtl
      } catch (error) {
        console.warn('Failed to apply RTL mode:', error)
      }
    }
  }

  /**
   * Load user preferences from cookie and apply them
   * This should be called during app initialization after user login
   */
  const loadAndApplyUserPreferences = () => {
    const userPreferencesJson = useCookie('userPreferences').value
    
    if (!userPreferencesJson)
      return

    const userPreferences = typeof userPreferencesJson === 'string'
      ? JSON.parse(userPreferencesJson)
      : userPreferencesJson

    if (!userPreferences.themeCustomizations)
      return

    const themeCustomizations = parseThemeCustomizations(userPreferences.themeCustomizations)
    
    if (themeCustomizations) {
      applyThemeCustomizations(themeCustomizations)
    }
  }

  /**
   * Save user preferences to cookies (called after login)
   * @param {object} userPreferences - User preferences object from login response
   */
  const saveUserPreferences = (userPreferences) => {
    if (!userPreferences)
      return

    useCookie('userPreferences').value = JSON.stringify(userPreferences)
    
    // Immediately apply theme customizations if available
    if (userPreferences.themeCustomizations) {
      const themeCustomizations = parseThemeCustomizations(userPreferences.themeCustomizations)
      if (themeCustomizations) {
        applyThemeCustomizations(themeCustomizations)
      }
    }

    // Store other preferences for future use
    if (userPreferences.language) {
      useCookie('language').value = userPreferences.language
    }

    if (userPreferences.timezone) {
      useCookie('timezone').value = userPreferences.timezone
    }

    if (userPreferences.currency) {
      useCookie('currency').value = userPreferences.currency
    }

    if (userPreferences.dateFormat) {
      useCookie('dateFormat').value = userPreferences.dateFormat
    }

    if (userPreferences.timeFormat) {
      useCookie('timeFormat').value = userPreferences.timeFormat
    }

    if (userPreferences.notificationPreferences) {
      useCookie('notificationPreferences').value = userPreferences.notificationPreferences
    }
  }

  return {
    parseThemeCustomizations,
    applyThemeCustomizations,
    loadAndApplyUserPreferences,
    saveUserPreferences,
  }
}
