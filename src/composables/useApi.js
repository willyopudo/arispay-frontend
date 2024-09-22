import { createFetch } from '@vueuse/core'
import { destr } from 'destr'

const route = useRoute()
const router = useRouter()
const refreshToken = async () => {
  try {
    const refreshToken = useCookie('refreshToken').value
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (response.ok) {
      const data = await response.json()
      const newAccessToken = data.access_token
      // Update the access token cookie
      useCookie('accessToken').value = newAccessToken
      return newAccessToken
    } else {
      //throw new Error('Failed to refresh token')
      return null;
    }
  } catch (error) {
    console.error('Error refreshing token:', error)
    throw error
  }
}

const useApiOld = createFetch({
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  fetchOptions: {
    headers: {
      Accept: 'application/json',
    },
  },
  options: {
    refetch: true,
    async beforeFetch({ options }) {
      const accessToken = useCookie('accessToken').value
      if (accessToken) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        }
      }
      
      return { options }
    },
    async onFetchError(ctx, options) {
      const { data, response } = ctx
      console.log(options)
      // Parse data if it's JSON
      let parsedData = null
      try {
        parsedData = destr(data)
      }
      catch (error) {
        console.error("Failed to parse response data: ", error)
      }
      // Handle token refresh if 401 response is returned
      if (response.status === 401) {
        console.log('Token expired, refreshing...')
        try {
          const newAccessToken = await refreshToken()
          if(newAccessToken !== null){

            // Retry the original request with the new token
            const retryResponse = await fetch(options.url, {
              ...options,
              headers: {
                ...options.headers,
                Authorization: `Bearer ${newAccessToken}`,
              },
            })

            const retryData = await retryResponse.json()

            return {
              data: retryData,
              response: retryResponse,
            }
          }
          else{
            const userData = useCookie('userData')
            // Remove "accessToken" from cookie
            useCookie('accessToken').value = null

            // Remove "refreshToken" from cookie
            useCookie('refreshToken').value = null

            // Remove "userData" from cookie
            userData.value = null

            // Redirect to login page
            await router.push('/login')
          }
        } catch (tokenError) {
          console.error('Token refresh failed:', tokenError)
          throw tokenError
        }
      }
      return { data: parsedData, response }
    },
    async afterFetch(ctx) {
      const { data, response } = ctx
      console.log(ctx)
      // Parse data if it's JSON
      let parsedData = null
      try {
        parsedData = destr(data)
      }
      catch (error) {
        console.error("Failed to parse response data: ", error)
      }

      
      return { data: parsedData, response }
    },
  },
})

export default useApiOld;
