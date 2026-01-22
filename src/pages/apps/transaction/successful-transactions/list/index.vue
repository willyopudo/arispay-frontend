<script setup>
import { useI18n } from 'vue-i18n'
import DateRangePicker from '@core/components/app-form-elements/DateRangepicker.vue'

const { t } = useI18n()

// 👉 Store
const searchQuery = ref('')
const selectedRole = ref()
const selectedPlan = ref()
const selectedBank = ref()
const selectedAccount = ref()
const selectedCrDr = ref()

//Date range
const dateRange = ref('')

// Data table options
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()
const selectedRows = ref([])

//dialogs
const isTransactionViewDialogVisible = ref(false)
// State for modal and selected user
const selectedTransaction = ref(null);
const todo = ref(null);

// Open modal with user details
const openModal = (transaction) => {
  selectedTransaction.value = transaction;
  isTransactionViewDialogVisible.value = true;
};


//Users stats
const fetchedTransactions = ref(null)
const totalFetchedTransactions = ref(0)

//Select options
const bankList = ref([])
const accountList = ref([])

const transactionSummary = ref({
  first: 0,
  second: 0,
  third: 0,
  fourth: 0,
})

const updateOptions = options => {
  page.value = options.page
  itemsPerPage.value = options.itemsPerPage
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order

  fetchSuccessTransactions()
}

// Headers
const headers = computed(() => [
  {
    title: t('Reference'),
    key: 'reference',
  },
  {
    title: t('Date'),
    key: 'transactionDate',
  },
  {
    title: t('Bank'),
    key: 'bank',
  },
  {
    title: t('Amount'),
    key: 'amount',
  },
  {
    title: t('Account'),
    key: 'account',
  },
  {
    title: t('Client ID'),
    key: 'clientId',
  },
  {
    title: t('Trans Type'),
    key: 'transType',
  },
  {
    title: t('Actions'),
    key: 'actions',
    sortable: false,
  },
])

// await fetchUsers()

// 👉 search filters
const roles = computed(() => [
  {
    title: t('Company Admin'),
    value: 'ROLE_COMPANY_ADMIN',
  },
  {
    title: t('Company User'),
    value: 'ROLE_COMPANY_USER',
  },
  {
    title: t('Super Admin'),
    value: 'ROLE_ADMIN',
  }
])

const status = computed(() => [
  {
    title: t('Pending'),
    value: 'pending',
  },
  {
    title: t('Active'),
    value: 'active',
  },
  {
    title: t('Inactive'),
    value: 'inactive',
  },
])

const resolveUserRoleVariant = role => {
  const roleLowerCase = role.toLowerCase()
  if (roleLowerCase === 'role_user')
    return {
      color: 'success',
      icon: 'tabler-user',
    }
  if (roleLowerCase === 'role_company_user')
    return {
      color: 'success',
      icon: 'tabler-user',
    }
  if (roleLowerCase === 'role_admin')
    return {
      color: 'error',
      icon: 'tabler-device-desktop',
    }
  if (roleLowerCase === 'role_company_admin')
    return {
      color: 'error',
      icon: 'tabler-device-desktop',
    }
  if (roleLowerCase === 'superadmin')
    return {
      color: 'info',
      icon: 'tabler-chart-pie',
    }

}

const resolveCrDrVariant = stat => {
  const statLowerCase = stat.toLowerCase()
  if (statLowerCase === 'c')
    return 'primary'
  if (statLowerCase === 'd')
    return 'secondary'

  return 'primary'
}

//const isAddNewUserDrawerVisible = ref(false)

// const formattedDateRange = computed(() => {
//   if (!dateRange.value) return ''
//   return dateRange.value
//     .split(' to ')
//     .map(date => date.trim())
//     .join(',')
// })

const formattedDateRange = computed(() => {
  if (!dateRange.value || !dateRange.value.startDate || !dateRange.value.endDate) return null
  
  return `${dateRange.value.startDate},${dateRange.value.endDate}`
})

async function fetchSuccessTransactions() {
  try {
    const {
      data: transactionsList,
      error,
      response
    } = await axiosApiCall('/transactions', {
      params: {
        page: page.value,
        itemsPerPage: itemsPerPage.value,
        sortBy: sortBy.value,
        orderBy: orderBy.value,
        search: searchQuery.value,
        dateRange: formattedDateRange.value, // This will now send as "2025-06-01, 2025-06-03"
        bank: selectedBank.value,
        account: selectedAccount.value,
        crDrInd: selectedCrDr.value
      }
    })
    if (error) {
      useSweetAlert.errorMessage(t('Error fetching transactions') + ': ' + error.message)
      return
    }

    fetchedTransactions.value = transactionsList.value0.content
    totalFetchedTransactions.value = transactionsList.value0.totalElements
    transactionSummary.value = transactionsList.value2
    bankList.value = transactionsList?.value1[0] || []
    accountList.value = transactionsList?.value1[1] || []

    widgetData.value[0].value = numberFormatter(transactionSummary.value.first)
    widgetData.value[1].value = numberFormatter(transactionSummary.value.second)
    widgetData.value[2].value = numberFormatter(transactionSummary.value.third, true)
    widgetData.value[3].value = numberFormatter(transactionSummary.value.fourth, true)

    useSweetAlert.toast(t("Transactions fetched successfully"));

  } catch (error) {
    console.error(error)
  }
}
const transactions = computed(() => fetchedTransactions.value || []);
const totalTransactions = computed(() => totalFetchedTransactions.value);

const numberFormatter = (value, hasDp = false) => {
  if (hasDp) {
    return Number(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }
  return Number(value).toLocaleString();
}
const widgetData = ref([
  {
    title: 'Number of Collections',
    value: transactionSummary.value.first,
    change: 2.1,
    desc: 'Number of Collections',
    icon: 'tabler-credit-card-refund',
    iconColor: 'primary',
  },
  {
    title: 'Number of Disbursements',
    value: transactionSummary.value.second,
    change: 18,
    desc: 'Number of Disbursements',
    icon: 'tabler-credit-card-pay',
    iconColor: 'success',
  },
  {
    title: 'Total Collections',
    value: transactionSummary.value.third,
    change: -14,
    desc: 'Total Collections',
    icon: 'tabler-coin',
    iconColor: 'error',
  },
  {
    title: 'Total Disbursements',
    value: transactionSummary.value.fourth,
    change: 42,
    desc: 'Total Disbursements',
    icon: 'tabler-coin-off',
    iconColor: 'warning',
  },
])


</script>

<template>
  <section>
    <!-- 👉 Widgets -->
    <div class="d-flex mb-6">
      <VRow>
        <template v-for="(data, id) in widgetData" :key="id">
          <VCol cols="12" md="3" sm="6">
            <VCard>
              <VCardText>
                <div class="d-flex justify-space-between">
                  <div class="d-flex flex-column gap-y-1">
                    <div class="text-body-1 text-high-emphasis">
                      {{ $t(data.title) }}
                    </div>
                    <div class="d-flex gap-x-2 align-center">
                      <h4 class="text-h4">
                        {{ data.value }}
                      </h4>
                      <div class="text-base" :class="data.change > 0 ? 'text-success' : 'text-error'">
                        ({{ prefixWithPlus(data.change) }}%)
                      </div>
                    </div>
                    <div class="text-sm">
                      {{ $t(data.desc) }}
                    </div>
                  </div>
                  <VAvatar :color="data.iconColor" variant="tonal" rounded size="42">
                    <VIcon :icon="data.icon" size="26" />
                  </VAvatar>
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </template>
      </VRow>
    </div>

    <VCard class="mb-6">
      <VCardItem class="pb-4">
        <VCardTitle>{{ $t('Filters') }}</VCardTitle>
      </VCardItem>

      <VCardText>
        <VRow>
          <!-- 👉 Date Range Picker -->
          <VCol cols="12" md="3">
            <DateRangePicker v-model="dateRange" :placeholder="$t('Select Date Range')" />
          </VCol>

          <!-- 👉 Select Bank -->
          <VCol cols="12" md="3">
            <AppSelect
              v-model="selectedBank"
              :placeholder="$t('Select Bank')"
              :items="bankList"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>

          <!-- 👉 Select Account -->
          <VCol cols="12" md="3">
            <AppSelect
              v-model="selectedAccount"
              :placeholder="$t('Select Account')"
              :items="accountList"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>

          <!-- 👉 Select Cr/Dr -->
          <VCol cols="12" md="2">
            <AppSelect
              v-model="selectedCrDr"
              :placeholder="$t('Select CR/DR')"
              :items="[
                { title: $t('Credit'), value: 'C' },
                { title: $t('Debit'), value: 'D' }
              ]"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>

          <!-- 👉 Filter Button -->
          <VCol cols="12" md="1" class="d-flex align-center">
            <VBtn @click="fetchSuccessTransactions">
              {{ $t('Filter') }}
              <VIcon end icon="tabler-filter" />
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

      <VCardText class="d-flex flex-wrap gap-4">
        <div class="me-3 d-flex gap-3">
          <AppSelect :model-value="itemsPerPage" :items="[
            { value: 5, title: $t('5') },
            { value: 10, title: $t('10') },
            { value: 25, title: $t('25') },
            { value: 50, title: $t('50') },
            { value: 100, title: $t('100') },
            { value: -1, title: $t('All') },
          ]" style="inline-size: 6.25rem;" @update:model-value="itemsPerPage = parseInt($event, 10)" />
        </div>
        <VSpacer />

        <div class="app-user-search-filter d-flex align-center flex-wrap gap-4">
          <!-- 👉 Search  -->
          <div style="inline-size: 15.625rem;">
            <AppTextField v-model="searchQuery" :placeholder="$t('Search Transactions')" @keyup.enter="fetchSuccessTransactions"/>
          </div>

          <!-- 👉 Export button -->
          <VBtn variant="tonal" color="secondary" prepend-icon="tabler-upload">
            {{ $t('Export') }}
          </VBtn>
        </div>
      </VCardText>

      <VDivider />

      <!-- SECTION datatable -->
      <VDataTableServer v-model:items-per-page="itemsPerPage" v-model:model-value="selectedRows" v-model:page="page"
        :items="transactions" item-value="id" :items-length="totalTransactions" :headers="headers" class="text-no-wrap"
        show-select @update:options="updateOptions">
        <!-- Account -->
        <template #item.reference="{ item }">
          <div class="d-flex align-center gap-x-4">
            <div class="d-flex flex-column">
              <h6 class="text-base">
                <RouterLink :to="{ name: 'apps-user-view-id', params: { id: item.id } }"
                  class="font-weight-medium text-link">
                  {{ item.bankTranRef }}
                </RouterLink>
              </h6>
              
            </div>
          </div>
        </template>

        <!-- 👉 Transaction Reference -->
        <template #item.transactionDate="{ item }">
          <div class="d-flex align-center gap-x-2">
            <div class="text-capitalize text-high-emphasis text-body-1">
              {{ formatDate(item.transDate)}}
            </div>
          </div>
        </template>



        <!-- Bank -->
        <template #item.bank="{ item }">
          <div class="text-body-1 text-high-emphasis text-capitalize">
            {{ item.bank }}
          </div>
        </template>

        <!-- 👉 Amount -->
        <template #item.amount="{ item }">
          <div class="d-flex align-center justify-end w-100">
            <div class="text-capitalize text-high-emphasis text-body-1">
              {{ Number(item.tranAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              }}
            </div>
          </div>
        </template>

        <!-- Account -->
        <template #item.account="{ item }">
          <div class="text-body-1 text-high-emphasis text-capitalize">
            {{ item.bankAccount }}
          </div>
        </template>

        <!-- Client ID -->
        <template #item.clientId="{ item }">
          <div class="text-body-1 text-high-emphasis text-capitalize">
            {{ item.client }}
          </div>
        </template>

        <!-- Status -->
        <template #item.transType="{ item }">
          <VChip :color="resolveCrDrVariant(item.crDrInd)" size="small" label class="text-capitalize">
            {{ item.crDrInd }}
          </VChip>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">

          <IconBtn @click="openModal(item)">
            <VIcon icon="tabler-eye" />
          </IconBtn>
        </template>

        <!-- pagination -->
        <template #bottom>
          <TablePagination v-model:page="page" :items-per-page="itemsPerPage" :total-items="totalTransactions" />
        </template>
      </VDataTableServer>
      <TransactionViewDialog  v-if="isTransactionViewDialogVisible"
        v-model:isDialogVisible="isTransactionViewDialogVisible" :trans-data="selectedTransaction" />
      <!-- SECTION -->
    </VCard>
  </section>
</template>
