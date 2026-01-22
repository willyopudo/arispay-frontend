<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { dashboardService } from '@/services/dashboardService'
import { useTourStore } from '@/stores/tourStore'
import CrmActivityTimeline from '@/views/dashboards/crm/CrmActivityTimeline.vue'
import CrmEarningReportsYearlyOverview from '@/views/dashboards/crm/CrmEarningReportsYearlyOverview.vue'
import CrmRecentTransactions from '@/views/dashboards/crm/CrmRecentTransactions.vue'
import CrmTopClients from '@/views/dashboards/crm/CrmTopClients.vue'

const { t } = useI18n()
const tourStore = useTourStore()

const dashboardData = ref(null)
const loading = ref(true)
const error = ref(null)

const fetchDashboard = async () => {
  try {
    loading.value = true
    error.value = null
    const { data, error: apiError } = await dashboardService.getDashboardSummary()

    if (apiError) {
      console.error('API error:', apiError)
      error.value = 'Failed to load dashboard data. Please try again.'
      return
    }

    dashboardData.value = data
  } catch (err) {
    console.error('Error fetching dashboard:', err)
    error.value = 'Failed to load dashboard data. Please try again.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboard()
  // Check and auto-start tour for first-time users
  tourStore.checkAndAutoStart()
})

const widgets = computed(() => dashboardData.value?.widgets || {})

const formatNumber = value => {
  if (!value && value !== 0) return '0'

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const formatCurrency = value => {
  if (!value && value !== 0) return 'KES 0.00'

  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
  }).format(value)
}

const widgetCards = computed(() => [
  {
    icon: 'tabler-receipt',
    color: 'primary',
    title: t('Collections'),
    subTitle: t('This Month'),
    stat: formatNumber(widgets.value.collections?.currentValue),
    change: widgets.value.collections?.percentageChange
      ? `${widgets.value.collections.trend === 'up' ? '+' : '-'}${widgets.value.collections.percentageChange.toFixed(1)}%`
      : '0%',
    trend: widgets.value.collections?.trend || 'up',
  },
  {
    icon: 'tabler-arrow-up-right',
    color: 'success',
    title: t('Disbursements'),
    subTitle: t('This Month'),
    stat: formatNumber(widgets.value.disbursements?.currentValue),
    change: widgets.value.disbursements?.percentageChange
      ? `${widgets.value.disbursements.trend === 'up' ? '+' : '-'}${widgets.value.disbursements.percentageChange.toFixed(1)}%`
      : '0%',
    trend: widgets.value.disbursements?.trend || 'up',
  },
  {
    icon: 'tabler-currency-dollar',
    color: 'info',
    title: t('Total Collections'),
    subTitle: t('This Month'),
    stat: formatCurrency(widgets.value.totalCollections?.currentValue),
    change: widgets.value.totalCollections?.percentageChange
      ? `${widgets.value.totalCollections.trend === 'up' ? '+' : '-'}${widgets.value.totalCollections.percentageChange.toFixed(1)}%`
      : '0%',
    trend: widgets.value.totalCollections?.trend || 'up',
  },
  {
    icon: 'tabler-credit-card',
    color: 'warning',
    title: t('Total Disbursements'),
    subTitle: t('This Month'),
    stat: formatCurrency(widgets.value.totalDisbursements?.currentValue),
    change: widgets.value.totalDisbursements?.percentageChange
      ? `${widgets.value.totalDisbursements.trend === 'up' ? '+' : '-'}${widgets.value.totalDisbursements.percentageChange.toFixed(1)}%`
      : '0%',
    trend: widgets.value.totalDisbursements?.trend || 'up',
  },
])
</script>

<template>
  <!-- Loading State -->
  <VRow v-if="loading" class="match-height">
    <VCol cols="12">
      <VCard>
        <VCardText class="text-center pa-10">
          <VProgressCircular indeterminate color="primary" size="64" />
          <p class="mt-4 text-body-1">
            {{ $t('Loading dashboard...') }}
          </p>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <!-- Error State -->
  <VRow v-else-if="error" class="match-height">
    <VCol cols="12">
      <VAlert type="error" variant="tonal">
        <template #title>
          {{ $t('Error Loading Dashboard') }}
        </template>
        {{ $t('Failed to load dashboard data. Please try again.') }}
        <template #append>
          <VBtn variant="text" color="error" @click="fetchDashboard">
            {{ $t('Retry') }}
          </VBtn>
        </template>
      </VAlert>
    </VCol>
  </VRow>

  <!-- Dashboard Content -->
  <VRow v-else class="match-height">
    <!-- Widget Cards -->
    <VCol
      v-for="(widget, index) in widgetCards"
      :key="widget.title"
      cols="12"
      sm="6"
      md="3"
      :id="index === 0 ? 'tour-widget-cards' : undefined"
    >
      <VCard>
        <VCardText>
          <VAvatar
            :color="widget.color"
            variant="tonal"
            rounded
            size="44"
          >
            <VIcon
              :icon="widget.icon"
              size="28"
            />
          </VAvatar>

          <h5 class="text-h5 mt-3">
            {{ widget.title }}
          </h5>
          <p class="my-1 text-body-2">
            {{ widget.subTitle }}
          </p>
          <p class="mb-3 text-h6 text-high-emphasis">
            {{ widget.stat }}
          </p>
          <VChip
            :color="widget.trend === 'up' ? 'success' : 'error'"
            label
            size="small"
          >
            {{ widget.change }}
          </VChip>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Earning Reports -->
    <VCol id="tour-earning-reports" cols="12" md="8">
      <CrmEarningReportsYearlyOverview
        v-if="dashboardData?.earningReports"
        :data="dashboardData.earningReports"
      />
      <VCard v-else>
        <VCardText class="text-center pa-10">
          {{ $t('No earning reports data available') }}
        </VCardText>
      </VCard>
    </VCol>

    <!-- Top Clients -->
    <VCol id="tour-top-clients" cols="12" md="4">
      <CrmTopClients
        v-if="dashboardData?.topClients"
        :clients="dashboardData.topClients"
      />
      <VCard v-else>
        <VCardText class="text-center pa-10">
          {{ $t('No top clients data available') }}
        </VCardText>
      </VCard>
    </VCol>

    <!-- Activity Timeline -->
    <VCol id="tour-activity-timeline" cols="12" md="4">
      <CrmActivityTimeline />
    </VCol>

    <!-- Recent Transactions -->
    <VCol id="tour-recent-transactions" cols="12" md="8">
      <CrmRecentTransactions
        v-if="dashboardData?.latestTransactions"
        :transactions="dashboardData.latestTransactions"
      />
      <VCard v-else>
        <VCardText class="text-center pa-10">
          {{ $t('No recent transactions') }}
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
