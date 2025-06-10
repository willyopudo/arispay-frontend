<template>
  <input
    type="text"
    ref="picker"
    class="form-control"
    :placeholder="placeholder"
    readonly
  />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import $ from 'jquery'
import moment from 'moment'
import 'bootstrap-daterangepicker/daterangepicker.css'
import 'bootstrap-daterangepicker'

// Make moment available globally for daterangepicker
window.moment = moment

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Select date range'
  }
})

const emit = defineEmits(['update:modelValue'])
const picker = ref(null)

onMounted(() => {
  $(picker.value).daterangepicker({
    autoUpdateInput: false,
    timePicker: true,
    timePicker24Hour: true,
    locale: {
      format: 'YYYY-MM-DD HH:mm:ss',
      cancelLabel: 'Clear'
    }
  })

  $(picker.value).on('apply.daterangepicker', (ev, picker) => {
    const value = `${picker.startDate.format('YYYY-MM-DD HH:mm:ss')},${picker.endDate.format('YYYY-MM-DD HH:mm:ss')}`
    emit('update:modelValue', value)
  })

  $(picker.value).on('cancel.daterangepicker', () => {
    emit('update:modelValue', '')
  })
})

onUnmounted(() => {
  if (picker.value) {
    $(picker.value).off().data('daterangepicker').remove()
  }
})
</script>

