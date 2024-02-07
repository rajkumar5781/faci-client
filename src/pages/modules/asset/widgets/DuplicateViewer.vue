<template>
  <div>
    <FModal
      :title="moduleName + ' Duplication'"
      :visible="visible"
      :confirmLoading="saving"
      saveText="Save"
      size="M"
      :hideFooter="false"
      @ok="actionSave()"
      @cancel="actioncancel()"
      padding="containerLarge"
    >
      <FContainer
        height="50%"
        display="flex"
        flexDirection="column"
        gap="containerXxLarge"
        padding="containerXxLarge"
      >
        <div>
          <FContainer
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            gap="containerMedium"
          >
            <FText color="textMain" appearance="captionReg12">
              {{ $t('asset.name', 'Name', { ns: 'asset' }) }}
            </FText>
            <FInput
              v-model="duplicateObj.name"
              appearance="default"
              size="medium"
              wrap
            />
          </FContainer>

          <FContainer
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            gap="containerMedium"
          >
            <FText color="textMain" appearance="captionReg12">
              Starting Number
            </FText>
            <FInput
              v-model="startingNumber"
              type="number"
              appearance="default"
              size="medium"
              wrap
            />
          </FContainer>

          <FContainer
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            gap="containerMedium"
          >
            <FText color="textMain" appearance="captionReg12"> Quantity </FText>
            <FInput
              v-model="duplicateObj.quantity"
              type="number"
              appearance="default"
              size="medium"
              wrap
            />
          </FContainer>

          <FContainer
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            gap="containerMedium"
          >
            <FText color="textMain" appearance="captionReg12"> Prefix </FText>
            <FInput
              v-model="duplicateObj.prefix"
              appearance="default"
              size="medium"
              wrap
            />
          </FContainer>

          <FContainer
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            gap="containerMedium"
          >
            <FText color="textMain" appearance="captionReg12"> Suffix </FText>
            <FInput
              v-model="duplicateObj.sufix"
              appearance="default"
              size="medium"
              wrap
            />
          </FContainer>
        </div>
      </FContainer>
    </FModal>
  </div>
</template>

<script>
import { isEmpty } from '@facilio/utils/validation'
import {
  FContainer,
  FText,
  FModal,
  FInput,
  ftoast,
} from '@facilio/design-system'
import { API } from '@facilio/api'

export default {
  components: { FContainer, FText, FModal, FInput },

  data() {
    return {
      visible: true,
      saving: false,
      error: false,
      errorText: '',
      startingNumber: 1,
      duplicateObj: {
        name: null,
        quantity: '1',
        prefix: null,
        sufix: null,
      },
    }
  },

  computed: {
    records() {
      let { duplicateObj, startingNumber } = this
      let recordList = []
      if (!isEmpty(duplicateObj.name)) {
        for (let i = 0; i < duplicateObj.quantity; i++) {
          let value =
            (!isEmpty(duplicateObj.prefix) ? duplicateObj.prefix + ' ' : '') +
            (!isEmpty(duplicateObj.name) ? duplicateObj.name : '') +
            (!isEmpty(startingNumber) && startingNumber > 0 ? ' ' : '') +
            (!isEmpty(startingNumber) && startingNumber > 0
              ? startingNumber
              : '') +
            (!isEmpty(duplicateObj.sufix) ? ' ' + duplicateObj.sufix : '')
          if (value.length > 0) {
            recordList.push(value)
          }
          startingNumber++
        }
      }
      return recordList
    },
  },
  watch: {
    selectedRecordObj(newVal, oldVal) {
      if (newVal && oldVal !== newVal) {
        this.init()
      }
    },
    visible(newVal, oldVal) {
      if (!newVal) {
        this.actioncancel()
      }
    },
    'duplicateObj.quantity'(newData) {
      if (newData > 100) {
        this.errorText = 'Quantity should not exceed 100'
        this.error = true
      } else {
        this.error = false
      }
    },
  },
  mounted() {
    this.init()
  },
  props: ['moduleName', 'selectedRecord', 'selectedRecordObj', 'listName'],
  methods: {
    init() {
      if (this.selectedRecordObj) {
        this.$set(
          this.duplicateObj,
          'name',
          !isEmpty(this.selectedRecordObj) ? this.selectedRecordObj.name : null
        )
      }
    },
    actioncancel() {
      this.$emit('closed')
    },
    actionSave() {
      let { moduleName, startingNumber, selectedRecord, duplicateObj } = this
      this.validation()
      if (this.error) return
      this.saving = true
      let url = '/v2/module/recordsDuplication'
      let params = {
        moduleName: moduleName,
        id: selectedRecord,
        startingNumber: parseInt(startingNumber),
        duplicateObj,
      }
      API.post(url, params).then(response => {
        console.log('response---', response)
        if (isEmpty(response.error)) {
          ftoast.success(moduleName + ' duplicated successfully')
          this.saving = false
          this.$emit('sucess')
          this.$emit('closed')
        } else {
          ftoast.critical('Export failed')
          this.$emit('closed')
        }
      })
    },
    validation() {
      if (isEmpty(this.duplicateObj.name)) {
        this.errorText = 'Please enter the name'
        this.error = true
      } else if (isEmpty(this.duplicateObj.quantity)) {
        this.errorText = 'Please enter the quantity'
        this.error = true
      } else if (
        !isEmpty(this.duplicateObj.quantity) &&
        this.duplicateObj.quantity > 100
      ) {
        this.errorText = 'Quantity should not exceed 100'
        this.error = true
      } else if (isEmpty(this.startingNumber)) {
        this.errorText = 'Please enter the startingNumber'
        this.error = true
      } else {
        this.errorText = ''
        this.error = false
      }
    },
  },
}
</script>
