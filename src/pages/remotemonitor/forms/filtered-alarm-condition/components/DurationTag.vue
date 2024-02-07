<template>
  <FContainer>
    <FPopover
      trigger="clickToOpen"
      @show="() => (this.canShowPicker = true)"
      @hide="() => (this.canShowPicker = false)"
    >
      <FInput
        v-model="placeHolder"
        :readOnly="true"
        :size="size"
        :placeholder="placeholder"
        :clearable="true"
        :clearValue="clearValue"
      />
      <template slot="content">
        <FPicker
          v-if="canShowPicker"
          v-model="modelValue"
          :columnList="columns"
        />
      </template>
    </FPopover>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FTags,
  FInput,
  FPopover,
  FPicker,
  FIcon,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import padStart from 'lodash/padStart'

export default {
  components: { FContainer, FInput, FTags, FPopover, FPicker, FIcon },
  props: ['value', 'placeholder', 'size'],
  data() {
    return {
      canShowPicker: false,
    }
  },
  computed: {
    modelValue: {
      get() {
        let { value } = this
        //doing this to avoid validation in intial load of the form
        if (isEmpty(value)) {
          return value || []
        }
        let days = Math.floor(value / (24 * 60 * 60 * 1000))
        value = value % (24 * 60 * 60 * 1000)
        let hrs = Math.floor(value / (60 * 60 * 1000))
        value = value % (60 * 60 * 1000)
        let mins = Math.floor(value / (60 * 1000))
        return [days, hrs, mins]
      },
      set(value) {
        value = this.getDurationValueInMs(value)
        this.$emit('input', value)
        let checkValid = getProperty(this, '$parent.checkValid')
        if (!isEmpty(checkValid)) checkValid()
      },
    },
    placeHolder() {
      let { modelValue, value } = this
      if (!isEmpty(value) && !isEmpty(modelValue) && value > 0) {
        let days = modelValue[0]
        let hrs = modelValue[1]
        let mins = modelValue[2]
        days = padStart(String(days), 2, '0')
        hrs = padStart(String(hrs), 2, '0')
        mins = padStart(String(mins), 2, '0')
        return `${days}D:${hrs}H:${mins}M`
      }
      return null
    },
    columns() {
      let { modelValue } = this
      modelValue = this.getDurationValueInMs(modelValue)
      let columns = [
        {
          title: 'DD',
          options: [],
        },
        {
          title: 'HH',
          options: [],
        },
        {
          title: 'MM',
          options: [],
        },
      ]
      columns.forEach((column, index) => {
        let title = column?.title
        let max = 0
        let initial = 0
        if (title === 'DD') {
          max = 31
        }
        if (title == 'HH') {
          max = 24
        }
        if (title === 'MM') {
          if (modelValue < 3600000) {
            initial = 5
          }
          max = 60
        }
        let options = []
        for (let i = 0; i < max; i++) {
          let label = i < 10 ? `0${i}` : `${i}`
          let option = { label, value: i }
          if (i < initial) {
            option.disabled = true
          }
          options[i] = option
        }
        columns[index] = { ...columns[index], options }
      })
      return columns
    },
  },
  methods: {
    clearValue() {
      this.modelValue = []
    },
    getDurationValueInMs(value) {
      if (!isEmpty(value)) {
        let [days = 0, hrs = 0, mins = 0] = value || []
        value =
          days * 24 * 60 * 60 * 1000 + hrs * 60 * 60 * 1000 + mins * 60 * 1000
      }
      return value
    },
  },
}
</script>
