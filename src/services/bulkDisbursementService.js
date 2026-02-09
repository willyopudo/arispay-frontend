import { axiosApiCall } from '@/composables/useAxios'

export const bulkDisbursementService = {
  async parseFile(formData) {
    return await axiosApiCall('/bulk-disbursements/parse', {
      method: 'POST',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  async submit(disbursementData) {
    return await axiosApiCall('/bulk-disbursements/submit', {
      method: 'POST',
      data: disbursementData,
    })
  },

  async list() {
    return await axiosApiCall('/bulk-disbursements')
  },

  async getById(id) {
    return await axiosApiCall(`/bulk-disbursements/${id}`)
  },
}
