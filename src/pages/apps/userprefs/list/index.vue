<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'

definePage({
  meta: {
    action: 'read',
    subject: 'Auth',
  },
})
const isLoading = ref(false)
const hasChanges = ref(false)

// Store original preferences for reset functionality
const originalFormData = ref({})

// Form data structure
const formData = reactive({
  // Notification Preferences
  notificationPreferences: {
    email: true,
    push: true,
    sms: false,
    frequency: 'instant',
  },
  // Regional Settings
  language: 'en',
  timezone: 'EAT',
  currency: 'KES',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  // Security Settings
  twoFactorEnabled: false,
  emailNotificationsEnabled: true,
})

// Watch for changes in formData
watch(formData, () => {
  hasChanges.value = JSON.stringify(formData) !== JSON.stringify(originalFormData.value)
}, { deep: true })

// Load preferences from localStorage/cookies on mount
const loadUserPreferences = () => {
  try {
    // Try loading from localStorage first (userPreferences cookie)
    const userPreferencesJson = useCookie('userPreferences').value
    
    if (userPreferencesJson) {
      const userPreferences = typeof userPreferencesJson === 'string'
        ? JSON.parse(userPreferencesJson)
        : userPreferencesJson

      // Update form data with loaded preferences
      if (userPreferences.notificationPreferences) {
        formData.notificationPreferences = {
          ...formData.notificationPreferences,
          ...userPreferences.notificationPreferences,
        }
      }

      if (userPreferences.language)
        formData.language = userPreferences.language

      if (userPreferences.timezone)
        formData.timezone = userPreferences.timezone

      if (userPreferences.currency)
        formData.currency = userPreferences.currency

      if (userPreferences.dateFormat)
        formData.dateFormat = userPreferences.dateFormat

      if (userPreferences.timeFormat)
        formData.timeFormat = userPreferences.timeFormat

      if (userPreferences.twoFactorEnabled !== undefined)
        formData.twoFactorEnabled = userPreferences.twoFactorEnabled

      if (userPreferences.emailNotificationsEnabled !== undefined)
        formData.emailNotificationsEnabled = userPreferences.emailNotificationsEnabled
    }

    // Also try individual cookies as fallback
    if (useCookie('language').value)
      formData.language = useCookie('language').value

    if (useCookie('timezone').value)
      formData.timezone = useCookie('timezone').value

    if (useCookie('currency').value)
      formData.currency = useCookie('currency').value

    if (useCookie('dateFormat').value)
      formData.dateFormat = useCookie('dateFormat').value

    if (useCookie('timeFormat').value)
      formData.timeFormat = useCookie('timeFormat').value

    if (useCookie('notificationPreferences').value) {
      const notifPrefs = JSON.parse(useCookie('notificationPreferences').value)
      formData.notificationPreferences = { ...formData.notificationPreferences, ...notifPrefs }
    }

    if (useCookie('twoFactorEnabled').value !== undefined)
      formData.twoFactorEnabled = useCookie('twoFactorEnabled').value === 'true'

    if (useCookie('emailNotificationsEnabled').value !== undefined)
      formData.emailNotificationsEnabled = useCookie('emailNotificationsEnabled').value === 'true'

    // Store original data for reset
    originalFormData.value = JSON.parse(JSON.stringify(formData))
  }
  catch (error) {
    console.error('Error loading user preferences:', error)
  }
}

// Options for select fields
const languageOptions = [
  { title: 'English', value: 'en' },
  { title: 'Swahili', value: 'sw' },
  { title: 'French', value: 'fr' },
  { title: 'Spanish', value: 'es' },
]

const timezoneOptions = [
  { title: 'East Africa Time (EAT)', value: 'EAT' },
  { title: 'West Africa Time (WAT)', value: 'WAT' },
  { title: 'Central Africa Time (CAT)', value: 'CAT' },
  { title: 'UTC', value: 'UTC' },
]

const currencyOptions = [
  { title: 'Kenyan Shilling (KES)', value: 'KES' },
  { title: 'US Dollar (USD)', value: 'USD' },
  { title: 'Euro (EUR)', value: 'EUR' },
  { title: 'British Pound (GBP)', value: 'GBP' },
]

const dateFormatOptions = [
  { title: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
  { title: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
  { title: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
]

const timeFormatOptions = [
  { title: '24-hour (23:59)', value: '24h' },
  { title: '12-hour (11:59 PM)', value: '12h' },
]

const frequencyOptions = [
  {
    title: 'Instant',
    desc: 'Receive notifications immediately',
    value: 'instant',
  },
  {
    title: 'Hourly',
    desc: 'Receive notifications once per hour',
    value: 'hourly',
  },
  {
    title: 'Daily',
    desc: 'Receive notifications once per day',
    value: 'daily',
  },
  {
    title: 'Weekly',
    desc: 'Receive notifications once per week',
    value: 'weekly',
  },
]

// Save preferences to API and localStorage
const saveUserPreferences = async () => {
  isLoading.value = true
  try {
    // Build the preferences payload
    const preferencesPayload = {
      notificationPreferences: {
        email: formData.notificationPreferences.email,
        push: formData.notificationPreferences.push,
        sms: formData.notificationPreferences.sms,
        frequency: formData.notificationPreferences.frequency,
      },
      language: formData.language,
      timezone: formData.timezone,
      currency: formData.currency,
      dateFormat: formData.dateFormat,
      timeFormat: formData.timeFormat,
      twoFactorEnabled: formData.twoFactorEnabled,
      emailNotificationsEnabled: formData.emailNotificationsEnabled,
      customSettings: null,
    }

    // Make API call to update user preferences (following TheCustomizer.vue pattern)
    const {
      data: responseData,
      error,
    } = await axiosApiCall('/user-preferences', {
      data: preferencesPayload,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (error) {
      useSweetAlert.errorMessage('Failed to save preferences: ' + error.message)
      return
    }

    // Update cookies with new preferences
    useCookie('notificationPreferences').value = JSON.stringify(formData.notificationPreferences)
    useCookie('language').value = formData.language
    useCookie('timezone').value = formData.timezone
    useCookie('currency').value = formData.currency
    useCookie('dateFormat').value = formData.dateFormat
    useCookie('timeFormat').value = formData.timeFormat
    useCookie('twoFactorEnabled').value = String(formData.twoFactorEnabled)
    useCookie('emailNotificationsEnabled').value = String(formData.emailNotificationsEnabled)

    // Update the main userPreferences cookie
    const existingPreferences = useCookie('userPreferences').value
    const parsedExisting = typeof existingPreferences === 'string' ? JSON.parse(existingPreferences) : (existingPreferences || {})
    const updatedUserPreferences = {
      ...parsedExisting,
      ...preferencesPayload,
    }
    useCookie('userPreferences').value = JSON.stringify(updatedUserPreferences)

    // Update original data for reset
    originalFormData.value = JSON.parse(JSON.stringify(formData))

    useSweetAlert.successMessage('Your preferences have been saved successfully.')
  }
  catch (error) {
    console.error('Error saving preferences:', error)
    useSweetAlert.errorMessage(error.message || 'Failed to save preferences. Please try again.')
  }
  finally {
    isLoading.value = false
  }
}

// Reset form to original/default values
const resetPreferences = () => {
  Object.assign(formData, JSON.parse(JSON.stringify(originalFormData.value)))
}

// Load preferences on component mount
onMounted(() => {
  loadUserPreferences()
})
</script>

<template>
  <section>
    <!-- Notification Preferences Card -->
    <VCard class="mb-6">
      <VCardItem class="pb-4">
        <VCardTitle class="d-flex align-center gap-2">
          <VIcon icon="tabler-bell" />
          Notification Preferences
        </VCardTitle>
        <template #subtitle>
          Manage how and when you receive notifications
        </template>
      </VCardItem>

      <VDivider />

      <VCardText class="pt-6">
        <VRow>
          <!-- Email Notifications -->
          <VCol cols="12" md="6">
            <div class="d-flex align-center justify-space-between py-2">
              <div>
                <p class="text-body-1 font-weight-medium mb-1">
                  Email Notifications
                </p>
                <p class="text-body-2 text-disabled mb-0">
                  Receive updates via email
                </p>
              </div>
              <VSwitch
                v-model="formData.notificationPreferences.email"
                color="primary"
                inset
              />
            </div>
          </VCol>

          <!-- Push Notifications -->
          <VCol cols="12" md="6">
            <div class="d-flex align-center justify-space-between py-2">
              <div>
                <p class="text-body-1 font-weight-medium mb-1">
                  Push Notifications
                </p>
                <p class="text-body-2 text-disabled mb-0">
                  Receive browser push notifications
                </p>
              </div>
              <VSwitch
                v-model="formData.notificationPreferences.push"
                color="primary"
                inset
              />
            </div>
          </VCol>

          <!-- SMS Notifications -->
          <VCol cols="12" md="6">
            <div class="d-flex align-center justify-space-between py-2">
              <div>
                <p class="text-body-1 font-weight-medium mb-1">
                  SMS Notifications
                </p>
                <p class="text-body-2 text-disabled mb-0">
                  Receive updates via SMS
                </p>
              </div>
              <VSwitch
                v-model="formData.notificationPreferences.sms"
                color="primary"
                inset
              />
            </div>
          </VCol>

          <!-- Notification Frequency -->
          <VCol cols="12">
            <p class="text-body-1 font-weight-medium mb-4">
              Notification Frequency
            </p>
            <CustomRadios
              :selected-radio="formData.notificationPreferences.frequency"
              :radio-content="frequencyOptions"
              :grid-column="{ sm: '6', cols: '12' }"
              @update:selected-radio="formData.notificationPreferences.frequency = $event"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Regional Settings Card -->
    <VCard class="mb-6">
      <VCardItem class="pb-4">
        <VCardTitle class="d-flex align-center gap-2">
          <VIcon icon="tabler-globe" />
          Regional Settings
        </VCardTitle>
        <template #subtitle>
          Configure your language, timezone, and date format preferences
        </template>
      </VCardItem>

      <VDivider />

      <VCardText class="pt-6">
        <VRow>
          <!-- Language -->
          <VCol cols="12" md="6">
            <AppSelect
              v-model="formData.language"
              label="Language"
              placeholder="Select language"
              :items="languageOptions"
              item-title="title"
              item-value="value"
            />
          </VCol>

          <!-- Timezone -->
          <VCol cols="12" md="6">
            <AppSelect
              v-model="formData.timezone"
              label="Timezone"
              placeholder="Select timezone"
              :items="timezoneOptions"
              item-title="title"
              item-value="value"
            />
          </VCol>

          <!-- Currency -->
          <VCol cols="12" md="6">
            <AppSelect
              v-model="formData.currency"
              label="Currency"
              placeholder="Select currency"
              :items="currencyOptions"
              item-title="title"
              item-value="value"
            />
          </VCol>

          <!-- Date Format -->
          <VCol cols="12" md="6">
            <AppSelect
              v-model="formData.dateFormat"
              label="Date Format"
              placeholder="Select date format"
              :items="dateFormatOptions"
              item-title="title"
              item-value="value"
            />
          </VCol>

          <!-- Time Format -->
          <VCol cols="12" md="6">
            <p class="text-body-1 font-weight-medium mb-4">
              Time Format
            </p>
            <VRadioGroup
              v-model="formData.timeFormat"
              inline
            >
              <VRadio
                v-for="option in timeFormatOptions"
                :key="option.value"
                :value="option.value"
                :label="option.title"
              />
            </VRadioGroup>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Security Settings Card -->
    <VCard class="mb-6">
      <VCardItem class="pb-4">
        <VCardTitle class="d-flex align-center gap-2">
          <VIcon icon="tabler-lock" />
          Security Settings
        </VCardTitle>
        <template #subtitle>
          Manage your account security and authentication preferences
        </template>
      </VCardItem>

      <VDivider />

      <VCardText class="pt-6">
        <VRow>
          <!-- Two Factor Authentication -->
          <VCol cols="12">
            <div class="d-flex align-center justify-space-between py-2 px-3 rounded" style="background: rgba(var(--v-theme-primary), 0.05);">
              <div class="flex-grow-1">
                <p class="text-body-1 font-weight-medium mb-1">
                  Two-Factor Authentication
                </p>
                <p class="text-body-2 text-disabled mb-0">
                  Add an extra layer of security to your account
                </p>
              </div>
              <VBtn
                v-if="!formData.twoFactorEnabled"
                color="primary"
                variant="outlined"
                size="small"
                @click="() => {}"
              >
                Enable
              </VBtn>
              <VBtn
                v-else
                color="error"
                variant="outlined"
                size="small"
                @click="() => {}"
              >
                Disable
              </VBtn>
            </div>
          </VCol>

          <!-- Email Notifications Toggle -->
          <VCol cols="12">
            <div class="d-flex align-center justify-space-between py-2">
              <div>
                <p class="text-body-1 font-weight-medium mb-1">
                  Email Notification Digest
                </p>
                <p class="text-body-2 text-disabled mb-0">
                  Receive a summary of your account activity
                </p>
              </div>
              <VSwitch
                v-model="formData.emailNotificationsEnabled"
                color="primary"
                inset
              />
            </div>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Action Buttons -->
    <VRow class="mb-6">
      <VCol cols="12" class="d-flex justify-center gap-4">
        <VBtn
          color="primary"
          size="large"
          prepend-icon="tabler-send"
          :loading="isLoading"
          :disabled="!hasChanges"
          @click="saveUserPreferences"
        >
          Save Changes
        </VBtn>
        <VBtn
          variant="outlined"
          color="secondary"
          size="large"
          prepend-icon="tabler-rotate-clockwise-2"
          @click="resetPreferences"
        >
          Reset to Default
        </VBtn>
      </VCol>
    </VRow>
  </section>
</template>

<style scoped>
/* Add subtle transitions for better UX */
.v-switch {
  transition: all 0.2s ease-in-out;
}

/* Highlight important settings */
.security-highlight {
  border-left: 4px solid rgb(var(--v-theme-primary));
}
</style>
