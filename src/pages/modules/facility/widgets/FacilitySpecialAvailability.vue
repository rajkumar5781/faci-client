<template>
  <FContainer height="100%" overflowY="scroll">
    <portal :to="`header-${widget.id}-${widget.name}`">
      <FContainer
        width="100%"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        padding="containerLarge"
      >
        <FContainer>
          <FText
            appearance="headingMed14"
            color="backgroundNeutralInverseHovered"
          >
            {{
              widget.displayName ||
              $t('facility.special_availability.special_availabilities', {
                ns: 'facilitybooking',
              })
            }}
          </FText>
        </FContainer>
        <FContainer>
          <FButton
            appearance="secondary"
            size="small"
            iconGroup="navigation"
            iconName="addition"
            iconPosition="prefix"
            @click="addSpecialAvailability()"
          >
            {{
              $t('facility.special_availability.add_special_avaialbility', {
                ns: 'facilitybooking',
              })
            }}
          </FButton>
        </FContainer>
      </FContainer>
    </portal>

    <FContainer>
      <FContainer v-if="loading">
        <FSpinner :size="30"></FSpinner>
      </FContainer>
      <FContainer v-if="!loading && !isEmpty(specialAvailabilityList)">
        <FTable
          :columns="column"
          :data="data"
          :rounded="false"
          :hideBorder="false"
        />
      </FContainer>
      <FContainer
        v-else
        paddingTop="sectionLarge"
        width="100%"
        height="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <FEmptyState
          :illustration="'no-entries'"
          :title="
            $t('facility.special_availability.no_special_availabilities', {
              ns: 'facilitybooking',
            })
          "
          :size="'M'"
          :vertical="true"
        ></FEmptyState>
      </FContainer>
    </FContainer>
    <FContainer v-if="showPopup" :key="popupKey">
      <FModal
        :title="
          $t('facility.special_availability.special_availability', {
            ns: 'facilitybooking',
          })
        "
        :visible="showPopup"
        :saveText="'Save'"
        size="M"
        :hideFooter="false"
        @ok="saveSpecialAvailability"
        @cancel="handleCancel"
      >
        <FContainer
          padding="containerXLarge"
          backgroundColor="backgroundPrimaryDefault"
          display="flex"
        >
          <FContainer
            paddingRight="containerLarge"
            paddingTop="containerMedium"
            display="flex"
          >
            <FIcon
              group="alert"
              name="circle-warning"
              size="24"
              :pressable="false"
              color="backgroundContainer"
            />
          </FContainer>
          <FContainer>
            <FContainer>
              <FText
                appearance="bodyReg14"
                color="backgroundNeutralGrey01Subtle"
              >
                {{
                  $t('facility.special_availability.first_info', {
                    ns: 'facilitybooking',
                  })
                }}
              </FText>
            </FContainer>
            <FContainer>
              <FText
                appearance="bodyReg14"
                color="backgroundNeutralGrey01Subtle"
              >
                {{
                  $t('facility.special_availability.second_info', {
                    ns: 'facilitybooking',
                  })
                }}
              </FText>
            </FContainer>
          </FContainer>
        </FContainer>
        <FContainer marginLeft="sectionLarge" marginRight="sectionLarge">
          <FForm
            ref="facility-special-availability"
            :model="formModel"
            position="top"
            :rules="rules"
          >
            <FContainer display="flex" padding="containerXxLarge">
              <FContainer width="93%">
                <FFormItem
                  :label="
                    $t('facility.special_availability.remarks', {
                      ns: 'facilitybooking',
                    })
                  "
                  prop="remarks"
                  :hideLabel="false"
                  id="facility-special-availability-remarks"
                  :required="true"
                >
                  <FInput
                    v-model="formModel.remarks"
                    :appearance="'default'"
                    :placeholder="'Enter here'"
                    :disabled="false"
                    :size="'large'"
                  />
                </FFormItem>
              </FContainer>
            </FContainer>
            <FContainer display="flex" padding="containerXxLarge">
              <FContainer width="45%">
                <FFormItem
                  :label="
                    $t('facility.special_availability.type', {
                      ns: 'facilitybooking',
                    })
                  "
                  prop="specialType"
                  :hideLabel="false"
                  id="facility-special-availability-type"
                  :required="true"
                >
                  <FSelect
                    v-model="formModel.specialType"
                    placeholder="Enter here"
                    :options="typeList"
                    size="large"
                  >
                  </FSelect>
                </FFormItem>
              </FContainer>
              <FContainer marginLeft="containerXxLarge" width="45%">
                <FFormItem
                  :label="
                    $t('facility.special_availability.date', {
                      ns: 'facilitybooking',
                    })
                  "
                  prop="date"
                  :hideLabel="false"
                  id="facility-special-availability-date"
                  :required="true"
                >
                  <FDatePicker
                    placeholder="Select a date"
                    :value="formModel.date"
                    type="date"
                    :disabled="false"
                    displayFormat="YYYY-MM-DD HH:mm"
                    :timeFormat="{ is12Hour: true, interval: 15 }"
                    @change="setDate"
                  />
                </FFormItem>
              </FContainer>
            </FContainer>
            <FContainer display="flex" padding="containerXxLarge">
              <FContainer width="45%">
                <FFormItem
                  :label="
                    $t('facility.special_availability.startTime', {
                      ns: 'facilitybooking',
                    })
                  "
                  prop="startTime"
                  :hideLabel="false"
                  id="facility-special-availability-starttime"
                  :required="true"
                >
                  <FTimePicker
                    :placeholder="'Select Start Time'"
                    v-model="formModel.startTime"
                    :is12Hour="true"
                    :interval="30"
                    :readOnly="false"
                    :disabled="false"
                    @change="setStartTime"
                  />
                </FFormItem>
              </FContainer>
              <FContainer marginLeft="containerXxLarge" width="45%">
                <FFormItem
                  :label="
                    $t('facility.special_availability.endTime', {
                      ns: 'facilitybooking',
                    })
                  "
                  prop="endTime"
                  :hideLabel="false"
                  id="facility-special-availability-endtime"
                  :required="true"
                >
                  <FTimePicker
                    :placeholder="'Select End Time'"
                    v-model="formModel.endTime"
                    :is12Hour="true"
                    :interval="30"
                    :readOnly="false"
                    :disabled="false"
                    @change="setEndTime"
                  />
                </FFormItem>
              </FContainer>
            </FContainer>
            <FContainer
              display="flex"
              padding="containerXxLarge"
              v-if="formModel.specialType === 1"
            >
              <FContainer width="45%">
                <FFormItem
                  :label="
                    $t('facility.special_availability.cost', {
                      ns: 'facilitybooking',
                    })
                  "
                  prop="cost"
                  :hideLabel="false"
                  id="facility-special-availability-cost"
                  :required="false"
                >
                  <FInput
                    v-model="formModel.cost"
                    :appearance="'default'"
                    :placeholder="'Enter here'"
                    :disabled="false"
                    :size="'large'"
                    :type="'number'"
                  />
                </FFormItem>
              </FContainer>
              <FContainer
                v-if="!isEmpty(formModel.cost)"
                marginLeft="containerXxLarge"
                width="45%"
                display="flex"
                alignItems="center"
              >
                <FFormItem
                  :label="''"
                  prop="cancelOnCostChange"
                  :hideLabel="false"
                  id="facility-special-availability-cancelbooking"
                  :required="false"
                >
                  <FCheckbox
                    :disabled="false"
                    v-model="formModel.cancelOnCostChange"
                    :indeterminate="false"
                  >
                    <FText
                      appearance="captionReg12"
                      color="backgroundNeutralInverseHovered"
                    >
                      {{
                        $t(
                          'facility.special_availability.cancel_booking_for_cost_change',
                          {
                            ns: 'facilitybooking',
                          }
                        )
                      }}
                    </FText>
                  </FCheckbox>
                </FFormItem>
              </FContainer>
            </FContainer>
          </FForm>
        </FContainer>
      </FModal>
    </FContainer>
    <portal
      :to="`footer-${widget.id}-${widget.name}`"
      v-if="!isEmpty(specialAvailabilityList)"
    >
      <FContainer padding="containerLarge">
        <FPagination
          :pageSize="pageSize"
          :total="totalRecords"
          :currentPage="currentPage"
          :disabled="disabled"
          @nextClick="currentChange"
          @prevClick="currentChange"
          @currentChange="currentChange"
        />
      </FContainer>
    </portal>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FIcon,
  FButton,
  FTable,
  FPagination,
  FEmptyState,
  FModal,
  FForm,
  FSelect,
  FFormItem,
  FInput,
  FDatePicker,
  FTimePicker,
  FCheckbox,
  ftoast,
  FSpinner,
} from '@facilio/design-system'
import getProperty from 'dlv'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import moment from 'moment-timezone'
import { getOrgMoment } from '../../../../pages/modules/readingrule/util'

export default {
  props: ['widget', 'details', 'resizeWidgetOnPage'],
  components: {
    FContainer,
    FText,
    FIcon,
    FButton,
    FTable,
    FPagination,
    FEmptyState,
    FModal,
    FForm,
    FSelect,
    FFormItem,
    FInput,
    FDatePicker,
    FTimePicker,
    FCheckbox,
    ftoast,
    FSpinner,
  },
  data() {
    return {
      typeList: [
        { label: 'Special Availability', value: 1 },
        { label: 'Special Unavailability', value: 2 },
      ],
      formModel: {
        specialType: null,
        remarks: null,
        date: null,
        startTime: null,
        endTime: null,
        cost: null,
        cancelOnCostChange: null,
      },
      rules: {
        specialType: [
          {
            required: true,
            message: this.$t('facility.special_availability.type', {
              ns: 'facilitybooking',
            }),
            trigger: 'change',
          },
        ],
        remarks: [
          {
            required: true,
            message: this.$t('facility.special_availability.remarks', {
              ns: 'facilitybooking',
            }),
            trigger: 'change',
          },
        ],
        date: [
          {
            required: true,
            message: this.$t('facility.special_availability.date', {
              ns: 'facilitybooking',
            }),
            trigger: 'change',
          },
        ],
        formStartTime: [
          {
            required: true,
            message: this.$t('facility.special_availability.startTime', {
              ns: 'facilitybooking',
            }),
            trigger: 'change',
          },
        ],
        endTime: [
          {
            required: true,
            message: this.$t('facility.special_availability.endTime', {
              ns: 'facilitybooking',
            }),
            trigger: 'change',
          },
        ],
      },
      column: [
        {
          displayName: 'Type',
          name: 'specialTypeEnum',
          id: 1,
          width: 250,
          fixed: true,
        },
        { displayName: 'Remark', name: 'remarks', id: 2, width: 250 },
        {
          displayName: 'Start Date',
          name: 'startDate',
          id: 3,
          width: 250,
        },
        {
          displayName: 'Start Time',
          name: 'startTime',
          id: 4,
          width: 250,
        },
        {
          displayName: 'End Time',
          name: 'endTime',
          id: 5,
          width: 250,
        },
        {
          displayName: 'Cost',
          name: 'cost',
          id: 6,
          width: 250,
        },
      ],
      data: [],
      formVisibility: false,
      specialAvailabilityList: [],
      pageSize: 5,
      totalPage: 1,
      pageCount: 1,
      currentPage: 1,
      totalRecords: 0,
      disabled: false,
      loading: false,
      showPopup: false,
      startTime: null,
      endTime: null,
      loading: false,
      formStartTime: null,
      formEndTime: null,
      popupKey: 1,
    }
  },
  created() {
    this.loadRelatedRecords()
  },
  methods: {
    isEmpty,
    async addSpecialAvailability() {
      this.popupKey += 1
      this.showPopup = true
    },
    toggleFormVisibility() {
      this.formVisibility = true
    },
    refreshDetails() {
      eventBus.$emit('refesh-parent')
    },
    async loadRelatedRecords() {
      this.data = []
      this.specialAvailabilityList = []
      let recordFilter = {
        facility: { operatorId: 36, value: [`${this.details.id}`] },
      }
      let { currentPage, pageSize } = this

      let params = {
        page: currentPage,
        perPage: pageSize,
        withCount: true,
        viewName: 'all',
        force: false,
        moduleName: 'facilitySpecialAvailability',
        filters: JSON.stringify(recordFilter),
      }

      let url = 'v3/modules/data/list'
      this.loading = true
      let { data, error, meta } = await API.get(url, params)
      if (error) {
        let { message = 'Error loading special availability list' } = error
        this.$message.error(message)
      } else {
        let { facilitySpecialAvailability } = data || {}
        this.specialAvailabilityList = facilitySpecialAvailability

        let { specialAvailabilityList = [] } = this
        let datas = specialAvailabilityList.map(data => {
          let {
            remarks,
            startDate,
            startTime,
            endTime,
            cost = 0,
            specialTypeEnum,
            specialType,
          } = data || {}

          let result = {
            ...data,
            remarks,
            startDate: this.getFormattedValueForMillis(startDate, 'DD MMM'),
            startTime,
            endTime,
            cost: specialType === 1 ? cost : 'N/A',
            specialTypeEnum: specialType === 1 ? specialTypeEnum : 'N/A',
          }

          return result
        })

        this.data = datas
        let { pagination } = meta || {}
        let totalCount = getProperty(pagination, 'totalCount', 0)
        let totalPage = this.getTotalPage(totalCount)

        this.totalRecords = totalCount
        this.totalPage = totalPage
      }
      this.loading = false
    },
    currentChange(page) {
      this.currentPage = page
      this.loadRelatedRecords()
    },
    getTotalPage(totalRecords) {
      if (totalRecords > 0) {
        let count = totalRecords / 5
        let result = Math.round(parseFloat(count))
        if (count > result) {
          result++
        }
        return result
      }
    },
    async saveSpecialAvailability() {
      this.loading = true
      let isValid = this.$refs['facility-special-availability'].validate()
      if (isValid) {
        let { id } = this.details || {}
        let { specialType, remarks, date, cost, cancelOnCostChange } =
          this.formModel || {}

        let { startTime, endTime } = this
        let data = {
          facility: {
            id,
          },
          specialType,
          remarks,
          startDate: date,
          startTime,
          endTime,
        }
        if (!isEmpty(cost)) {
          data.cost = cost
        } else {
          data.cost = -1
        }
        if (!isEmpty(cancelOnCostChange)) {
          data.cancelOnCostChange = cancelOnCostChange
        }

        let { facilitySpecialAvailability, error } = await API.createRecord(
          'facilitySpecialAvailability',
          {
            data,
          }
        )

        if (error) {
          ftoast.critical(error?.message || this.$t('error_occurred'))
        } else {
          if (!isEmpty(facilitySpecialAvailability)) {
            ftoast.success(
              this.$t('facility.special_availability.success_msg', {
                ns: 'facilitybooking',
              })
            )
          }
        }

        this.loadRelatedRecords()

        this.handleCancel()
      }
      this.loading = false
    },
    emptyset() {
      let formModel = {
        specialType: null,
        remarks: null,
        date: null,
        startTime: null,
        endTime: null,
        cost: null,
        cancelOnCostChange: null,
      }
      this.formModel = formModel
    },
    handleCancel() {
      this.emptyset()
      this.showPopup = false
    },
    setDate(val) {
      this.formModel.date = val
    },
    setStartTime(val) {
      const date = moment(val, 'ddd MMM DD YYYY HH:mm:ss ZZ')

      const millisecondTimestamp = date.valueOf()

      this.formModel.startTime = val
      if (val > 0) {
        const date = new Date(val)
        const formattedTime = moment(date).format('HH:mm')
        this.startTime = formattedTime
      } else {
        this.startTime = '00:00'
      }

      this.formStartTime = millisecondTimestamp
    },
    setEndTime(val) {
      this.formModel.endTime = val
      if (val > 0) {
        const date = new Date(val)
        const formattedTime = moment(date).format('HH:mm')
        this.endTime = formattedTime
      } else {
        this.endTime = '00:00'
      }
    },
    getFormattedValueForMillis(milliseconds, formatString) {
      return getOrgMoment(milliseconds).format(formatString)
    },
  },
}
</script>
