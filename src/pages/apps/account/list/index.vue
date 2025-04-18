<script setup>
import AddNewCompanyAccountDrawer from '@/views/apps/user/list/AddNewCompanyAccountDrawer.vue'

// 👉 Store
const searchQuery = ref('')
const selectedRole = ref()
const selectedPlan = ref()
const selectedStatus = ref()

// Data table options
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()
const selectedRows = ref([])

//dialogs
const isUserInfoEditDialogVisible = ref(false)
// State for modal and selected user
const selectedUser = ref(null);
const todo = ref(null);

// Open modal with user details
const openModal = (user, action) => {
  selectedUser.value = user;
  isUserInfoEditDialogVisible.value = true;
  todo.value = action;
};


//Users stats
const fetchedAccounts = ref(null)
const totalFetchedAccounts = ref(0)
const bankList = ref([])

const userSummary = ref({
  totalUsers: 0,
  activeUsers: 0,
  inactiveUsers: 0,
  pendingUsers: 0,
})

const updateOptions = options => {
  page.value = options.page
  itemsPerPage.value = options.itemsPerPage
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order

  fetchCompanyAccounts()
}

// Headers
const headers = [
  {
    title: 'Account',
    key: 'account',
  },
  {
    title: 'Company',
    key: 'companyName',
  },
  {
    title: 'Bank',
    key: 'bank',
  },
  {
    title: 'Balance',
    key: 'balance',
  },
  {
    title: 'Status',
    key: 'status',
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
        // search: searchQuery.value,
        // role: selectedRole.value,
        // plan: selectedPlan.value,
        status: selectedStatus.value,
      }
    })
    if (error) {
      useSweetAlert.errorMessage('Error fetching company accounts: ' + error.message)
      return
    }
    
    fetchedAccounts.value = accountsList.value0.content
    totalFetchedAccounts.value = accountsList.value0.totalElements
    // userSummary.value = usersList.value1
    bankList.value = accountsList.value1

    widgetData.value[0].value = userSummary.value.totalUsers
    widgetData.value[1].value = userSummary.value.activeUsers
    widgetData.value[2].value = userSummary.value.inactiveUsers
    widgetData.value[3].value = userSummary.value.pendingUsers

    useSweetAlert.toast("Company accounts fetched successfully");

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
      useSweetAlert.errorMessage('Error during company account creation: ' + error.message)
      return
    }
    
    fetchCompanyAccounts()
    useSweetAlert.toast("Company Account created successfully");
 
  } catch (error) {
    console.error(error)
  }
}

const updateUser = async userData => {
  console.log(JSON.stringify(userData))
  await customUseApi(`/user/${userData.id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
    headers: {"Content-Type": 'application/json'}
  })

  // Refetch User
  fetchUsers()
}

const deleteUser = async id => {
  const canDelete = await useSweetAlert.confirm()
  if (!canDelete) return
  try {
    const {
      data,
      error,
      resp: status
    } = await axiosApiCall(`/user/${id}`, {
    method: 'DELETE',
  
    })
    
    if (error && error.response) {
      useSweetAlert.errorMessage('An error occured: ' + error.response.data.message)
      return
    }
    
    useSweetAlert.successMessage('User deleted successfully')

    // Refetch User
    setTimeout(fetchUsers, 3000);

  } catch (error) {
    console.error(error)
    useSweetAlert.errorMessage('An error occured while deleting user')
  }
  // Delete from selectedRows
  const index = selectedRows.value.findIndex(row => row === id)
  if (index !== -1)
    selectedRows.value.splice(index, 1)
}

const widgetData = ref([
  {
    title: 'Accounts',
    value: userSummary.value.totalUsers,
    change: 2.1,
    desc: 'Total Accounts',
    icon: 'tabler-users',
    iconColor: 'primary',
  },
  {
    title: 'Active Accounts',
    value: userSummary.value.activeUsers,
    change: 18,
    desc: 'Active Accounts',
    icon: 'tabler-user-check',
    iconColor: 'success',
  },
  {
    title: 'Inactive Accounts',
    value: userSummary.value.inactiveUsers,
    change: -14,
    desc: 'Not ACtive Users',
    icon: 'tabler-user-plus',
    iconColor: 'error',
  },
  {
    title: 'Dormant Accounts',
    value: userSummary.value.pendingUsers,
    change: 42,
    desc: 'Pending Users',
    icon: 'tabler-user-search',
    iconColor: 'warning',
  },
])
const handleDataFromUserInfoEDitDialog = (data) => {
  updateUser(data)
}

// Watch for changes in searchQuery and fetch users if length is more than 3
watch(searchQuery, (newQuery) => {
  if (newQuery.length > 2|| newQuery.length === 0) {
    fetchUsers()
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
        <VCardTitle>Filters</VCardTitle>
      </VCardItem>

      <VCardText>
        <VRow>
          <!-- 👉 Select Role -->
          <VCol
            cols="12"
            sm="4"
          >
            <AppSelect
              v-model="selectedRole"
              placeholder="Select Role"
              :items="roles"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>
          <!-- 👉 Select Plan -->
          <VCol
            cols="12"
            sm="4"
          >
            <AppSelect
              v-model="selectedPlan"
              placeholder="Select Plan"
              :items="plans"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>
          <!-- 👉 Select Status -->
          <VCol cols="12" sm="4">
  <div class="d-flex align-center">
    <AppSelect
      v-model="selectedStatus"
      placeholder="Select Status"
      :items="status"
      clearable
      clear-icon="tabler-x"
      class="flex-grow-1 mr-2"
    />
    <VBtn class="ml-4" @click="fetchCompanyAccounts">
      Filter
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
              { value: 5, title: '5' },
              { value: 10, title: '10' },
              { value: 25, title: '25' },
              { value: 50, title: '50' },
              { value: 100, title: '100' },
              { value: -1, title: 'All' },
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
              placeholder="Search User"
            />
          </div>

          <!-- 👉 Export button -->
          <VBtn
            variant="tonal"
            color="secondary"
            prepend-icon="tabler-upload"
          >
            Export
          </VBtn>

          <!-- 👉 Add user button -->
          <VBtn
            prepend-icon="tabler-plus"
            @click="isAddNewUserDrawerVisible = true"
          >
            Add New Account
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
        <template #item.account="{ item }">
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

          <IconBtn @click="deleteUser(item.id)">
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
      <UserInfoEditDialog @submit="handleDataFromUserInfoEDitDialog" v-if="isUserInfoEditDialogVisible" v-model:isDialogVisible="isUserInfoEditDialogVisible" :user-data="selectedUser" :action="todo" />
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
