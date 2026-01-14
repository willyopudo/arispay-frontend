import { $api } from '@/utils/api'

export const dashboardService = {
  async getDashboardSummary() {
    return await axiosApiCall('/dashboard/summary')
  },

  async getWidgets() {
    return await axiosApiCall('/dashboard/widgets')
  },

  async getEarningReports(months = 12) {
    return await axiosApiCall(`/dashboard/earning-reports?months=${months}`)
  },

  async getLatestTransactions(limit = 5) {
    return await axiosApiCall(`/dashboard/latest-transactions?limit=${limit}`)
  },

  async getTopClients(limit = 6) {
    return await axiosApiCall(`/dashboard/top-clients?limit=${limit}`)
  },

  async getRecentActivities(limit = 4) {
    return await axiosApiCall(`/dashboard/recent-activities?limit=${limit}`)
  },
}
