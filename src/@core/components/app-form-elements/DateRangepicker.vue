<template>
  <div>
    <input
      ref="picker"
      type="text"
      class="form-control dark-input"
      :placeholder="placeholder"
      readonly
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import $ from 'jquery'
// 👇 Setup moment globally BEFORE importing daterangepicker
import '../../../plugins/daterangepicker-global'

import 'daterangepicker'
import 'daterangepicker/daterangepicker.css'

const props = defineProps({
  placeholder: { type: String, default: 'Select date range' },
  modelValue: Object,
})

const emit = defineEmits(['update:modelValue'])

const picker = ref(null)

onMounted(() => {
  const $el = $(picker.value)

  $el.daterangepicker(
    {
      autoUpdateInput: false,
      showDropdowns: true,
      minYear: 2000,
      maxYear: parseInt(moment().format("YYYY"), 10) + 2,
      locale: {
        cancelLabel: 'Clear',
      },
      ranges: {
        'Today': [moment(), moment()],
        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [
          moment().subtract(1, 'month').startOf('month'),
          moment().subtract(1, 'month').endOf('month'),
        ],
        'This Year': [moment().startOf('year'), moment()],
      }
    },
    function (start, end) {
      emit('update:modelValue', {
        startDate: start.format('YYYY-MM-DD'),
        endDate: end.format('YYYY-MM-DD'),
      })
      $el.val(`${start.format('YYYY-MM-DD')} - ${end.format('YYYY-MM-DD')}`)
    }
  )

  $el.on('cancel.daterangepicker', function () {
    $el.val('')
    emit('update:modelValue', { startDate: null, endDate: null })
  })
})

onBeforeUnmount(() => {
  $(picker.value).data('daterangepicker')?.remove()
})
</script>

<style scoped>
/* Match Vuetify AppSelect styling */
.dark-input {
  background-color: rgba(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  color: rgba(var(--v-theme-on-surface));
  padding: 16px 12px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 400;
  width: 100%;
  height: 39px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
  font-family: inherit;
}

.dark-input:focus {
  outline: none;
  border-color: rgb(var(--v-theme-primary));
  border-width: 2px;
  padding: 15px 11px; /* Adjust padding to account for thicker border */
}

.dark-input::placeholder {
  color: rgba(var(--v-theme-surface-variant));
  opacity: var(--v-disabled-opacity);
}
</style>

<style>
/* Global daterangepicker styling to match Vuetify theme */
.daterangepicker {
  background-color: rgb(var(--v-theme-surface)) !important;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
  border-radius: 6px !important;
  box-shadow: 0px 5px 5px -3px var(--v-shadow-key-umbra-opacity, rgba(0, 0, 0, 0.2)), 0px 8px 10px 1px var(--v-shadow-key-penumbra-opacity, rgba(0, 0, 0, 0.14)), 0px 3px 14px 2px var(--v-shadow-key-ambient-opacity, rgba(0, 0, 0, 0.12)) !important;
}

/* Calendar header */
.daterangepicker .calendar-table {
  background-color: rgb(var(--v-theme-surface)) !important;
  color: rgba(var(--v-theme-on-surface)) !important;
}

.daterangepicker .calendar-table th,
.daterangepicker .calendar-table td {
  color: rgba(var(--v-theme-on-surface)) !important;
  border: none !important;
}

/* Month/year selectors */
.daterangepicker select {
  background-color: rgb(var(--v-theme-surface)) !important;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
  color: rgba(var(--v-theme-on-surface)) !important;
  border-radius: 4px !important;
}

/* Navigation arrows */
.daterangepicker .prev,
.daterangepicker .next {
  color: rgba(var(--v-theme-on-surface-variant)) !important;
}

.daterangepicker .prev:hover,
.daterangepicker .next:hover {
  color: rgb(var(--v-theme-primary)) !important;
}

/* Calendar days */
.daterangepicker td {
  color: rgba(var(--v-theme-on-surface)) !important;
}

.daterangepicker td.available:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.08) !important;
  color: rgba(var(--v-theme-on-surface)) !important;
}

/* Today */
.daterangepicker td.today {
  background-color: rgba(var(--v-theme-primary), 0.12) !important;
  color: rgb(var(--v-theme-primary)) !important;
  font-weight: 500 !important;
}

/* Active/selected range */
.daterangepicker td.active,
.daterangepicker td.active:hover {
  background-color: rgb(var(--v-theme-primary)) !important;
  color: rgb(var(--v-theme-on-primary)) !important;
  border-radius: 4px !important;
}

.daterangepicker td.in-range {
  background-color: rgba(var(--v-theme-primary), 0.12) !important;
  color: rgba(var(--v-theme-on-surface)) !important;
}

.daterangepicker td.start-date {
  border-top-left-radius: 4px !important;
  border-bottom-left-radius: 4px !important;
}

.daterangepicker td.end-date {
  border-top-right-radius: 4px !important;
  border-bottom-right-radius: 4px !important;
}

/* Disabled/off dates */
.daterangepicker td.off,
.daterangepicker td.disabled {
  color: rgba(var(--v-theme-on-surface), var(--v-disabled-opacity)) !important;
}

/* Ranges sidebar */
.daterangepicker .ranges {
  background-color: rgb(var(--v-theme-surface)) !important;
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
}

.daterangepicker .ranges li {
  color: rgba(var(--v-theme-on-surface)) !important;
  padding: 8px 12px !important;
  border-radius: 4px !important;
  margin: 2px !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.daterangepicker .ranges li:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.08) !important;
  color: rgba(var(--v-theme-on-surface)) !important;
}

.daterangepicker .ranges li.active {
  background-color: rgb(var(--v-theme-primary)) !important;
  color: rgb(var(--v-theme-on-primary)) !important;
}

/* Date input field in buttons area */
.daterangepicker .drp-buttons input {
  background-color: rgb(var(--v-theme-surface)) !important;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
  color: rgba(var(--v-theme-on-surface)) !important;
  border-radius: 4px !important;
  padding: 8px 12px !important;
}

/* Buttons */
.daterangepicker .drp-buttons {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
  background-color: rgb(var(--v-theme-surface)) !important;
  padding: 16px !important;
}

.daterangepicker .btn {
  padding: 8px 16px !important;
  border-radius: 4px !important;
  font-weight: 500 !important;
  font-size: 14px !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  text-transform: uppercase !important;
  letter-spacing: 0.0892857143em !important;
}

.daterangepicker .btn.applyBtn {
  background-color: rgb(var(--v-theme-primary)) !important;
  color: rgb(var(--v-theme-on-primary)) !important;
  border: none !important;
}

.daterangepicker .btn.applyBtn:hover {
  box-shadow: 0px 2px 4px -1px var(--v-shadow-key-umbra-opacity, rgba(0, 0, 0, 0.2)), 0px 4px 5px 0px var(--v-shadow-key-penumbra-opacity, rgba(0, 0, 0, 0.14)), 0px 1px 10px 0px var(--v-shadow-key-ambient-opacity, rgba(0, 0, 0, 0.12)) !important;
}

.daterangepicker .btn.cancelBtn {
  background-color: transparent !important;
  color: rgba(var(--v-theme-on-surface)) !important;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
}

.daterangepicker .btn.cancelBtn:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.08) !important;
}

/* Dropdown arrow */
.daterangepicker:before {
  border-bottom-color: rgb(var(--v-theme-surface)) !important;
}

.daterangepicker:after {
  border-bottom-color: rgb(var(--v-theme-surface)) !important;
}
/* Disabled/off dates */
.daterangepicker td.off,
.daterangepicker td.disabled {
  color: rgba(var(--v-theme-on-surface), var(--v-disabled-opacity)) !important;
  background-color: transparent !important;
}
</style>