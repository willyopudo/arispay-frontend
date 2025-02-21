<script setup>
import AddNewUserDrawer from '@/views/apps/user/list/AddNewUserDrawer.vue'
//import Swal from "sweetalert2";

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
const fetchedUsers = ref(null)
const totalFetchedUsers = ref(0)

const updateOptions = options => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

// Headers
const headers = [
  {
    title: 'User',
    key: 'user',
  },
  {
    title: 'Role',
    key: 'role',
  },
  {
    title: 'Subscription Plan',
    key: 'plan',
  },
  // {
  //   title: 'Billing',
  //   key: 'billing',
  // },
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

await fetchUsers()

// 👉 search filters
const roles = [
  {
    title: 'Admin',
    value: 'ROLE_ADMIN',
  },
  {
    title: 'Company User',
    value: 'ROLE_USER',
  },
  {
    title: 'Super Admin',
    value: 'superadmin',
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

async function fetchUsers(){
  try {
    const {
      data: usersList,
      error,
      response
    } = await customUseApi('/user', {

    })
    if (error.value) {
      useSweetAlert.errorMessage('Error fetching users:', error.value)
      return
    }
    
    fetchedUsers.value = usersList.value
    totalFetchedUsers.value = usersList.value.length
    useSweetAlert.toast("Users fetched successfully");

  } catch (error) {
    console.error(error)
  }
}
const users = computed(() => fetchedUsers.value);
const totalUsers = computed(() => totalFetchedUsers.value);

const addNewUser = async userData => {
  await $api('/apps/users', {
    method: 'POST',
    body: userData,
  })

  // Refetch User
  fetchUsers()
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
      response
    } = await customUseApi(`/user/${id}`, {
    method: 'DELETE',
  
    })
    console.log(error)
    if (error.value && response.value.status > 499) {
      useSweetAlert.errorMessage('An error occured', error.value)
      return
    }
    if(response.value.status === 200){
      useSweetAlert.successMessage('User deleted successfully')

      // Refetch User
      setTimeout(fetchUsers, 3000);
    }
    else if(response.value.status === 404)
      useSweetAlert.errorMessage('User not found')
    else
      useSweetAlert.errorMessage('An error occured while deleting user')

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
    title: 'Users',
    value: '2,100',
    change: 2.1,
    desc: 'Total Users',
    icon: 'tabler-users',
    iconColor: 'primary',
  },
  {
    title: 'Active Users',
    value: '4,567',
    change: 18,
    desc: 'Active Users',
    icon: 'tabler-user-check',
    iconColor: 'success',
  },
  {
    title: 'Inactive Users',
    value: '19,860',
    change: -14,
    desc: 'Not ACtive Users',
    icon: 'tabler-user-plus',
    iconColor: 'error',
  },
  {
    title: 'Pending Users',
    value: '237',
    change: 42,
    desc: 'Pending Users',
    icon: 'tabler-user-search',
    iconColor: 'warning',
  },
])
const handleDataFromUserInfoEDitDialog = (data) => {
  updateUser(data)
}

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
          <VCol
            cols="12"
            sm="4"
          >
            <AppSelect
              v-model="selectedStatus"
              placeholder="Select Status"
              :items="status"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

      <VCardText class="d-flex flex-wrap gap-4">
        <div class="me-3 d-flex gap-3">
          <AppSelect
            :model-value="itemsPerPage"
            :items="[
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
            Add New User
          </VBtn>
        </div>
      </VCardText>

      <VDivider />

      <!-- SECTION datatable -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:model-value="selectedRows"
        v-model:page="page"
        :items="users"
        item-value="id"
        :items-length="totalUsers"
        :headers="headers"
        class="text-no-wrap"
        show-select
        @update:options="updateOptions"
      >
        <!-- User -->
        <template #item.user="{ item }">
          <div class="d-flex align-center gap-x-4">
            <VAvatar
              size="34"
              :variant="!item.avatar ? 'tonal' : undefined"
              :color="!item.avatar ? resolveUserRoleVariant(item.role).color : undefined"
            >
              <VImg
                v-if="item.avatar"
                :src="item.avatar"
              />
              <span v-else>{{ avatarText(item.firstName) }}</span>
            </VAvatar>
            <div class="d-flex flex-column">
              <h6 class="text-base">
                <RouterLink
                  :to="{ name: 'apps-user-view-id', params: { id: item.id } }"
                  class="font-weight-medium text-link"
                >
                {{ item.firstName }} {{ item.lastName }}
                </RouterLink>
              </h6>
              <div class="text-sm">
                {{ item.email }} 
              </div>
            </div>
          </div>
        </template>

        <!-- 👉 Role -->
        <template #item.role="{ item }">
          <div class="d-flex align-center gap-x-2">
            <VIcon
              :size="22"
              :icon="resolveUserRoleVariant(item.role).icon"
              :color="resolveUserRoleVariant(item.role).color"
            />

            <div class="text-capitalize text-high-emphasis text-body-1">
              {{ item.role }}
            </div>
          </div>
        </template>

        <!-- Plan -->
        <template #item.plan="{ item }">
          <div class="text-body-1 text-high-emphasis text-capitalize">
            {{ item.currentPlan }}
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
            :total-items="totalUsers"
          />
        </template>
      </VDataTableServer>
      <UserInfoEditDialog @submit="handleDataFromUserInfoEDitDialog" v-if="isUserInfoEditDialogVisible" v-model:isDialogVisible="isUserInfoEditDialogVisible" :user-data="selectedUser" :action="todo" />
      <!-- SECTION -->
    </VCard>
    <!-- 👉 Add New User -->
    <AddNewUserDrawer
      v-model:isDrawerOpen="isAddNewUserDrawerVisible"
      @user-data="addNewUser"
    />
  </section>
</template>
