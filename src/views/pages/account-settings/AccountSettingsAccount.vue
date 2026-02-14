<script setup>
import { ref, onMounted } from 'vue'
import avatar1 from '@images/avatars/avatar-1.png'

const accountData = {
  id: null,
  avatarImg: avatar1,
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  address: '',
  town: '',
  zipCode: '',
  role: '',
  status: '',
  currentPlan: '',
  userCompanies: [],
}

const refInputEl = ref()
const isConfirmDialogOpen = ref(false)
const accountDataLocal = ref(structuredClone(accountData))
const defaultAvatar = avatar1
const isAccountDeactivated = ref(false)
const isLoading = ref(false)
const isSaving = ref(false)
const isUploadingAvatar = ref(false)
const MAX_AVATAR_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/gif']
const validateAccountDeactivation = [v => !!v || 'Please confirm account deactivation']

// Compute role without ROLE_ prefix
const displayRole = computed(() => {
  return accountDataLocal.value.role?.replace('ROLE_', '') || ''
})

// Fetch user data
const fetchUserData = async () => {
  try {
    isLoading.value = true
    
    // Get user data from cookie (saved during login)
    const userData = useCookie('userData').value
    
    if (!userData || !userData.id) {
      console.error('User data not found in storage')
      return
    }

    const { data, error } = await axiosApiCall(`/users/${userData.id}`, {
      method: 'GET',
    })

    if (error) {
      useSweetAlert.errorMessage('Failed to fetch user data: ' + error.message)
      return
    }

    if (data) {
      accountData.id = data.id
      accountData.firstName = data.firstName || ''
      accountData.lastName = data.lastName || ''
      accountData.email = data.email || ''
      accountData.phoneNumber = data.phoneNumber || ''
      accountData.address = data.address || ''
      accountData.town = data.town || ''
      accountData.zipCode = data.zipCode || ''
      accountData.role = data.role || ''
      accountData.status = data.status || ''
      accountData.currentPlan = data.currentPlan || ''
      accountData.userCompanies = data.userCompanies || []
      
      // Load avatar from localStorage (base64 images are too large for cookies)
      const storedAvatar = localStorage.getItem('userAvatar')
      if (storedAvatar) {
        accountData.avatarImg = storedAvatar
      } else {
        accountData.avatarImg = defaultAvatar
      }
      
      accountDataLocal.value = structuredClone(accountData)
    }
  } catch (err) {
    useSweetAlert.toast('An error occurred while fetching user data' + err, 'error')
  } finally {
    isLoading.value = false
  }
}

// Update user data
const updateUserData = async () => {
  try {
    isSaving.value = true
    
    // Get user data from cookie (saved during login)
    const userData = useCookie('userData').value
    
    if (!userData || !userData.id) {
      console.error('User data not found in storage')
      return
    }

    const updatePayload = {
      firstName: accountDataLocal.value.firstName,
      lastName: accountDataLocal.value.lastName,
      email: accountDataLocal.value.email,
      phoneNumber: accountDataLocal.value.phoneNumber,
      address: accountDataLocal.value.address,
      town: accountDataLocal.value.town,
      zipCode: accountDataLocal.value.zipCode,
    }

    const { data, error } = await axiosApiCall(`/users/${userData.id}`, {
      method: 'PUT',
      data: updatePayload,
    })

    if (error) {
      useSweetAlert.errorMessage('Failed to update user data: ' + error.message)
      return
    }

    if (data) {
      accountData.firstName = data.firstName || accountDataLocal.value.firstName
      accountData.lastName = data.lastName || accountDataLocal.value.lastName
      accountData.email = data.email || accountDataLocal.value.email
      accountData.phoneNumber = data.phoneNumber || accountDataLocal.value.phoneNumber
      accountData.address = data.address || accountDataLocal.value.address
      accountData.town = data.town || accountDataLocal.value.town
      accountData.zipCode = data.zipCode || accountDataLocal.value.zipCode
      
      useSweetAlert.toast('User data updated successfully')
    }
  } catch (err) {
    useSweetAlert.toast('An error occurred while updating user data', 'error')
  } finally {
    isSaving.value = false
  }
}


const resetForm = () => {
  accountDataLocal.value = structuredClone(accountData)
}

// Fetch user data on component mount
onMounted(() => {
  fetchUserData()
})


const changeAvatar = async (file) => {
  const { files } = file.target
  if (!files || !files.length) return

  const selectedFile = files[0]

  // Validate file size
  if (selectedFile.size > MAX_AVATAR_SIZE) {
    useSweetAlert.errorMessage(`File size must not exceed 5 MB. Current size: ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`)
    return
  }

  // Validate file type
  if (!ALLOWED_AVATAR_TYPES.includes(selectedFile.type)) {
    useSweetAlert.errorMessage('Only JPG, GIF, or PNG files are allowed')
    return
  }

  try {
    isUploadingAvatar.value = true

    // Get user data from cookie
    const userData = useCookie('userData').value
    if (!userData || !userData.id) {
      useSweetAlert.errorMessage('User data not found')
      return
    }

    // Create FormData for file upload
    const formData = new FormData()
    formData.append('file', selectedFile)

    // Upload avatar to server
    const { data, error } = await axiosApiCall(`/users/${userData.id}/profile-picture`, {
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    if (error) {
      useSweetAlert.errorMessage('Failed to upload avatar: ' + error.message)
      return
    }

    // Format avatar as data URL using base64Image and mediaType from response
    if (data?.data?.base64Image && data?.data?.mediaType) {
      const avatarBase64 = `data:${data.data.mediaType};base64,${data.data.base64Image}`
      
      // Update local state
      accountDataLocal.value.avatarImg = avatarBase64
      accountData.avatarImg = avatarBase64

      // Store avatar in localStorage (cookies have 4KB limit, base64 images are larger)
      localStorage.setItem('userAvatar', avatarBase64)

      useSweetAlert.toast('Avatar uploaded successfully')
    } else {
      useSweetAlert.errorMessage('Invalid response from server')
    }
  } catch (err) {
    useSweetAlert.errorMessage('An error occurred while uploading avatar: ' + err.message)
  } finally {
    isUploadingAvatar.value = false
    // Reset file input
    if (refInputEl.value) {
      refInputEl.value.value = ''
    }
  }
}

// reset avatar image
const resetAvatar = () => {
  const storedAvatar = localStorage.getItem('userAvatar')
  accountDataLocal.value.avatarImg = storedAvatar || defaultAvatar
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardText class="d-flex justify-space-between align-center">
          <!-- 👉 Left Section: Avatar and Upload -->
          <div class="d-flex">
            <!-- 👉 Avatar -->
            <VAvatar
              rounded
              size="100"
              class="me-6"
              :image="accountDataLocal.avatarImg"
            />

            <!-- 👉 Upload Photo -->
            <form class="d-flex flex-column justify-center gap-4">
              <div class="d-flex flex-wrap gap-4">
                <VBtn
                  color="primary"
                  size="small"
                  :loading="isUploadingAvatar"
                  :disabled="isUploadingAvatar"
                  @click="refInputEl?.click()"
                >
                  <VIcon
                    icon="tabler-cloud-upload"
                    class="d-sm-none"
                  />
                  <span class="d-none d-sm-block">{{ isUploadingAvatar ? 'Uploading...' : 'Upload new photo' }}</span>
                </VBtn>

                <input
                  ref="refInputEl"
                  type="file"
                  name="file"
                  accept=".jpeg,.png,.jpg,.gif"
                  hidden
                  @input="changeAvatar"
                >

                <VBtn
                  type="reset"
                  size="small"
                  color="secondary"
                  variant="tonal"
                  :disabled="isUploadingAvatar"
                  @click="resetAvatar"
                >
                  <span class="d-none d-sm-block">Reset</span>
                  <VIcon
                    icon="tabler-refresh"
                    class="d-sm-none"
                  />
                </VBtn>
              </div>

              <p class="text-body-1 mb-0">
                Allowed JPG, GIF or PNG. Max size of 5 MB
              </p>
            </form>
          </div>

          <!-- 👉 Right Section: User Companies -->
          <div class="text-right">
            <p class="text-body-2 font-weight-600 mb-2">Companies</p>
            <p class="text-body-2 mb-0">
              {{ accountDataLocal.userCompanies?.map(c => c.companyName).join(', ') || 'No companies' }}
            </p>
          </div>
        </VCardText>

        <VCardText class="pt-2">
          <!-- 👉 Form -->
          <VForm class="mt-3">
            <VRow>
              <!-- 👉 First Name -->
              <VCol
                md="6"
                cols="12"
              >
                <AppTextField
                  v-model="accountDataLocal.firstName"
                  placeholder="John"
                  label="First Name"
                />
              </VCol>

              <!-- 👉 Last Name -->
              <VCol
                md="6"
                cols="12"
              >
                <AppTextField
                  v-model="accountDataLocal.lastName"
                  placeholder="Doe"
                  label="Last Name"
                />
              </VCol>

              <!-- 👉 Email -->
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="accountDataLocal.email"
                  label="E-mail"
                  placeholder="johndoe@gmail.com"
                  type="email"
                />
              </VCol>

              <!-- 👉 Organization -->
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="accountDataLocal.town"
                  label="Town"
                  placeholder="Ruiru"
                />
              </VCol>

              <!-- 👉 Phone -->
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="accountDataLocal.phoneNumber"
                  label="Phone Number"
                  placeholder="+254717488029"
                />
              </VCol>

              <!-- 👉 Address -->
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="accountDataLocal.address"
                  label="Address"
                  placeholder="123 Main St, New York, NY 10001"
                />
              </VCol>

              <!-- 👉 State -->
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="accountDataLocal.zipCode"
                  label="Zip Code"
                  placeholder=""
                />
              </VCol>

              <!-- 👉 Zip Code -->
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="displayRole"
                  label="Role"
                  disabled
                  placeholder="ADMIN"
                />
              </VCol>

              <!-- 👉 Country -->
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="accountDataLocal.status"
                  label="Status"
                  disabled
                  placeholder="pending"
                />
              </VCol>

              <!-- 👉 Language -->
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="accountDataLocal.currentPlan"
                  label="Current Plan"
                  disabled
                  placeholder="basic"
                />
              </VCol>

              <!-- 👉 Timezone -->
              <!-- 👉 Currency -->

              <!-- 👉 Form Actions -->
              <VCol
                cols="12"
                class="d-flex flex-wrap gap-4"
              >
                <VBtn
                  :loading="isSaving"
                  @click="updateUserData"
                >
                  Save changes
                </VBtn>

                <VBtn
                  color="secondary"
                  variant="tonal"
                  type="reset"
                  @click.prevent="resetForm"
                >
                  Cancel
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12">
      <!-- 👉 Delete Account -->
      <VCard title="Delete Account">
        <VCardText>
          <!-- 👉 Checkbox and Button  -->
          <div>
            <VCheckbox
              v-model="isAccountDeactivated"
              :rules="validateAccountDeactivation"
              label="I confirm my account deactivation"
            />
          </div>

          <VBtn
            :disabled="!isAccountDeactivated"
            color="error"
            class="mt-6"
            @click="isConfirmDialogOpen = true"
          >
            Deactivate Account
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <!-- Confirm Dialog -->
  <ConfirmDialog
    v-model:isDialogVisible="isConfirmDialogOpen"
    confirmation-question="Are you sure you want to deactivate your account?"
    confirm-title="Deactivated!"
    confirm-msg="Your account has been deactivated successfully."
    cancel-title="Cancelled"
    cancel-msg="Account Deactivation Cancelled!"
  />
</template>
