<script setup>
import { useBrowserNotification } from '@/composables/useBrowserNotification'

const { t } = useI18n()
const { permission, isEnabled, isSupported, requestPermission, enable, disable } = useBrowserNotification()

const toggleEnabled = value => {
  if (value) {
    enable()
  } else {
    disable()
  }
}

const handleRequestPermission = async () => {
  const result = await requestPermission()
  if (result === 'granted') {
    enable()
  }
}

const permissionColor = computed(() => {
  if (permission.value === 'granted') return 'success'
  if (permission.value === 'denied') return 'error'

  return 'warning'
})

const permissionLabel = computed(() => {
  if (permission.value === 'granted') return t('notifications.permissionStatusGranted')
  if (permission.value === 'denied') return t('notifications.permissionStatusDenied')

  return t('notifications.permissionStatusDefault')
})

const recentDevices = ref([
  {
    type: 'New for you',
    email: true,
    browser: true,
    app: true,
  },
  {
    type: 'Account activity',
    email: true,
    browser: true,
    app: true,
  },
  {
    type: 'A new browser used to sign in',
    email: true,
    browser: true,
    app: false,
  },
  {
    type: 'A new device is linked',
    email: true,
    browser: false,
    app: false,
  },
])

const selectedNotification = ref('Only when I\'m online')
</script>

<template>
  <VCard>
    <VCardItem>
      <VCardTitle>{{ t('notifications.browserNotifications') }}</VCardTitle>
      <p class="text-body-1 mb-0">
        {{ t('notifications.browserNotificationsDescription') }}
      </p>
    </VCardItem>

    <VCardText>
      <VRow align="center">
        <VCol
          cols="12"
          sm="6"
        >
          <div class="d-flex align-center gap-2 mb-4">
            <span class="text-body-1">{{ t('Status') }}:</span>
            <VChip
              :color="permissionColor"
              size="small"
              label
            >
              {{ permissionLabel }}
            </VChip>
          </div>

          <VSwitch
            :model-value="isEnabled"
            :label="t('notifications.enableBrowserNotifications')"
            :disabled="!isSupported || permission === 'denied'"
            @update:model-value="toggleEnabled"
          />
          <p class="text-body-2 text-disabled mt-1">
            {{ t('notifications.enableBrowserNotificationsHint') }}
          </p>
        </VCol>

        <VCol
          cols="12"
          sm="6"
        >
          <VBtn
            v-if="permission === 'default'"
            color="primary"
            variant="tonal"
            @click="handleRequestPermission"
          >
            {{ t('notifications.requestPermission') }}
          </VBtn>

          <VAlert
            v-if="permission === 'denied'"
            type="warning"
            variant="tonal"
            density="compact"
            class="mt-2"
          >
            {{ t('notifications.permissionDeniedHelp') }}
          </VAlert>
        </VCol>
      </VRow>
    </VCardText>

    <VDivider />

    <VCardItem>
      <VCardTitle>{{ t('Notifications') }}</VCardTitle>
    </VCardItem>

    <VCardText class="px-0">
      <VDivider />
      <VTable class="text-no-wrap rounded">
        <thead>
          <tr>
            <th scope="col">
              Type
            </th>
            <th scope="col">
              EMAIL
            </th>
            <th scope="col">
              BROWSER
            </th>
            <th scope="col">
              App
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="device in recentDevices"
            :key="device.type"
          >
            <td class="text-body-1 text-high-emphasis">
              {{ device.type }}
            </td>
            <td>
              <VCheckbox v-model="device.email" />
            </td>
            <td>
              <VCheckbox v-model="device.browser" />
            </td>
            <td>
              <VCheckbox v-model="device.app" />
            </td>
          </tr>
        </tbody>
      </VTable>
      <VDivider />
    </VCardText>

    <VCardText>
      <VForm @submit.prevent="() => {}">
        <h6 class="text-body-1 font-weight-medium mb-6">
          When should we send you notifications?
        </h6>

        <VRow>
          <VCol
            cols="12"
            sm="6"
          >
            <AppSelect
              v-model="selectedNotification"
              mandatory
              placeholder="Select an option"
              :items="['Only when I\'m online', 'Anytime']"
            />
          </VCol>
        </VRow>

        <div class="d-flex flex-wrap gap-4 mt-6">
          <VBtn type="submit">
            Save Changes
          </VBtn>
          <VBtn
            color="secondary"
            variant="tonal"
            type="reset"
          >
            Discard
          </VBtn>
        </div>
      </VForm>
    </VCardText>
  </VCard>
</template>
