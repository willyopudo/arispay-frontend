<script setup>
import { computed } from 'vue'
import { useActivityWebSocket } from '@/composables/useActivityWebSocket'

const { activities, isConnected } = useActivityWebSocket()

const formatTimeAgo = timestamp => {
  if (!timestamp) return 'Unknown'

  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 1000 / 60)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}

const getEventColor = eventType => {
  const colorMap = {
    'TRANSACTION_CREATED': 'primary',
    'TRANSACTION_UPDATED': 'info',
    'BULK_DISBURSEMENT': 'success',
    'CLIENT_CREATED': 'warning',
    'CLIENT_UPDATED': 'secondary',
    'CLIENT_DELETED': 'error',
    'USER_UPDATED': 'info',
    'ACCOUNT_LINKED': 'success',
    'ACCOUNT_CREATED': 'success',
    'ACCOUNT_UPDATED': 'info',
    'ACCOUNT_DELETED': 'error',
  }

  return colorMap[eventType] || 'secondary'
}

const getEventIcon = eventType => {
  const iconMap = {
    'TRANSACTION_CREATED': 'tabler-receipt',
    'TRANSACTION_UPDATED': 'tabler-edit',
    'BULK_DISBURSEMENT': 'tabler-file-invoice',
    'CLIENT_CREATED': 'tabler-user-plus',
    'CLIENT_UPDATED': 'tabler-user-edit',
    'CLIENT_DELETED': 'tabler-user-minus',
    'USER_UPDATED': 'tabler-user-cog',
    'ACCOUNT_LINKED': 'tabler-link',
    'ACCOUNT_CREATED': 'tabler-building-bank',
    'ACCOUNT_UPDATED': 'tabler-edit',
    'ACCOUNT_DELETED': 'tabler-trash',
  }

  return iconMap[eventType] || 'tabler-bell'
}

const displayedActivities = computed(() => activities.value.slice(0, 4))
</script>

<template>
  <VCard>
    <VCardItem>
      <template #prepend>
        <VIcon
          icon="tabler-list-details"
          size="20"
        />
      </template>

      <VCardTitle>Activity Timeline</VCardTitle>

      <template #append>
        <VChip
          :color="isConnected ? 'success' : 'error'"
          size="small"
          variant="tonal"
        >
          <VIcon
            :icon="isConnected ? 'tabler-wifi' : 'tabler-wifi-off'"
            size="16"
            start
          />
          {{ isConnected ? 'Live' : 'Offline' }}
        </VChip>
      </template>
    </VCardItem>

    <VCardText>
      <VTimeline
        v-if="displayedActivities.length > 0"
        side="end"
        align="start"
        line-inset="8"
        truncate-line="start"
        density="compact"
      >
        <VTimelineItem
          v-for="(activity, index) in displayedActivities"
          :key="index"
          :dot-color="getEventColor(activity.eventType)"
          size="x-small"
        >
          <div class="d-flex justify-space-between align-center gap-2 flex-wrap mb-2">
            <div class="d-flex align-center gap-2">
              <VIcon
                :icon="getEventIcon(activity.eventType)"
                size="18"
                :color="getEventColor(activity.eventType)"
              />
              <span class="app-timeline-title font-weight-medium">
                {{ activity.title || 'Activity' }}
              </span>
            </div>
            <span class="app-timeline-meta text-caption">{{ formatTimeAgo(activity.timestamp) }}</span>
          </div>

          <div class="app-timeline-text mt-1 text-body-2">
            {{ activity.description || 'No description' }}
          </div>

          <div v-if="activity.userName" class="text-caption mt-2 text-medium-emphasis">
            by {{ activity.userName }}
          </div>
        </VTimelineItem>
      </VTimeline>

      <!-- Empty State -->
      <div v-else class="text-center pa-10">
        <VIcon
          icon="tabler-inbox"
          size="48"
          color="disabled"
          class="mb-4"
        />
        <p class="text-body-1 text-medium-emphasis">
          No recent activities
        </p>
        <p class="text-caption text-disabled">
          {{ isConnected ? 'Activities will appear here in real-time' : 'Connecting to activity feed...' }}
        </p>
      </div>
    </VCardText>
  </VCard>
</template>

<style scoped>
.app-timeline-title {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.app-timeline-meta {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.app-timeline-text {
  color: rgb(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
</style>
