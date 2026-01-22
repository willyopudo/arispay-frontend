<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  transactions: {
    type: Array,
    default: () => [],
  },
})

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

const getPaymentModeColor = paymentMode => {
  const mode = paymentMode?.toUpperCase() || ''
  if (mode.includes('CARD')) return 'primary'
  if (mode.includes('BANK')) return 'info'
  if (mode.includes('MOBILE')) return 'success'
  if (mode.includes('CASH')) return 'warning'

  return 'secondary'
}

const formatDate = dateString => {
  if (!dateString) return t('N/A')

  const date = new Date(dateString)
  const options = { year: 'numeric', month: 'short', day: 'numeric' }

  return date.toLocaleDateString('en-US', options)
}

const formatAmount = amount => {
  if (!amount && amount !== 0) return 'KES 0.00'

  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
  }).format(amount)
}

const resolveTransactionType = crDrIndicator => {
  if (crDrIndicator === 'Credit') return { label: t('Credit'), color: 'success' }
  if (crDrIndicator === 'Debit') return { label: t('Debit'), color: 'error' }

  return { label: t('Unknown'), color: 'secondary' }
}

const displayTransactions = computed(() => {
  return props.transactions.map(txn => ({
    paymentMode: txn.paymentMode || t('Unknown'),
    icon: getPaymentModeIcon(txn.paymentMode),
    iconColor: getPaymentModeColor(txn.paymentMode),
    bankName: txn.bankName || t('N/A'),
    clientName: txn.clientName || t('N/A'),
    date: formatDate(txn.transDate),
    type: resolveTransactionType(txn.crDrIndicator),
    amount: formatAmount(txn.tranAmount),
    isCredit: txn.crDrIndicator === 'Credit',
  }))
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

const getPaddingStyle = index => index ? 'padding-block-end: 1.25rem;' : 'padding-block: 1.25rem;'
</script>

<template>
  <VCard :title="$t('Latest Transactions')">
    <template #append>
      <div class="me-n2">
        <MoreBtn
          size="small"
          :menu-list="moreList"
        />
      </div>
    </template>

    <VDivider />

    <div v-if="displayTransactions.length === 0" class="pa-10 text-center">
      <VIcon
        icon="tabler-receipt-off"
        size="48"
        color="disabled"
        class="mb-4"
      />
      <p class="text-body-1 text-medium-emphasis">
        {{ $t('No recent transactions') }}
      </p>
    </div>

    <VTable v-else class="text-no-wrap transaction-table">
      <thead>
        <tr>
          <th>{{ $t('PAYMENT METHOD') }}</th>
          <th>{{ $t('BANK') }}</th>
          <th>{{ $t('DATE') }}</th>
          <th>{{ $t('TYPE') }}</th>
          <th class="text-end">
            {{ $t('AMOUNT') }}
          </th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(transaction, index) in displayTransactions"
          :key="index"
        >
          <td
            :style="getPaddingStyle(index)"
            style="padding-inline-end: 1.5rem;"
          >
            <div class="d-flex align-center">
              <VAvatar
                :color="transaction.iconColor"
                variant="tonal"
                size="40"
                class="me-3"
              >
                <VIcon
                  :icon="transaction.icon"
                  size="24"
                />
              </VAvatar>
              <div>
                <p class="text-base mb-0 text-high-emphasis font-weight-medium">
                  {{ transaction.paymentMode }}
                </p>
                <p class="text-sm mb-0 text-medium-emphasis">
                  {{ transaction.clientName }}
                </p>
              </div>
            </div>
          </td>
          <td
            :style="getPaddingStyle(index)"
            style="padding-inline-end: 1.5rem;"
          >
            <p class="text-base mb-0 text-medium-emphasis">
              {{ transaction.bankName }}
            </p>
          </td>
          <td
            :style="getPaddingStyle(index)"
            style="padding-inline-end: 1.5rem;"
          >
            <p class="text-base mb-0">
              {{ transaction.date }}
            </p>
          </td>
          <td
            :style="getPaddingStyle(index)"
            style="padding-inline-end: 1.5rem;"
          >
            <VChip
              label
              :color="transaction.type.color"
              size="small"
            >
              {{ transaction.type.label }}
            </VChip>
          </td>
          <td
            :style="getPaddingStyle(index)"
            style="padding-inline-end: 1.5rem;"
            class="text-end"
          >
            <div
              class="text-base font-weight-medium"
              :class="transaction.isCredit ? 'text-success' : 'text-error'"
            >
              {{ transaction.isCredit ? '+' : '-' }}{{ transaction.amount }}
            </div>
          </td>
        </tr>
      </tbody>
    </VTable>
  </VCard>
</template>

<style lang="scss">
.transaction-table {
  &.v-table .v-table__wrapper > table > tbody > tr:not(:last-child) > td,
  &.v-table .v-table__wrapper > table > tbody > tr:not(:last-child) > th {
    border-block-end: none !important;
  }
}
</style>
