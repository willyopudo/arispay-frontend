<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  clients: {
    type: Array,
    default: () => [],
  },
})

const formatCurrency = value => {
  if (!value && value !== 0) return 'KES 0.00'

  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const calculatePercentageChange = (current, previous) => {
  if (current == null) current = 0
  if (previous == null || previous === 0) {
    return current > 0 ? 100 : 0
  }

  return ((current - previous) * 100) / previous
}

const getClientInitials = clientName => {
  if (!clientName) return 'NA'

  const words = clientName.trim().split(' ')
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase()
  }

  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

const getAvatarColor = index => {
  const colors = ['primary', 'success', 'info', 'warning', 'error', 'secondary']

  return colors[index % colors.length]
}

const displayClients = computed(() => {
  return props.clients.map((client, index) => {
    const percentageChange = calculatePercentageChange(client.currentMonthAmount, client.twoMonthsAgoAmount)

    return {
      clientId: client.clientId,
      clientName: client.clientName || t('Unknown Client'),
      currentAmount: formatCurrency(client.currentMonthAmount),
      previousAmount: client.previousAmount,
      percentageChange: percentageChange,
      initials: getClientInitials(client.clientName),
      avatarColor: getAvatarColor(index),
    }
  })
})

const moreList = computed(() => [
  {
    title: t('Refresh'),
    value: 'refresh',
  },
  {
    title: t('View All'),
    value: 'View All',
  },
])
</script>

<template>
  <VCard
    :title="$t('Top Clients')"
    :subtitle="$t('Clients with highest growth')"
  >
    <template #append>
      <div class="mt-n4 me-n2">
        <MoreBtn
          size="small"
          :menu-list="moreList"
        />
      </div>
    </template>

    <VCardText>
      <div v-if="displayClients.length === 0" class="pa-10 text-center">
        <VIcon
          icon="tabler-users-off"
          size="48"
          color="disabled"
          class="mb-4"
        />
        <p class="text-body-1 text-medium-emphasis">
          {{ $t('No top clients data available') }}
        </p>
        <p class="text-sm text-disabled">
          {{ $t('Client data will appear here once transactions are recorded') }}
        </p>
      </div>

      <VList v-else class="card-list">
        <VListItem
          v-for="client in displayClients"
          :key="client.clientId"
        >
          <template #prepend>
            <VAvatar
              size="34"
              :color="client.avatarColor"
              variant="tonal"
              class="me-1"
            >
              <span class="text-sm font-weight-medium">{{ client.initials }}</span>
            </VAvatar>
          </template>

          <VListItemTitle class="font-weight-medium">
            {{ client.currentAmount }}
          </VListItemTitle>
          <VListItemSubtitle>
            {{ client.clientName }}
          </VListItemSubtitle>

          <template #append>
            <div :class="`d-flex align-center font-weight-medium ${client.percentageChange > 0 ? 'text-success' : client.percentageChange < 0 ? 'text-error' : 'text-secondary'}`">
              <VIcon
                v-if="client.percentageChange !== 0"
                :icon="client.percentageChange > 0 ? 'tabler-chevron-up' : 'tabler-chevron-down'"
                size="20"
                class="me-1"
              />
              <div class="font-weight-medium">
                {{ Math.abs(client.percentageChange).toFixed(1) }}%
              </div>
            </div>
          </template>
        </VListItem>
      </VList>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 1rem;
}
</style>
