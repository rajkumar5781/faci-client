<template>
  <FModal
    :title="getProperty(readingObj, 'field.displayName')"
    :visible="true"
    :confirmLoading="isSaving"
    cancelText=""
    :hideFooter="false"
    saveText=""
    @ok="addReadingValue"
    @cancel="closeDialog"
    size="S"
  >
    <FContainer
      display="flex"
      padding="containerXxLarge sectionLarge"
      marginLeft="sectionLarge"
      marginRight="sectionLarge"
      flexDirection="column"
      justifycontent="center"
      alignItems="flex-start"
      gap="sectionSmall"
    >
      <FContainer display="flex" flexDirection="column" alignItems="flex-start">
        <FContainer
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          gap="containerMedium"
          alignSelf="stretch"
        >
          <FText alignItems="center" color="textMain">{{ ReadingText }}</FText>
          <FContainer v-if="isDateOrDateTimeField">
            <FDatePicker
              v-model="readingObj.value"
              type="date-time-range"
              :timeFormat="{ is12Hour: true, interval: 15 }"
              :disabled="false"
              displayFormat="dd-MM-yyyy"
            />
          </FContainer>
          <FContainer v-else-if="isBooleanField(readingObj.field)">
            <FRadioGroup
              v-model="readingObj.value"
              :options="[
                { label: 'On', value: true },
                { label: 'Off', value: false },
              ]"
              alignment="horizontal"
            />
          </FContainer>
          <FContainer v-else-if="isEnumField(readingObj.field)">
            <FSelect
              v-model="readingObj.value"
              :options="fieldOptions"
              :multiple="false"
              :disabled="false"
              :filterable="false"
              :loading="false"
              size="medium"
            />
          </FContainer>
          <FContainer v-else>
            <FInput
              v-model="readingObj.value"
              appearance="default"
              size="medium"
              wrap
            />
          </FContainer>
        </FContainer>

        <FContainer
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          gap="containerMedium"
          alignSelf="stretch"
        >
          <FText alignItems="center" color="textMain">Time </FText>
          <FContainer>
            <FDatePicker
              ref="datepick"
              v-model="readingObj.ttime"
              @change="updateDuration"
              type="date-time"
              :timeFormat="{ is12Hour: true, interval: 15 }"
              :disabled="false"
              displayFormat="YYYY-MM-DD HH:mm"
            />
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
  </FModal>
</template>
<script>
import {
  FContainer,
  FText,
  FModal,
  FDatePicker,
  FInput,
  FSelect,
  FRadioGroup,
  ftoast,
} from '@facilio/design-system'

import {
  isBooleanField,
  isEnumField,
  isDateField,
  isDateTimeField,
} from '@facilio/utils/field'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import getProperty from 'dlv'

export default {
  props: ['reading', 'saveAction', 'closeAction', 'recordId', 'recordName'],
  components: {
    FContainer,
    FText,
    FModal,
    FDatePicker,
    FInput,
    FSelect,
    FRadioGroup,
  },
  data() {
    return {
      isSaving: false,
      readingObj: {},
    }
  },
  created() {
    this.readingObj = this.reading
    this.isBooleanField = isBooleanField
    this.isEnumField = isEnumField
  },
  computed: {
    fieldOptions() {
      let options = []

      this.readingObj.field &&
        this.readingObj.field.values.forEach(obj => {
          if (obj.visible) {
            options.push({
              id: obj.id,
              label: obj.value,
              value: Number(obj.index),
            })
          }
        })

      return options
    },
    isDateOrDateTimeField() {
      let { field } = this.readingObj || {}
      if (!isEmpty(field)) {
        return isDateField(field) || isDateTimeField(field)
      }
      return false
    },
    ReadingText() {
      return (
        'Enter Reading' +
        (this.readingObj.field.unit
          ? '(in ' + this.readingObj.field.unit + ')'
          : '')
      )
    },
  },
  methods: {
    getProperty,
    updateDuration() {
      if (!this.readingObj.ttime) {
        this.$nextTick(() => {
          this.$refs.datepick.focus()
        })
      }
    },
    addReadingValue() {
      if (this.readingObj.value !== null) {
        let currentTimestamp = new Date().getTime()

        let readingVal = {
          parentId: this.recordId,
          ttime:
            this.readingObj.ttime > currentTimestamp
              ? currentTimestamp
              : this.readingObj.ttime,
          readings: { [this.readingObj.field.name]: this.readingObj.value },
        }
        let data = {
          readingName: this.readingObj.readingName,
          readingValues: [readingVal],
        }

        this.isSaving = true

        API.post('/v2/readings/asset/add', data)
          .then(response => {
            if (!response.error) {
              ftoast.success(
                this.$t(
                  'asset.assets.reading_added_success',
                  'Reading added successfully',
                  { ns: 'asset' }
                )
              )

              this.saveAction(this.readingObj)
            } else {
              ftoast.critical(
                this.$t(
                  'asset.assets.readings_added_failed',
                  'Reading entry failed',
                  { ns: 'asset' }
                )
              )
            }
            this.isSaving = false
            this.closeDialog()
          })
          .catch(() => {
            ftoast.critical(
              this.$t(
                'asset.assets.readings_added_failed',
                'Reading entry failed',
                { ns: 'asset' }
              )
            )
            this.isSaving = false
          })
      }
    },
    closeDialog() {
      this.closeAction()
    },
  },
}
</script>
