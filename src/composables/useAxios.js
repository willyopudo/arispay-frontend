import axios from "axios";

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const baseAppUrl = import.meta.env.VITE_APP_BASE_URL;
const accessToken = useCookie("accessToken").value;


// ✅ Create Axios Instance
const apiClient = axios.create({
  baseURL: baseUrl, // Change to your API URL
  headers: {
    //"Content-Type": "application/json",
    //"Authorization": `Bearer ${accessToken}`,
    "Accept": "application/json"
  },
});

// Function to refresh access token
const refreshToken = async () => {
    const refreshToken = useCookie("refreshToken").value;
    let newAccessToken = null;
    try {
        const response  = await apiClient({
            method: 'POST',
            url: '/auth/refresh-token',
            data: { refreshToken },
            params : {},
        })
        const data = response.data;
  
        console.log(data);
    
        // Assuming the new access token is returned as 'accessToken'
        newAccessToken = data?.access_token;
        if (newAccessToken) {
            // Update the access token cookie
            useCookie("accessToken").value = newAccessToken;
            //return newAccessToken;
        } 
    } catch (error) {
        console.error("Failed to refresh token: ", error.response?.data || error.message);
        //console.log(error.response);
        if(error.response.staus == 500 && !error.response.data.detail.includes("Refresh token"))
            throw error.response?.data || error.message;
    }
    return newAccessToken;
  };

// ✅ Reusable API Call Function
export const axiosApiCall = async (endpoint, options = {}) => {
    let data, error, resp = null;
    // Add Authorization header if accessToken is present
    const headers = {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
    };

    try {
      const response = await apiClient({
        method: options.method,
        url: endpoint,
        data: options.data,
        headers: headers,
        params : options.params,
      });
      data = response.data;
      resp = response.status;
    
      
    } catch (err) {
      //console.error(err);
      //throw error.response?.data || error.message;
      
      if (err.response?.status === 401) {
        console.info('Access token expired, attempting to refresh...')
    
        try {
          // Refresh the token
          const newAccessToken = await refreshToken();
    
          if (newAccessToken === null) {
            const userData = useCookie("userData");
            // Remove "accessToken" from cookie
            useCookie("accessToken").value = null;
    
            // Remove "refreshToken" from cookie
            useCookie("refreshToken").value = null;
    
            // Remove "userData" from cookie
            userData.value = null;
    
            // Redirect to login page
            //await router.push('/login')
            window.location.href = baseAppUrl + "/login";
          } else {
            // Retry the original request with the new token
            const newHeaders = {
              ...options.headers,
              Authorization: `Bearer ${newAccessToken}`,
            };
    
            // Retry the request
            const retryResult = await apiClient({
                method: options.method,
                url: endpoint,
                data: options.data,
                headers: newHeaders,
                params : options.params,
              });            
    
            // Return the retry result
            data = retryResult.data;
            resp = retryResult.status;
          }
        } catch (refreshError) {
          console.error("Failed to refresh token:", refreshError.response?.data || refreshError.message);
          error = refreshError;
        }
      }
      error = err;
    }

    return { data, error,  resp}; // Return the response payload
};