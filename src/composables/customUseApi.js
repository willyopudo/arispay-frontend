import { useFetch } from '@vueuse/core'
//import { useCookie } from 'vue-cookie-composable'

const route = useRoute()
const router = useRouter()

// Function to refresh access token
const refreshToken = async () => {
  const refreshToken = useCookie('refreshToken').value

  try {
    const { data, error, response } = await useFetch(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`)
      .post({ refreshToken })
      .json()

      //console.log(data.value);
      //console.log(error.value)
    if (error.value && error.value !== "Error") {
      throw new Error('Failed to refresh token', error.value)
    }

    // Assuming the new access token is returned as 'accessToken'
    const newAccessToken = data.value?.access_token
    if (newAccessToken) {
      // Update the access token cookie
      useCookie('accessToken').value = newAccessToken
      return newAccessToken
    } else {
        return null
      //throw new Error('Invalid refresh token response')
    }
  } catch (err) {
    console.error('Error refreshing token:', err)
    throw err
  }
}

// Function to make an API request and handle token refresh if 401 occurs
const customUseApi = async (endpoint, options = {}) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  const baseAppUrl = import.meta.env.VITE_APP_BASE_URL
  const accessToken = useCookie('accessToken').value

  // Add Authorization header if accessToken is present
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json',
  }

  // Build the full URL for the API request
  const url = `${baseUrl}${endpoint}`

  // Initial API request
  let { data, error, response } = await useFetch(url, { ...options, headers }).get().json()

  if (response.value?.status === 401) {
    console.log('Access token expired, attempting to refresh...')

    try {
      // Refresh the token
      const newAccessToken = await refreshToken()

      if(newAccessToken === null){
        const userData = useCookie('userData')
        // Remove "accessToken" from cookie
        useCookie('accessToken').value = null

        // Remove "refreshToken" from cookie
        useCookie('refreshToken').value = null

        // Remove "userData" from cookie
        userData.value = null

        // Redirect to login page
        //await router.push('/login')
        window.location.href = baseAppUrl + '/login';
      }
      else{

        // Retry the original request with the new token
        const newHeaders = {
            ...headers,
            Authorization: `Bearer ${newAccessToken}`,
        }

        // Retry the request
        const retryUrl = `${baseUrl}${endpoint}`
        const retryResult = await useFetch(retryUrl, { ...options, headers: newHeaders }).get().json()

        // Return the retry result
        data = retryResult.data
        error = retryResult.error
        response = retryResult.response
      }
    } catch (refreshError) {
      console.error('Failed to refresh token:', refreshError)
      error = refreshError
    }
  }

  return { data, error, response }
}

export default customUseApi
