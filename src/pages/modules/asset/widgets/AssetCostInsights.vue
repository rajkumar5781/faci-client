<template>
  <div>
    <FContainer v-if="loading" class="h-full flex items-center justify-center">
      <FSpinner :size="25" />
    </FContainer>
    <FContainer
      v-else-if="isEmpty(getFieldData) && !decommission"
      class="h-full flex items-center justify-center"
    >
      <FEmptyState
        title="No depreciation schedules configured."
        vertical
        size="S"
        illustration="no-entries"
      >
        <template #buttons>
          <FButton
            appearance="primary"
            size="small"
            @click="showAddDepreciationForm = true"
            >Apply Depreciation</FButton
          >
        </template>
      </FEmptyState>
    </FContainer>
    <FContainer
      v-else
      display="flex"
      padding="containerXxLarge"
      alignItems="center"
      alignSelf="stretch"
    >
      <FContainer
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        gap="sectionMedium"
      >
        <FContainer
          display="flex"
          width="403px"
          alignItems="flex-start"
          gap="containerMedium"
        >
          <FContainer
            display="flex"
            width="132px"
            flexDirection="column"
            justifyContent="center"
            alignItems="flex-start"
            gap="containerMedium"
          >
            <FContainer
              display="flex"
              alignItems="center"
              gap="containerLarge"
              alignSelf="stretch"
            >
              <FText color="textMain" appearance="captionMed12"
                >Current price</FText
              >
            </FContainer>
            <FText color="textDescription" appearance="bodyReg14">{{
              getFieldData.CurrentPrice
            }}</FText>
          </FContainer>

          <FContainer
            display="flex"
            width="132px"
            flexDirection="column"
            justifyContent="center"
            alignItems="flex-start"
            gap="containerMedium"
          >
            <FContainer
              display="flex"
              alignItems="center"
              gap="containerLarge"
              alignSelf="stretch"
            >
              <FText color="textMain" appearance="captionMed12"
                >Total price</FText
              >
            </FContainer>
            <FText color="textDescription" appearance="bodyReg14">{{
              getFieldData.TotalPrice
            }}</FText>
          </FContainer>

          <FContainer
            display="flex"
            width="132px"
            flexDirection="column"
            justifyContent="center"
            alignItems="flex-start"
            gap="containerMedium"
          >
            <FContainer
              display="flex"
              alignItems="center"
              gap="containerLarge"
              alignSelf="stretch"
            >
              <FText color="textMain" appearance="captionMed12"
                >Salvage price</FText
              >
            </FContainer>
            <FText color="textDescription" appearance="bodyReg14">
              {{ getFieldData.SalvagePrice }}</FText
            >
          </FContainer>
        </FContainer>

        <FContainer
          display="flex"
          width="403px"
          alignItems="flex-start"
          gap="containerMedium"
        >
          <FContainer
            display="flex"
            width="132px"
            flexDirection="column"
            justifyContent="center"
            alignItems="flex-start"
            gap="containerMedium"
          >
            <FContainer
              display="flex"
              alignItems="center"
              gap="containerLarge"
              alignSelf="stretch"
            >
              <FText color="textMain" appearance="captionMed12"
                >Start Date</FText
              >
            </FContainer>
            <FText color="textDescription" appearance="bodyReg14">
              {{ getFieldData.StartDate }}
            </FText>
          </FContainer>

          <FContainer
            display="flex"
            width="132px"
            flexDirection="column"
            justifyContent="center"
            alignItems="flex-start"
            gap="containerMedium"
          >
            <FContainer
              display="flex"
              alignItems="center"
              gap="containerLarge"
              alignSelf="stretch"
            >
              <FText color="textMain" appearance="captionMed12"
                >Expected life of asset</FText
              >
            </FContainer>
            <FText color="textDescription" appearance="bodyReg14">{{
              getFieldData.ExpectedLifeofAsset
            }}</FText>
          </FContainer>
        </FContainer>

        <FContainer
          display="flex"
          width="132px"
          flexDirection="column"
          justifyContent="center"
          alignItems="flex-start"
          gap="containerMedium"
        >
          <FContainer
            display="flex"
            alignItems="center"
            gap="containerLarge"
            alignSelf="stretch"
          >
            <FText color="textMain" appearance="captionMed12"
              >Expected life of remaining</FText
            >
          </FContainer>
          <FText color="textDescription" appearance="bodyReg14">{{
            getFieldData.ExpectedLifeRemaining
          }}</FText>
        </FContainer>
      </FContainer>
    </FContainer>
    <AddAssetDepreciationForm
      v-if="showAddDepreciationForm"
      :asset="details"
      @fetchAssetDetail="init()"
      @onClose="showAddDepreciationForm = false"
    ></AddAssetDepreciationForm>
  </div>
</template>
<script>
import {
  FContainer,
  FSpinner,
  FEmptyState,
  FText,
  FButton,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import AddAssetDepreciationForm from './AddAssetDepreciationForm.vue'
import {
  getCurrency,
  formatCustomDate,
  getDurationSince,
  getDurationObject,
  getDurationOfMY,
} from '../../../../utils/formatter'
import getProperty from 'dlv'

export default {
  props: ['details', 'widget'],
  data() {
    return {
      loading: true,
      depreciation: null,
      moduleMeta: null,
      showAddDepreciationForm: false,
    }
  },
  components: {
    FContainer,
    FSpinner,
    FEmptyState,
    FText,
    FButton,
    AddAssetDepreciationForm,
  },
  created() {
    this.init()
  },
  computed: {
    decommission() {
      return getProperty(this, 'details.decommission', false)
    },
    expectedLife() {
      let { frequencyType, frequency } = this.depreciation || {}

      if (!isEmpty(frequency) && !isEmpty(frequencyType)) {
        if (frequencyType === 1) {
          let years = parseInt(frequency / 12)
          let months = frequency % 12
          let expectedLife = ''

          expectedLife += years ? `${years} Year(s) ` : ''
          expectedLife += months ? `${months} Month(s)` : ''

          return expectedLife
        } else if (frequencyType === 2) {
          let years = parseInt(frequency / 4)
          let months = (frequency % 4) * 3
          let expectedLife = ''

          expectedLife += years ? `${years} Year(s) ` : ''
          expectedLife += months ? `${months} Month(s)` : ''

          return expectedLife
        } else if (frequencyType === 3) {
          let years = parseInt(frequency / 2)
          let months = (frequency % 2) * 6
          let expectedLife = ''

          expectedLife += years ? `${years} Year(s) ` : ''
          expectedLife += months ? `${months} Month(s)` : ''

          return expectedLife
        } else if (frequencyType === 4) {
          return `${frequency} Year(s)`
        }
      }

      return '---'
    },

    constructRemainingTime() {
      let { depreciation, details } = this
      let fields = getProperty(this.moduleMeta, 'fields', null)

      if (!isEmpty(depreciation) && !isEmpty(fields)) {
        let startDateField =
          details[
            (
              fields.find(
                field => field.id === depreciation.startDateFieldId
              ) || {}
            ).name || ''
          ]

        let expiredTime = getDurationSince(startDateField)
        let { frequencyType, frequency } = depreciation
        let constructExpectedLife

        if (frequencyType === 1) {
          constructExpectedLife = getDurationObject(frequency, 'M')
        } else if (frequencyType === 2) {
          let years = parseInt(frequency / 4)
          let months = (frequency % 4) * 3

          constructExpectedLife = {
            M: months,
            y: years,
          }
        } else if (frequencyType === 3) {
          let years = parseInt(frequency / 2)
          let months = (frequency % 2) * 6

          constructExpectedLife = getDurationOfMY({ months, years })
        } else if (frequencyType === 4) {
          constructExpectedLife = getDurationObject(frequency, 'y')
        }

        let remainingTime = constructExpectedLife.subtract(expiredTime)

        let { _data = {} } = remainingTime || {}
        let remainingPeriod = ''

        remainingPeriod += _data.years > 0 ? `${_data.years} Year(s) ` : ''
        remainingPeriod += _data.months > 0 ? `${_data.months} Month(s)` : ''
        if (!isEmpty(remainingPeriod)) return remainingPeriod
      }

      return '---'
    },

    getFieldData() {
      let fieldData = {}
      let { depreciation, details } = this
      let currency = getCurrency()
      let fields = getProperty(this.moduleMeta, 'fields', null)
      if (!isEmpty(depreciation) && !isEmpty(fields)) {
        fieldData['CurrentPrice'] = !isEmpty(details.currentPrice)
          ? ['$', '₹'].includes(currency)
            ? `${currency}${details.currentPrice}`
            : `${details.currentPrice}${currency}`
          : '---'
        fieldData['TotalPrice'] = !isEmpty(details.unitPrice)
          ? ['$', '₹'].includes(currency)
            ? `${currency}${details.unitPrice}`
            : `${details.unitPrice}${currency}`
          : '---'
        fieldData['SalvagePrice'] = !isEmpty(details.salvageAmount)
          ? ['$', '₹'].includes(currency)
            ? `${currency}${details.salvageAmount}`
            : `${details.salvageAmount}${currency}`
          : ['$', '₹'].includes(currency)
            ? `${currency}0`
            : `0${currency}`

        let startDateField =
          details[
            (
              fields.find(
                field => field.id === depreciation.startDateFieldId
              ) || {}
            ).name || ''
          ]

        fieldData['StartDate'] = startDateField
          ? formatCustomDate(startDateField, 'MMM YYYY')
          : '---'
        fieldData['ExpectedLifeofAsset'] = this.expectedLife
        fieldData['ExpectedLifeRemaining'] = this.constructRemainingTime
      }

      return fieldData
    },
  },

  methods: {
    isEmpty,
    async init() {
      this.loading = true
      await this.getModuleMeta()
      await this.getDepreciation()
      this.loading = false
    },
    async getModuleMeta() {
      let { data } = await API.get(`/module/meta?moduleName=asset`)
      this.moduleMeta = data?.meta || {}
    },
    async getDepreciation() {
      let url = 'v2/asset/depreciation/getForAsset'
      let param = { assetId: this.details.id }

      let { data } = await API.post(url, param)
      this.depreciation = data?.assetdepreciation || {}
    },
  },
}
</script>
