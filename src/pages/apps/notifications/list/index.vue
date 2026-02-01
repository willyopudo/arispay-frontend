<script setup>
import { useI18n } from 'vue-i18n'
import { useNotificationStore } from '@/stores/notificationStore'

const { t } = useI18n()
const notificationStore = useNotificationStore()

// Data
const allNotifications = ref([])
const loading = ref(false)
const searchQuery = ref('')
const selectedStatus = ref(null)
const selectedType = ref(null)
const selectedRows = ref([])

// Pagination
const itemsPerPage = ref(10)
const page = ref(1)

// Notification type options
const typeOptions = computed(() => [
  { title: t('Payment Received'), value: 'PAYMENT_RECEIVED' },
  { title: t('Bulk Payment Initiated'), value: 'BULK_PAYMENT_INITIATED' },
  { title: t('Bulk Payment Completed'), value: 'BULK_PAYMENT_COMPLETED' },
])

const statusOptions = computed(() => [
  { title: t('Read'), value: 'read' },
  { title: t('Unread'), value: 'unread' },
])

// Headers
const headers = computed(() => [
  { title: '', key: 'readStatus', sortable: false, width: '40px' },
  { title: t('Notification'), key: 'title' },
  { title: t('Type'), key: 'eventType' },
  { title: t('Time'), key: 'time' },
  { title: t('Actions'), key: 'actions', sortable: false },
])

// Filtered notifications
const filteredNotifications = computed(() => {
  let result = allNotifications.value

  if (selectedStatus.value === 'read') {
    result = result.filter(n => n.isSeen)
  } else if (selectedStatus.value === 'unread') {
    result = result.filter(n => !n.isSeen)
  }

  if (selectedType.value) {
    result = result.filter(n => n.eventType === selectedType.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()

    result = result.filter(n =>
      n.title?.toLowerCase().includes(query) ||
      n.subtitle?.toLowerCase().includes(query),
    )
  }

  return result
})

const totalFilteredNotifications = computed(() => filteredNotifications.value.length)

// Widget data
const widgetData = computed(() => {
  const all = allNotifications.value
  const unread = all.filter(n => !n.isSeen).length
  const read = all.filter(n => n.isSeen).length

  const today = new Date()

  today.setHours(0, 0, 0, 0)

  const todayCount = all.filter(n => {
    if (!n.time) return false

    return n.time === 'Just now' || n.time.includes('min ago') || n.time.includes('hour')
  }).length

  return [
    {
      title: 'Total Notifications',
      value: all.length,
      icon: 'tabler-bell',
      iconColor: 'primary',
    },
    {
      title: 'Unread',
      value: unread,
      icon: 'tabler-mail',
      iconColor: 'warning',
    },
    {
      title: 'Read',
      value: read,
      icon: 'tabler-mail-opened',
      iconColor: 'success',
    },
    {
      title: 'Today',
      value: todayCount,
      icon: 'tabler-clock',
      iconColor: 'info',
    },
  ]
})

// Resolve event type display
const resolveEventType = eventType => {
  const types = {
    PAYMENT_RECEIVED: { text: t('Payment Received'), color: 'success' },
    BULK_PAYMENT_INITIATED: { text: t('Bulk Payment Initiated'), color: 'info' },
    BULK_PAYMENT_COMPLETED: { text: t('Bulk Payment Completed'), color: 'primary' },
  }

  return types[eventType] || { text: eventType || t('General'), color: 'secondary' }
}

// Actions
async function fetchNotifications() {
  loading.value = true
  try {
    allNotifications.value = await notificationStore.fetchAllNotifications(100)
  } finally {
    loading.value = false
  }
}

async function markSelectedAsRead() {
  if (selectedRows.value.length === 0) return

  await notificationStore.markAsRead(selectedRows.value)
  allNotifications.value.forEach(n => {
    if (selectedRows.value.includes(n.id)) {
      n.isSeen = true
    }
  })
  selectedRows.value = []
}

async function deleteSelected() {
  if (selectedRows.value.length === 0) return

  for (const id of selectedRows.value) {
    await notificationStore.removeNotification(id)
  }
  allNotifications.value = allNotifications.value.filter(n => !selectedRows.value.includes(n.id))
  selectedRows.value = []
}

async function toggleReadStatus(notification) {
  if (notification.isSeen) {
    await notificationStore.markAsUnread([notification.id])
    notification.isSeen = false
  } else {
    await notificationStore.markAsRead([notification.id])
    notification.isSeen = true
  }
}

async function deleteNotification(id) {
  await notificationStore.removeNotification(id)
  allNotifications.value = allNotifications.value.filter(n => n.id !== id)
}

function clearFilters() {
  selectedStatus.value = null
  selectedType.value = null
  searchQuery.value = ''
}

// Fetch on mount
onMounted(() => {
  fetchNotifications()
})
</script>

<template>
  <section>
    <!-- Widgets -->
    <div class="d-flex mb-6">
      <VRow>
        <template
          v-for="(data, id) in widgetData"
          :key="id"
        >
          <VCol
            cols="12"
            md="3"
            sm="6"
          >
            <VCard>
              <VCardText>
                <div class="d-flex justify-space-between">
                  <div class="d-flex flex-column gap-y-1">
                    <div class="text-body-1 text-high-emphasis">
                      {{ $t(data.title) }}
                    </div>
                    <h4 class="text-h4">
                      {{ data.value }}
                    </h4>
                  </div>
                  <VAvatar
                    :color="data.iconColor"
                    variant="tonal"
                    rounded
                    size="42"
                  >
                    <VIcon
                      :icon="data.icon"
                      size="26"
                    />
                  </VAvatar>
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </template>
      </VRow>
    </div>

    <VCard>
      <VCardItem class="pb-4">
        <VCardTitle>{{ $t('Filters') }}</VCardTitle>
      </VCardItem>

      <VCardText>
        <VRow>
          <!-- Status Filter -->
          <VCol
            cols="12"
            md="3"
          >
            <AppSelect
              v-model="selectedStatus"
              :placeholder="$t('Select Status')"
              :items="statusOptions"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>

          <!-- Type Filter -->
          <VCol
            cols="12"
            md="3"
          >
            <AppSelect
              v-model="selectedType"
              :placeholder="$t('Select Type')"
              :items="typeOptions"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>

          <!-- Filter Button -->
          <VCol
            cols="12"
            md="2"
            class="d-flex align-center gap-2"
          >
            <VBtn
              variant="tonal"
              color="secondary"
              @click="clearFilters"
            >
              {{ $t('Clear') }}
              <VIcon
                end
                icon="tabler-x"
              />
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

      <VCardText class="d-flex flex-wrap gap-4">
        <div class="me-3 d-flex gap-3">
          <AppSelect
            :model-value="itemsPerPage"
            :items="[
              { value: 5, title: '5' },
              { value: 10, title: '10' },
              { value: 25, title: '25' },
              { value: 50, title: '50' },
              { value: 100, title: '100' },
            ]"
            style="inline-size: 6.25rem;"
            @update:model-value="itemsPerPage = parseInt($event, 10)"
          />
        </div>

        <!-- Bulk Actions -->
        <div
          v-show="selectedRows.length > 0"
          class="d-flex gap-2"
        >
          <VBtn
            size="small"
            color="primary"
            variant="tonal"
            @click="markSelectedAsRead"
          >
            <VIcon
              start
              icon="tabler-mail-opened"
            />
            {{ $t('Mark Read') }}
          </VBtn>
          <VBtn
            size="small"
            color="error"
            variant="tonal"
            @click="deleteSelected"
          >
            <VIcon
              start
              icon="tabler-trash"
            />
            {{ $t('Delete') }}
          </VBtn>
          <span class="text-body-2 align-self-center text-disabled">
            {{ selectedRows.length }} {{ $t('selected') }}
          </span>
        </div>

        <VSpacer />

        <div class="app-user-search-filter d-flex align-center flex-wrap gap-4">
          <div style="inline-size: 15.625rem;">
            <AppTextField
              v-model="searchQuery"
              :placeholder="$t('Search Notifications')"
            />
          </div>
        </div>
      </VCardText>

      <VDivider />

      <!-- Data Table -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:model-value="selectedRows"
        v-model:page="page"
        :items="filteredNotifications"
        item-value="id"
        :items-length="totalFilteredNotifications"
        :headers="headers"
        :loading="loading"
        class="text-no-wrap"
        show-select
      >
        <!-- Read Status Dot -->
        <template #item.readStatus="{ item }">
          <VIcon
            size="10"
            icon="tabler-circle-filled"
            :color="!item.isSeen ? 'primary' : '#a8aaae'"
            class="cursor-pointer"
            @click="toggleReadStatus(item)"
          />
        </template>

        <!-- Notification Title + Subtitle -->
        <template #item.title="{ item }">
          <div class="d-flex align-center gap-x-3">
            <VAvatar
              :color="item.color || 'primary'"
              variant="tonal"
              size="38"
            >
              <VIcon
                v-if="item.icon"
                :icon="item.icon"
              />
            </VAvatar>
            <div>
              <p class="text-body-1 font-weight-medium mb-0">
                {{ item.title }}
              </p>
              <p class="text-body-2 text-disabled mb-0">
                {{ item.subtitle }}
              </p>
            </div>
          </div>
        </template>

        <!-- Event Type Chip -->
        <template #item.eventType="{ item }">
          <VChip
            :color="resolveEventType(item.eventType).color"
            size="small"
            label
          >
            {{ resolveEventType(item.eventType).text }}
          </VChip>
        </template>

        <!-- Time -->
        <template #item.time="{ item }">
          <span class="text-body-2 text-disabled">
            {{ item.time }}
          </span>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <IconBtn
              size="small"
              @click="toggleReadStatus(item)"
            >
              <VIcon
                size="20"
                :icon="item.isSeen ? 'tabler-mail' : 'tabler-mail-opened'"
              />
              <VTooltip
                activator="parent"
                location="top"
              >
                {{ item.isSeen ? $t('Mark as unread') : $t('Mark as read') }}
              </VTooltip>
            </IconBtn>
            <IconBtn
              size="small"
              color="error"
              @click="deleteNotification(item.id)"
            >
              <VIcon
                size="20"
                icon="tabler-trash"
              />
              <VTooltip
                activator="parent"
                location="top"
              >
                {{ $t('Delete') }}
              </VTooltip>
            </IconBtn>
          </div>
        </template>

        <!-- Pagination -->
        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalFilteredNotifications"
          />
        </template>
      </VDataTableServer>
    </VCard>
  </section>
</template>
