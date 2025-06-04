<script setup>
// 👉 Store
const searchQuery = ref('')
const selectedRole = ref()
const selectedPlan = ref()
const selectedBank = ref()

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
const bankList = ref([])

const transactionSummary = ref({
  total: 0,
  active: 0,
  inactive: 0,
  pending: 0,
})

const updateOptions = options => {
  page.value = options.page
  itemsPerPage.value = options.itemsPerPage
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order

  fetchSuccessTransactions()
}

// Headers
const headers = [
  {
    title: 'Reference',
    key: 'reference',
  },
  {
    title: 'Date',
    key: 'transactionDate',
  },
  {
    title: 'Bank',
    key: 'bank',
  },
  {
    title: 'Amount',
    key: 'amount',
  },
  {
    title: 'Account',
    key: 'account',
  },
  {
    title: 'Client ID',
    key: 'clientId',
  },
  {
    title: 'Trans Type',
    key: 'transType',
  },
  {
    title: 'Actions',
    key: 'actions',
    sortable: false,
  },
]

// await fetchUsers()

// 👉 search filters
const roles = [
  {
    title: 'Company Admin',
    value: 'ROLE_COMPANY_ADMIN',
  },
  {
    title: 'Company User',
    value: 'ROLE_COMPANY_USER',
  },
  {
    title: 'Super Admin',
    value: 'ROLE_ADMIN',
  }
]

const status = [
  {
    title: 'Pending',
    value: 'pending',
  },
  {
    title: 'Active',
    value: 'active',
  },
  {
    title: 'Inactive',
    value: 'inactive',
  },
]

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

const formattedDateRange = computed(() => {
  if (!dateRange.value) return ''
  return dateRange.value
    .split(' to ')
    .map(date => date.trim())
    .join(',')
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
      }
    })
    if (error) {
      useSweetAlert.errorMessage('Error fetching transactions: ' + error.message)
      return
    }

    fetchedTransactions.value = transactionsList.value0.content
    totalFetchedTransactions.value = transactionsList.value0.totalElements
    //transactionSummary.value = transactionsList.value2
    bankList.value = transactionsList.value1

    // widgetData.value[0].value = transactionSummary.value.total
    // widgetData.value[1].value = transactionSummary.value.active
    // widgetData.value[2].value = transactionSummary.value.inactive
    // widgetData.value[3].value = transactionSummary.value.pending

    useSweetAlert.toast("Transactions fetched successfully");

  } catch (error) {
    console.error(error)
  }
}
const transactions = computed(() => fetchedTransactions.value || []);
const totalTransactions = computed(() => totalFetchedTransactions.value);

const widgetData = ref([
  {
    title: 'Transactions',
    value: transactionSummary.value.total,
    change: 2.1,
    desc: 'Total Transactions',
    icon: 'tabler-users',
    iconColor: 'primary',
  },
  {
    title: 'Active Transactions',
    value: transactionSummary.value.active,
    change: 18,
    desc: 'Active Transactions',
    icon: 'tabler-user-check',
    iconColor: 'success',
  },
  {
    title: 'Inactive Transactions',
    value: transactionSummary.value.inactive,
    change: -14,
    desc: 'Non-Active Transactions',
    icon: 'tabler-user-plus',
    iconColor: 'error',
  },
  {
    title: 'Dormant Transactions',
    value: transactionSummary.value.pending,
    change: 42,
    desc: 'Dormant Transactions',
    icon: 'tabler-user-search',
    iconColor: 'warning',
  },
])


// Watch for changes in searchQuery and fetch users if length is more than 3
watch(searchQuery, (newQuery) => {
  if (newQuery.length > 2 || newQuery.length === 0) {
    fetchSuccessTransactions()
  }
});
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
                      {{ data.title }}
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
                      {{ data.desc }}
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
        <VCardTitle>Filters</VCardTitle>
      </VCardItem>

      <VCardText>
        <VRow>
          <!-- 👉 Select Bank -->
          <VCol cols="12" md="4">
            <AppSelect 
              v-model="selectedBank" 
              placeholder="Select Bank" 
              :items="bankList" 
              clearable
              clear-icon="tabler-x" 
            />
          </VCol>

          <!-- 👉 Date Range Picker -->
          <VCol cols="12" md="4">
            <AppDateTimePicker
              v-model="dateRange"         
              placeholder="Select Date Range"
              :config="{ mode: 'range', enableTime: true, dateFormat: 'Y-m-d H:i:ss', time_24hr: true }"
            />
          </VCol>

          <!-- 👉 Filter Button -->
          <VCol cols="12" md="4" class="d-flex align-center">
            <VBtn @click="fetchSuccessTransactions">
              Filter
              <VIcon end icon="tabler-filter" />
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

      <VCardText class="d-flex flex-wrap gap-4">
        <div class="me-3 d-flex gap-3">
          <AppSelect :model-value="itemsPerPage" :items="[
            { value: 5, title: '5' },
            { value: 10, title: '10' },
            { value: 25, title: '25' },
            { value: 50, title: '50' },
            { value: 100, title: '100' },
            { value: -1, title: 'All' },
          ]" style="inline-size: 6.25rem;" @update:model-value="itemsPerPage = parseInt($event, 10)" />
        </div>
        <VSpacer />

        <div class="app-user-search-filter d-flex align-center flex-wrap gap-4">
          <!-- 👉 Search  -->
          <div style="inline-size: 15.625rem;">
            <AppTextField v-model="searchQuery" placeholder="Search User" />
          </div>

          <!-- 👉 Export button -->
          <VBtn variant="tonal" color="secondary" prepend-icon="tabler-upload">
            Export
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
