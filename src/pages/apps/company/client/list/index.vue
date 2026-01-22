<script setup>
import { useI18n } from 'vue-i18n'
import AddNewClientDrawer from '@/views/apps/user/list/AddNewClientDrawer.vue'

const { t } = useI18n()

// 👉 Store
const searchQuery = ref('')
const selectedIdentifierType = ref()
const selectedStatus = ref()

// Data table options
const itemsPerPage = ref(5)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()
const selectedRows = ref([])

//dialogs
const isClientInfoEditDialogVisible = ref(false)
// State for modal and selected client
const selectedClient = ref(null);
const todo = ref(null);

//Clients stats
const fetchedClients = ref(null)
const totalFetchedClients = ref(0)

const updateOptions = options => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
  fetchClients()
}

const clientSummary = ref({
  totalClients: 0,
  activeClients: 0,
  inactiveClients: 0,
  pendingClients: 0,
})


// Headers
const headers = computed(() => [
  {
    title: t('Client ID'),
    key: 'clientId',
  },
  {
    title: t('Client Name'),
    key: 'clientName',
  },
  {
    title: t('Identifier Type'),
    key: 'identifierType',
  },
  {
    title: t('Company'),
    key: 'company',
    sortable: false,
  },
  {
    title: t('Status'),
    key: 'status',
  },
  {
    title: t('Created Date'),
    key: 'createdDate',
  },
  {
    title: t('Actions'),
    key: 'actions',
    sortable: false,
  },
])

async function fetchClients(){
  try {
    const {
      data: clientsList,
      error,
      response
    } = await axiosApiCall('/client', {
      params: {
        page: page.value,
        itemsPerPage: itemsPerPage.value,
        sortBy: sortBy.value,
        orderBy: orderBy.value,
        search: searchQuery.value,
        identifierType: selectedIdentifierType.value,
        status: selectedStatus.value
      }
    })
    if (error) {
      useSweetAlert.errorMessage(t('Error fetching clients') + ': ' + error.message)
      return
    }

    fetchedClients.value = clientsList.content
    totalFetchedClients.value = clientsList.totalElements

    useSweetAlert.toast(t("Clients fetched successfully"));

  } catch (error) {
    console.error(error)
  }
}


const clients = computed(() => fetchedClients.value || [])
const totalClients = computed(() => totalFetchedClients.value)

// 👉 search filters

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

const identifierTypes = computed(() => [
  {
    title: t('ID Number'),
    value: 'ID_NUMBER',
  },
  {
    title: t('Phone Number'),
    value: 'MSSIDN',
  },
  {
    title: t('Account Number'),
    value: 'ACCOUNT_NUMBER',
  },
  {
    title: t('Bill Number'),
    value: 'BILL_NUMBER',
  },
  {
    title: t('Registration Number'),
    value: 'REG_NUMBER',
  },
  {
    title: t('Invoice Number'),
    value: 'INVOICE_NUMBER',
  },
])


const resolveClientStatusVariant = stat => {
  const statLowerCase = stat.toLowerCase()
  if (statLowerCase === 'pending')
    return 'warning'
  if (statLowerCase === 'active')
    return 'success'
  if (statLowerCase === 'inactive')
    return 'secondary'
  
  return 'primary'
}

const isAddNewClientDrawerVisible = ref(false)

const addNewClient = async clientData => {
  
  try {
    const {
      data: cData,
      error,
      response
    } = await axiosApiCall('/client', {  
      data: clientData,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (error) {
      useSweetAlert.errorMessage(t('Error during client creation') + ': ' + error.message)
      return
    }

    fetchClients()
    useSweetAlert.toast(t("Client created successfully"));
 
  } catch (error) {
    console.error(error)
  }
}

const deleteClient = async id => {
  const canDelete = await useSweetAlert.confirm()
  if (!canDelete) return
  try {
    const {
      data,
      error,
      resp: status
    } = await axiosApiCall(`/client/${id}`, {
    method: 'DELETE',
  
    })
    
    if (error && error.response) {
      useSweetAlert.errorMessage(t('An error occurred') + ': ' + error.response.data.message)
      return
    }

    useSweetAlert.successMessage(t('Client deleted successfully'))

    // Refetch User
    setTimeout(fetchClients, 3000);

  } catch (error) {
    console.error(error)
    useSweetAlert.errorMessage(t('An error occurred while deleting client'))
  }
  // Delete from selectedRows
  const index = selectedRows.value.findIndex(row => row === id)
  if (index !== -1)
    selectedRows.value.splice(index, 1)
}

// Open modal with user details
const openModal = (client, action) => {
  selectedClient.value = client;
  isClientInfoEditDialogVisible.value = true;
  todo.value = action;
};

const handleDataFromClientInfoEDitDialog = (data) => {
  updateClient(data)
}

const updateClient = async clientData => {
  //Use axiosApiCall to update client
  try {
    const {
      data: cData,
      error,
      response
    } = await axiosApiCall(`/client/${clientData.id}`, {  
      data: clientData,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (error) {
      useSweetAlert.errorMessage(t('Error during client update') + ': ' + error.message)
      return
    }

     // Refetch Client
    fetchClients()
    useSweetAlert.toast(t("Client updated successfully"));
 
  } catch (error) {
    console.error(error)
  }
}

// Watch for changes in searchQuery and fetch clients if length is more than 3
watch(searchQuery, (newQuery) => {
  if (newQuery.length > 2|| newQuery.length === 0) {
    fetchClients()
  }
});
</script>

<template>
  <section>
    <VCard class="mb-6">
      <VCardItem class="pb-4">
        <VCardTitle>{{ $t('Filters') }}</VCardTitle>
      </VCardItem>

      <VCardText>
        <VRow>
          <!-- 👉 Select Identifier Type -->
          <VCol
            cols="12"
            sm="4"
          >
            <AppSelect
              v-model="selectedIdentifierType"
              :placeholder="$t('Select Identifier Type')"
              :items="identifierTypes"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>
          <!-- 👉 Select Plan -->
          <!-- <VCol
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
          </VCol> -->
          <!-- 👉 Select Status -->
          <VCol
            cols="12"
            sm="4"
          >
            <AppSelect
              v-model="selectedStatus"
              :placeholder="$t('Select Status')"
              :items="status"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>
          <VCol
            cols="12"
            sm="4"
          >
          <VBtn class="ml-4" @click="fetchClients">
      {{ $t('Filter') }}
      <VIcon end icon="tabler-filter" />
    </VBtn>
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
              :placeholder="$t('Search Client')"
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
            @click="isAddNewClientDrawerVisible = true"
          >
            {{ $t('Add New Client') }}
          </VBtn>
        </div>
      </VCardText>

      <VDivider />

      <!-- SECTION datatable -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:model-value="selectedRows"
        v-model:page="page"
        :items="clients"
        item-value="id"
        :items-length="totalClients"
        :headers="headers"
        class="text-no-wrap"
        show-select
        @update:options="updateOptions"
      >
        <!-- User -->
        <template #item.clientId="{ item }">
          <div class="d-flex align-center gap-x-4">
            <div class="d-flex flex-column">
              <h6 class="text-base">
                <RouterLink
                  :to="{ name: 'apps-user-view-id', params: { id: item.id } }"
                  class="font-weight-medium text-link"
                >
                  {{ item.clientId }}
                </RouterLink>
              </h6>
              <div class="text-sm">
                {{ item.clientEmail }} 
              </div>
            </div>
          </div>
        </template>

        <!-- 👉 Role -->
        <template #item.client_name="{ item }">
          <div class="d-flex align-center gap-x-2">
            <div class="text-capitalize text-high-emphasis text-body-1">
              {{ item.clientName }}
            </div>
          </div>
        </template>

        <!-- Plan -->
        <template #item.identifier_type="{ item }">
          <div class="text-body-1 text-high-emphasis text-capitalize">
            {{ item.identifierType }}
          </div>
        </template>

        <!-- Company -->
        <template #item.company="{ item }">
          <div class="text-body-1 text-high-emphasis text-capitalize">
            {{ item.companyName }}
          </div>
        </template>

        <!-- Date -->
        <template #item.created_date="{ item }">
          <div class="text-body-1 text-high-emphasis text-capitalize">
            {{ item.createdDate }}
          </div>
        </template>

        <!-- Status -->
        <template #item.status="{ item }">
          <VChip
            :color="resolveClientStatusVariant(item.status)"
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

          <IconBtn @click="deleteClient(item.id)">
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>

        <!-- pagination -->
        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalClients"
          />
        </template>
      </VDataTableServer>
      <ClientInfoEditDialog @submit="handleDataFromClientInfoEDitDialog" v-if="isClientInfoEditDialogVisible" v-model:isDialogVisible="isClientInfoEditDialogVisible" :client-data="selectedClient" :action="todo" :identifierTypes="identifierTypes"/>
      <!-- SECTION -->
    </VCard>
    <!-- 👉 Add New Client -->
    <AddNewClientDrawer
      v-model:isDrawerOpen="isAddNewClientDrawerVisible"
      @client-data="addNewClient"
    />
  </section>
</template>
