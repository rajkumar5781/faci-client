<template>
  <FContainer height="100%">
    <FContainer
      v-if="loading"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <FSpinner :size="25" />
    </FContainer>
    <FContainer
      height="100%"
      display="flex"
      justifyContent="center"
      v-else-if="isEmpty(depreciationTable)"
    >
      <FContainer height="100%" display="flex" justifyContent="center">
        <FContainer
          display="flex"
          justifyContent="center"
          width="500px"
          height="100%"
        >
          <FEmptyState
            title=" No depreciation schedule applied."
            vertical
            size="S"
            illustration="no-entries"
          />
        </FContainer>
      </FContainer>
    </FContainer>

    <FContainer v-else>
      <FTable :rounded="false" :columns="getColumn()" :data="getData()">
      </FTable>
    </FContainer>
  </FContainer>
</template>
<script>
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import {
  FContainer,
  FSpinner,
  FText,
  FTable,
  FEmptyState,
} from '@facilio/design-system'
import {
  formatCustomDate,
  getCurrency,
  getDateInstance,
  getTimeZone,
} from '../../../../utils/formatter'
import dayjs from 'dayjs'

export const DEPRECIATION_TYPES = {
  1: 'Straight Line',
  2: 'Double Declining Balance',
}

export const FREQUENCY_TYPES = {
  MONTHLY: { label: 'Monthly', id: 1 },
  QUARTERLY: { label: 'Quarterly', id: 2 },
  HALFYEARLY: { label: 'Half Yearly', id: 3 },
  YEARLY: { label: 'Yearly', id: 4 },
}

export const QUARTERLY_FREQUENCY = {
  FIRSTHALFYEAR: [1, 2],
  SECONDHALFYEAR: [3, 4],
}

export default {
  props: ['details', 'widget', 'selectedDepreciationId', 'showMethod'],
  components: { FContainer, FSpinner, FText, FTable, FEmptyState },

  data() {
    return {
      depreciationSchedule: null,
      depreciation: null,
      loading: false,
      column: [
        {
          displayName: 'MONTHLY',
          name: 'displayName',
          id: 1,
          fixed: true,
        },
        {
          displayName: 'AUG 2023',
          name: 'col0',
          id: 2,
          resize: true,
          width: 200,
        },
        {
          displayName: 'SEP 2023',
          name: 'col1',
          id: 3,
          width: 250,
          clickable: true,
        },
      ],
    }
  },

  created() {
    if (isEmpty(this.selectedDepreciationId)) {
      this.getDepreciation()
    } else {
      this.fetchDepreciation()
    }
  },

  computed: {
    depreciationTable() {
      let tableData = []
      let { depreciationSchedule, depreciation } = this

      let currency = getCurrency()
      let timezone = getTimeZone()

      if (!isEmpty(depreciationSchedule) && !isEmpty(depreciation)) {
        let listObjKeys = [
          'calculatedDate',
          'openPrice',
          'depreciatedAmount',
          'currentPrice',
        ]

        listObjKeys.forEach(key => {
          let columnData = {}

          if (key === 'calculatedDate') {
            depreciationSchedule.forEach((listData, index) => {
              columnData[`col${index}`] = formatCustomDate(
                listData[key],
                'MMM YYYY'
              ).toUpperCase()
            })
          } else if (key === 'openPrice') {
            columnData['col0'] = ['$', '₹'].includes(currency)
              ? `${currency}${this.details.unitPrice}`
              : `${this.details.unitPrice}${currency}`

            depreciationSchedule.forEach((listData, idx) => {
              let index = idx + 1

              if (index !== depreciationSchedule.length) {
                if (['$', '₹'].includes(currency))
                  columnData[
                    `col${index}`
                  ] = `${currency}${listData['currentPrice']}`
                else
                  columnData[
                    `col${index}`
                  ] = `${listData['currentPrice']}${currency}`
              }
            })
          } else {
            depreciationSchedule.forEach((listData, index) => {
              if (['$', '₹'].includes(currency))
                columnData[`col${index}`] = `${currency}${listData[key]}`
              else columnData[`col${index}`] = `${listData[key]}${currency}`
            })
          }

          tableData.push(columnData)
        })

        let data = ['Opening Book Value', 'Depreciation', 'Ending Book Value']
        let { frequencyTypeEnum } = depreciation || {}

        data.splice(0, 0, frequencyTypeEnum)
        data.forEach((data, index) => {
          tableData[index].displayName = data
        })
      }

      return tableData
    },

    currentDepreciationDate() {
      let { depreciation, frequencyTypes } = this
      let today = dayjs()
      let dateToCompare = []

      if (!isEmpty(depreciation)) {
        let { frequencyType } = depreciation

        if (frequencyType === frequencyTypes.MONTHLY) {
          dateToCompare.push(today.month())
        } else if (
          [frequencyTypes.QUARTERLY, frequencyTypes.HALFYEARLY].includes(
            frequencyType
          )
        ) {
          let quarterDate = today.quarter()

          if (frequencyType === frequencyTypes.HALFYEARLY) {
            if (QUARTERLY_FREQUENCY.FIRSTHALFYEAR.includes(quarterDate)) {
              quarterDate = 1
            } else if (
              QUARTERLY_FREQUENCY.SECONDHALFYEAR.includes(quarterDate)
            ) {
              quarterDate = 2
            }
          }

          dateToCompare.push(quarterDate)
        }

        dateToCompare.push(today.year())
      }

      return dateToCompare
    },

    currentDepreciationCol() {
      let {
        currentDepreciationDate,
        depreciation,
        depreciationSchedule,
        frequencyTypes,
      } = this
      let currentCol = null

      if (!isEmpty(currentDepreciationDate)) {
        depreciationSchedule.forEach((listData, index) => {
          let dateRange = getDateInstance(listData['date'])
          let { frequencyType } = depreciation
          let currentDateValue = []

          if (frequencyType === frequencyTypes.MONTHLY) {
            currentDateValue.push(dateRange.month())
          } else if (
            [frequencyTypes.QUARTERLY, frequencyTypes.HALFYEARLY].includes(
              frequencyType
            )
          ) {
            let quarterDate = dateRange.quarter()

            if (frequencyType === frequencyTypes.HALFYEARLY) {
              if (QUARTERLY_FREQUENCY.FIRSTHALFYEAR.includes(quarterDate)) {
                quarterDate = 1
              } else if (
                QUARTERLY_FREQUENCY.SECONDHALFYEAR.includes(quarterDate)
              ) {
                quarterDate = 2
              }
            }

            currentDateValue.push(quarterDate)
          }

          currentDateValue.push(dateRange.year())

          if (
            currentDepreciationDate.toString() === currentDateValue.toString()
          ) {
            currentCol = index + 1
          }
        })
      }

      return currentCol
    },

    frequencyTypes() {
      return Object.keys(FREQUENCY_TYPES).reduce((res, freq) => {
        res[freq] = FREQUENCY_TYPES[freq].id

        return res
      }, {})
    },

    canShowMethod() {
      let { depreciation, depreciationTable, showMethod } = this

      return !isEmpty(depreciation) && !isEmpty(depreciationTable) && showMethod
    },

    depreciationMethod() {
      let {
        depreciation: { depreciationType = 1 },
      } = this

      return DEPRECIATION_TYPES[depreciationType.toString()]
    },
  },

  watch: {
    selectedDepreciationId: {
      handler(newValue, oldValue) {
        if (newValue && newValue !== oldValue) {
          this.fetchDepreciation()
        }
      },
      immediate: true,
    },
  },

  methods: {
    isEmpty,
    getColumn() {
      let originalData = this.depreciationTable
      let firstObject = originalData[0]
      let columns = []
      columns.push({
        displayName: firstObject['displayName'],
        name: 'displayName',
        id: columns.length + 1,
      })
      for (let key in firstObject) {
        if (key !== 'displayName') {
          columns.push({
            displayName: firstObject[key],
            name: key,
            id: columns.length + 1, // Assuming you want unique IDs
            // Add additional properties as needed
          })
        }
      }
      return columns
    },
    getData() {
      this.depreciationTable.shift()
      return this.depreciationTable
    },
    getDepreciation() {
      let url = 'v2/asset/depreciation/getForAsset'
      let param = { assetId: this.details.id }

      this.loading = true
      API.post(url, param).then(({ data, error }) => {
        if (data) {
          this.depreciation = data.assetdepreciation

          if (!isEmpty(this.depreciation)) {
            let { depreciation } = this
            let { assetDepreciationRelList = [] } = depreciation || {}
            this.$emit('appliedDepreciationId', depreciation.id)
            this.$emit('depreciationRel', assetDepreciationRelList[0])
            this.fetchTableList()
          } else {
            this.loading = false
          }
        }
      })
    },

    fetchTableList() {
      let url = 'v2/asset/depreciation/chart'
      let id = this.depreciation.id
      let params = { id, assetId: this.details.id }

      API.post(url, params).then(({ data, error }) => {
        if (data) {
          this.depreciationSchedule = data.depreciationList || []
        }
        this.loading = false
      })
    },

    fetchDepreciation() {
      let param = { id: this.selectedDepreciationId }

      this.loading = true
      API.fetchRecord('assetdepreciation', param).then(
        ({ assetdepreciation, error }) => {
          if (assetdepreciation) {
            this.depreciation = assetdepreciation
            this.fetchTableList()
          }
        }
      )
    },

    rowStyle(rowObject) {
      let { rowIndex } = rowObject

      if (rowIndex === 0) return 'bold-row'
      else if (rowIndex === 2) return 'border-top'
    },

    cellStyle(cellObject) {
      let { rowIndex, columnIndex } = cellObject
      let { currentDepreciationCol } = this
      let cellClass = ''

      if (columnIndex === currentDepreciationCol) {
        cellClass = 'high-light-background current-border-left-and-right'

        if (rowIndex === 0) {
          cellClass += ' current-border-top'
        } else if (rowIndex === 3) {
          cellClass += ' current-border-bottom'
        }
      }

      return cellClass
    },
  },
}
</script>
<style lang="scss">
.depreciation-list {
  .bold-row {
    td {
      font-weight: 500 !important;
      border-top: 1px solid #f2f5f6;
    }
  }
  .border-top {
    td {
      border-bottom: 1px solid #b0d9de;
    }
  }
  .high-light-background {
    background-color: #f9feff;
  }
  .current-border-top {
    border-top: solid 1px #9ed6dd !important;
  }
  .current-border-bottom {
    border-bottom: solid 1px #9ed6dd !important;
  }
  .current-border-left-and-right {
    border-left: solid 1px #9ed6dd;
    border-right: solid 1px #9ed6dd;
  }
  .lines {
    height: 23px;
    border-radius: 5px;
    margin: 12px 20px 12px 20px;
  }
  .width210px {
    width: 210px;
  }
  .mL-20 {
    margin-left: -20px;
  }
}
</style>
