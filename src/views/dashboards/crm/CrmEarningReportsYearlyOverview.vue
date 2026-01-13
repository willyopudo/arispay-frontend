<script setup>
import { useTheme } from 'vuetify'
import { hexToRgb } from '@layouts/utils'

const vuetifyTheme = useTheme()
const currentTab = ref(0)
const refVueApexChart = ref()

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
})

// Transform backend data into chart series grouped by payment mode
const transformedData = computed(() => {
  if (!props.data || props.data.length === 0) return {}

  // Group by payment mode
  const grouped = {}
  const monthsSet = new Set()

  props.data.forEach(item => {
    const mode = item.paymentMode || 'Unknown'
    const month = item.month || 'N/A'
    const count = item.paymentModeCount || 0

    //MPESA
    if (!grouped["MPESA"]) {
      grouped["MPESA"] = {}
    }
    grouped["MPESA"][month] = count.MPESA || 0

    //CARD
    if (!grouped["MASTERCARD"]) {
      grouped["MASTERCARD"] = {}
    }
    grouped["MASTERCARD"][month] = count["MASTERCARD"] || 0

    //BANK TRANSFER
    if (!grouped["TRANSFER"]) {
      grouped["TRANSFER"] = {}
    }
    grouped["TRANSFER"][month] = count["BANK TRANSFER"] || 0

    //DEPOSIT
    if (!grouped["DEPOSIT"]) {
      grouped["DEPOSIT"] = {}
    }
    grouped["DEPOSIT"][month] = count["DEPOSIT"] || 0

    //VISA
    if (!grouped["VISA"]) {
      grouped["VISA"] = {}
    }
    grouped["VISA"][month] = count["VISA CARD"] || 0

    //CASH
    if (!grouped["CASH"]) {
      grouped["CASH"] = {}
    }
    grouped["CASH"][month] = count["CASH"] || 0
    monthsSet.add(month)
  })

  // Convert months set to sorted array
  const months = Array.from(monthsSet)

  // Create series data for each payment mode
  const result = {}
  Object.keys(grouped).forEach(mode => {
    result[mode] = {
      months: months,
      counts: months.map(month => grouped[mode][month] || 0),
    }
  })

  return result
})

// Get payment mode icon
const getPaymentModeIcon = paymentMode => {
  const mode = paymentMode?.toUpperCase() || ''
  if (mode.includes('CARD') || mode.includes('VISA') || mode.includes('MASTERCARD')) {
    return 'tabler-credit-card'
  }
  if (mode.includes('BANK') || mode.includes('TRANSFER')) {
    return 'tabler-building-bank'
  }
  if (mode.includes('MOBILE') || mode.includes('MPESA') || mode.includes('MTN')) {
    return 'tabler-device-mobile'
  }
  if (mode.includes('CASH')) {
    return 'tabler-cash'
  }

  return 'tabler-wallet'
}

const chartConfigs = computed(() => {
  const currentTheme = vuetifyTheme.current.value.colors
  const variableTheme = vuetifyTheme.current.value.variables
  const labelPrimaryColor = `rgba(${ hexToRgb(currentTheme.primary) },${ variableTheme['dragged-opacity'] })`
  const legendColor = `rgba(${ hexToRgb(currentTheme['on-background']) },${ variableTheme['high-emphasis-opacity'] })`
  const borderColor = `rgba(${ hexToRgb(String(variableTheme['border-color'])) },${ variableTheme['border-opacity'] })`
  const labelColor = `rgba(${ hexToRgb(currentTheme['on-surface']) },${ variableTheme['disabled-opacity'] })`

  // Generate chart configs from backend data
  const configs = []
  const paymentModes = Object.keys(transformedData.value)

  if (paymentModes.length === 0) {
    // Return empty array if no data
    return []
  }

  paymentModes.forEach((mode, modeIndex) => {
    const modeData = transformedData.value[mode]
    const months = modeData.months
    const counts = modeData.counts
    const maxCount = Math.max(...counts, 1)
    const yAxisMax = Math.ceil(maxCount * 1.2 / 10) * 10 // Round up to nearest 10

    // Generate colors array with highlight on different positions for variety
    const highlightIndex = modeIndex % months.length
    const colors = months.map((_, idx) =>
      idx === highlightIndex
        ? `rgba(${ hexToRgb(currentTheme.primary) }, 1)`
        : labelPrimaryColor,
    )

    configs.push({
      title: mode,
      icon: getPaymentModeIcon(mode),
      chartOptions: {
        chart: {
          parentHeightOffset: 0,
          type: 'bar',
          toolbar: { show: false },
        },
        plotOptions: {
          bar: {
            columnWidth: '32%',
            borderRadiusApplication: 'end',
            borderRadius: 4,
            distributed: true,
            dataLabels: { position: 'top' },
          },
        },
        grid: {
          show: false,
          padding: {
            top: 0,
            bottom: 0,
            left: -10,
            right: -10,
          },
        },
        colors: colors,
        dataLabels: {
          enabled: true,
          formatter(val) {
            return val > 0 ? `${ val }` : '0'
          },
          offsetY: -25,
          style: {
            fontSize: '15px',
            colors: [legendColor],
            fontWeight: '600',
            fontFamily: 'Public Sans',
          },
        },
        legend: { show: false },
        tooltip: {
          enabled: true,
          y: {
            formatter(val) {
              return `${ val } transactions`
            },
          },
        },
        xaxis: {
          categories: months,
          axisBorder: {
            show: true,
            color: borderColor,
          },
          axisTicks: { show: false },
          labels: {
            style: {
              colors: labelColor,
              fontSize: '13px',
              fontFamily: 'Public Sans',
            },
          },
        },
        yaxis: {
          labels: {
            offsetX: -15,
            formatter(val) {
              return val > 0 ? `${ Math.round(val) }` : '0'
            },
            style: {
              fontSize: '13px',
              colors: labelColor,
              fontFamily: 'Public Sans',
            },
          },
          min: 0,
          max: yAxisMax,
          tickAmount: 6,
        },
        responsive: [
          {
            breakpoint: 1441,
            options: { plotOptions: { bar: { columnWidth: '41%' } } },
          },
          {
            breakpoint: 590,
            options: {
              plotOptions: { bar: { columnWidth: '61%' } },
              yaxis: { labels: { show: false } },
              grid: {
                padding: {
                  right: 0,
                  left: -20,
                },
              },
              dataLabels: {
                style: {
                  fontSize: '12px',
                  fontWeight: '400',
                },
              },
            },
          },
        ],
      },
      series: [{
        data: counts,
      }],
    })
  })

  return configs
})

const moreList = [
  {
    title: 'View More',
    value: 'View More',
  },
  {
    title: 'Delete',
    value: 'Delete',
  },
]
</script>

<template>
  <VCard
    title="Earning Reports"
    subtitle="Transaction Overview by Payment Mode"
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
      <div v-if="chartConfigs.length === 0" class="pa-10 text-center">
        <VIcon
          icon="tabler-chart-bar-off"
          size="48"
          color="disabled"
          class="mb-4"
        />
        <p class="text-body-1 text-medium-emphasis">
          No earning reports data available
        </p>
        <p class="text-sm text-disabled">
          Transaction data will appear here once payment activities are recorded
        </p>
      </div>

      <template v-else>
        <VSlideGroup
          v-model="currentTab"
          show-arrows
          mandatory
          class="mb-10"
        >
          <VSlideGroupItem
            v-for="(report, index) in chartConfigs"
            :key="report.title"
            v-slot="{ isSelected, toggle }"
            :value="index"
          >
            <div
              style="block-size: 100px; inline-size: 110px;"
              :style="isSelected ? 'border-color:rgb(var(--v-theme-primary)) !important' : ''"
              :class="isSelected ? 'border' : 'border border-dashed'"
              class="d-flex flex-column justify-center align-center cursor-pointer rounded py-4 px-5 me-4"
              @click="toggle"
            >
              <VAvatar
                rounded
                size="38"
                :color="isSelected ? 'primary' : ''"
                variant="tonal"
                class="mb-2"
              >
                <VIcon
                  size="22"
                  :icon="report.icon"
                />
              </VAvatar>
              <h6 class="text-base font-weight-medium mb-0">
                {{ report.title }}
              </h6>
            </div>
          </VSlideGroupItem>
        </VSlideGroup>

        <VueApexCharts
          ref="refVueApexChart"
          :key="currentTab"
          :options="chartConfigs[Number(currentTab)].chartOptions"
          :series="chartConfigs[Number(currentTab)].series"
          height="230"
          class="mt-3"
        />
      </template>
    </VCardText>
  </VCard>
</template>
