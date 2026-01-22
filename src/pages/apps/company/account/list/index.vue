<script setup>
import { useI18n } from 'vue-i18n'
import CompanyAccountInfoEditDialog from '@/components/dialogs/CompanyAccountInfoEditDialog.vue'
import AddNewCompanyAccountDrawer from '@/views/apps/user/list/AddNewCompanyAccountDrawer.vue'

const { t } = useI18n()

// 👉 Store
const searchQuery = ref('')
const selectedStatus = ref()

// Data table options
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()
const selectedRows = ref([])

//dialogs
const isCompanyAccountInfoEditDialogVisible = ref(false)
// State for modal and selected user
const selectedAccount = ref(null);
const todo = ref(null);

// Open modal with user details
const openModal = (companyAccount, action) => {
  selectedAccount.value = companyAccount;
  isCompanyAccountInfoEditDialogVisible.value = true;
  todo.value = action;
};


//Users stats
const fetchedAccounts = ref(null)
const totalFetchedAccounts = ref(0)
const bankList = ref([])

const companyAccountSummary = ref({
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

  fetchCompanyAccounts()
}

// Headers
const headers = computed(() => [
  {
    title: t('Account'),
    key: 'accountName',
  },
  {
    title: t('Company'),
    key: 'companyName',
  },
  {
    title: t('Bank'),
    key: 'bank',
  },
  {
    title: t('Currency'),
    key: 'currency',
  },
  {
    title: t('Balance'),
    key: 'balance',
  },
  {
    title: t('Status'),
    key: 'status',
  },
  {
    title: t('Actions'),
    key: 'actions',
    sortable: false,
  },
])

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

const plans = [
  {
    title: 'Basic',
    value: 'basic',
  },
  {
    title: 'Standard',
    value: 'standard',
  },
  {
    title: 'Enterprise',
    value: 'enterprise',
  },
  {
    title: 'Special',
    value: 'special',
  },
]

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

const resolveUserStatusVariant = stat => {
  const statLowerCase = stat.toLowerCase()
  if (statLowerCase === 'pending')
    return 'warning'
  if (statLowerCase === 'active')
    return 'success'
  if (statLowerCase === 'inactive')
    return 'secondary'
  
  return 'primary'
}

const isAddNewUserDrawerVisible = ref(false)

async function fetchCompanyAccounts(){
  try {
    const {
      data: accountsList,
      error,
      response
    } = await axiosApiCall('/company/accounts', {
      params: {
        page: page.value,
        itemsPerPage: itemsPerPage.value,
        sortBy: sortBy.value,
        orderBy: orderBy.value,
        search: searchQuery.value,
        // role: selectedRole.value,
        // plan: selectedPlan.value,
        status: selectedStatus.value,
      }
    })
    if (error) {
      useSweetAlert.errorMessage(t('Error fetching company accounts') + ': ' + error.message)
      return
    }

    fetchedAccounts.value = accountsList.value0.content
    totalFetchedAccounts.value = accountsList.value0.totalElements
    companyAccountSummary.value = accountsList.value2
    bankList.value = accountsList.value1

    useSweetAlert.toast(t("Company accounts fetched successfully"));

  } catch (error) {
    console.error(error)
  }
}
const accounts = computed(() => fetchedAccounts.value || []);
const totalAccounts = computed(() => totalFetchedAccounts.value);


const AddNewCompanyAccount = async companyAccountData => {
  
  try {
    const {
      data: cData,
      error,
      response
    } = await axiosApiCall('/company/accounts', {  
      data: companyAccountData,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (error) {
      useSweetAlert.errorMessage(t('Error during company account creation') + ': ' + error.message)
      return
    }

    fetchCompanyAccounts()
    useSweetAlert.toast(t("Company Account created successfully"));
 
  } catch (error) {
    console.error(error)
  }
}

const updateCompanyAccount = async companyAccountData => {
  console.log(JSON.stringify(companyAccountData))
  await customUseApi(`/company/accounts/${companyAccountData.id}`, {
    method: 'PUT',
    body: JSON.stringify(companyAccountData),
    headers: {"Content-Type": 'application/json'}
  })

  // Refetch User
  fetchCompanyAccounts()
}

const deleteCompanyAccount = async id => {
  const canDelete = await useSweetAlert.confirm()
  if (!canDelete) return
  try {
    const {
      data,
      error,
      resp: status
    } = await axiosApiCall(`/company/accounts/${id}`, {
    method: 'DELETE',
  
    })
    
    if (error && error.response) {
      useSweetAlert.errorMessage(t('An error occurred') + ': ' + error.response.data.message)
      return
    }

    useSweetAlert.successMessage(t('Company account deleted successfully'))

    // Refetch User
    setTimeout(fetchCompanyAccounts, 3000);

  } catch (error) {
    console.error(error)
    useSweetAlert.errorMessage(t('An error occurred while deleting company account'))
  }
  // Delete from selectedRows
  const index = selectedRows.value.findIndex(row => row === id)
  if (index !== -1)
    selectedRows.value.splice(index, 1)
}

const widgetData = computed(() => [
  {
    title: t('Accounts'),
    value: companyAccountSummary.value.first,
    change: 2.1,
    desc: t('Total Accounts'),
    icon: 'tabler-users',
    iconColor: 'primary',
  },
  {
    title: t('Active Accounts'),
    value: companyAccountSummary.value.second,
    change: 18,
    desc: t('Active Accounts'),
    icon: 'tabler-user-check',
    iconColor: 'success',
  },
  {
    title: t('Inactive Accounts'),
    value: companyAccountSummary.value.third,
    change: -14,
    desc: t('Non-Active Accounts'),
    icon: 'tabler-user-plus',
    iconColor: 'error',
  },
  {
    title: t('Dormant Accounts'),
    value: companyAccountSummary.value.fourth,
    change: 42,
    desc: t('Dormant Accounts'),
    icon: 'tabler-user-search',
    iconColor: 'warning',
  },
])
const handleDataFromCompanyAccountInfoEditDialog = (data) => {
  updateCompanyAccount(data)
}

// Watch for changes in searchQuery and fetch users if length is more than 3
watch(searchQuery, (newQuery) => {
  if (newQuery.length > 2|| newQuery.length === 0) {
    fetchCompanyAccounts()
  }
});
</script>

<template>
  <section>
    <!-- 👉 Widgets -->
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
                      {{ data.title }}
                    </div>
                    <div class="d-flex gap-x-2 align-center">
                      <h4 class="text-h4">
                        {{ data.value }}
                      </h4>
                      <div
                        class="text-base"
                        :class="data.change > 0 ? 'text-success' : 'text-error'"
                      >
                        ({{ prefixWithPlus(data.change) }}%)
                      </div>
                    </div>
                    <div class="text-sm">
                      {{ data.desc }}
                    </div>
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

    <VCard class="mb-6">
      <VCardItem class="pb-4">
        <VCardTitle>{{ $t('Filters') }}</VCardTitle>
      </VCardItem>

      <VCardText>
        <VRow>

          <!-- 👉 Select Status -->
          <VCol cols="12" sm="4">
  <div class="d-flex align-center">
    <AppSelect
      v-model="selectedStatus"
      :placeholder="$t('Select Status')"
      :items="status"
      clearable
      clear-icon="tabler-x"
      class="flex-grow-1 mr-2"
    />
    <VBtn class="ml-4" @click="fetchCompanyAccounts">
      {{ $t('Filter') }}
      <VIcon end icon="tabler-filter" />
    </VBtn>
  </div>
</VCol>
          
        </VRow>
      </VCardText>

      <VDivider />

      <VCardText class="d-flex flex-wrap gap-4">
        <div class="me-3 d-flex gap-3">
          <AppSelect
            :model-value="itemsPerPage"
            :items="[
              { value: 5, title: $t('5') },
              { value: 10, title: $t('10') },
              { value: 25, title: $t('25') },
              { value: 50, title: $t('50') },
              { value: 100, title: $t('100') },
              { value: -1, title: $t('All') },
            ]"
            style="inline-size: 6.25rem;"
            @update:model-value="itemsPerPage = parseInt($event, 10)"
          />
        </div>
        <VSpacer />

        <div class="app-user-search-filter d-flex align-center flex-wrap gap-4">
          <!-- 👉 Search  -->
          <div style="inline-size: 15.625rem;">
            <AppTextField
              v-model="searchQuery"
              :placeholder="$t('Search Accounts')"
            />
          </div>

          <!-- 👉 Export button -->
          <VBtn
            variant="tonal"
            color="secondary"
            prepend-icon="tabler-upload"
          >
            {{ $t('Export') }}
          </VBtn>

          <!-- 👉 Add user button -->
          <VBtn
            prepend-icon="tabler-plus"
            @click="isAddNewUserDrawerVisible = true"
          >
            {{ $t('Add New Account') }}
          </VBtn>
        </div>
      </VCardText>

      <VDivider />

      <!-- SECTION datatable -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:model-value="selectedRows"
        v-model:page="page"
        :items="accounts"
        item-value="id"
        :items-length="totalAccounts"
        :headers="headers"
        class="text-no-wrap"
        show-select
        @update:options="updateOptions"
      >
        <!-- Account -->
        <template #item.accountName="{ item }">
          <div class="d-flex align-center gap-x-4">
            <div class="d-flex flex-column">
              <h6 class="text-base">
                <RouterLink
                  :to="{ name: 'apps-user-view-id', params: { id: item.id } }"
                  class="font-weight-medium text-link"
                >
                {{ item.accountNumber }} 
                </RouterLink>
              </h6>
              <div class="text-sm">
                {{ item.accountName }}
              </div>
            </div>
          </div>
        </template>

        <!-- 👉 Company -->
        <template #item.company="{ item }">
          <div class="d-flex align-center gap-x-2">
            <div class="text-capitalize text-high-emphasis text-body-1">
              {{ item.companyName }}
            </div>
          </div>
        </template>

        

        <!-- Bank -->
        <template #item.bank="{ item }">
          <div class="text-body-1 text-high-emphasis text-capitalize">
            {{ item.bankCode }} {{ item.bankName }}
          </div>
        </template>

        <!-- Currency -->
        <template #item.currency="{ item }">
          <div class="text-body-1 text-high-emphasis text-capitalize">
            {{ item.currency }} 
          </div>
        </template>

        <!-- 👉 Balance -->
        <template #item.balance="{ item }">
          <div class="d-flex align-center justify-end w-100">
            <div class="text-capitalize text-high-emphasis text-body-1">
              {{ Number(item.balance).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}
            </div>
          </div>
        </template>

        <!-- Status -->
        <template #item.status="{ item }">
          <VChip
            :color="resolveUserStatusVariant(item.status)"
            size="small"
            label
            class="text-capitalize"
          >
            {{ item.status }}
          </VChip>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">

          <IconBtn @click="openModal(item, 'view')">
            <VIcon icon="tabler-eye" />
          </IconBtn>

          <!-- 👉 Edit user info dialog -->
        <!-- <UserInfoEditDialog 
          v-model:isDialogVisible="isUserInfoEditDialogVisible"
          :user-data="users.find(obj => obj.id === item.id)"
        /> -->

          <IconBtn  @click="openModal(item, 'edit')">
            <VIcon icon="tabler-pencil" />
          </IconBtn>

          <IconBtn @click="deleteCompanyAccount(item.id)">
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>

        <!-- pagination -->
        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalAccounts"
          />
        </template>
      </VDataTableServer>
      <CompanyAccountInfoEditDialog @submit="handleDataFromCompanyAccountInfoEditDialog" v-if="isCompanyAccountInfoEditDialogVisible" v-model:isDialogVisible="isCompanyAccountInfoEditDialogVisible" :company-account-data="selectedAccount" :action="todo" :banks="bankList"/>
      <!-- SECTION -->
    </VCard>
    <!-- 👉 Add New Company Account -->
    <AddNewCompanyAccountDrawer
      v-model:isDrawerOpen="isAddNewUserDrawerVisible"
      v-model:bankList="bankList"
      @company-account-data="AddNewCompanyAccount"
    />
  </section>
</template>
