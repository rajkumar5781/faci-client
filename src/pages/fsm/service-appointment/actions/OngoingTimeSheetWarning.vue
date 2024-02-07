<template>
  <FContainer>
    <FModal
      :title="
        getErrorProperty(
          'title',
          $t('time_sheet.timesheet_conflict_title', 'Work cannot be started', {
            ns: 'fsm',
          })
        )
      "
      :visible="true"
      :cancelText="$t('time_sheet.cancel', { ns: 'fsm' })"
      :saveText="$t('time_sheet.complete', { ns: 'fsm' })"
      size="S"
      :type="getErrorProperty('severity', 'warning')"
      :hideFooter="false"
      :confirmLoading="isLoading"
      @ok="stopTimeSheet('completed')"
      @cancel="handleCancel"
    >
      <FContainer
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        gap="containerXLarge"
        padding="containerXxLarge sectionSmall"
      >
        <FText appearance="bodyReg14" color="textDescription">
          {{
            getErrorProperty(
              'message',
              $t(
                'time_sheet.timesheet_conflict_message',
                'You currently have an active task in progress. To manage your ongoing tasks, please navigate to the associated appointment',
                { ns: 'fsm' }
              )
            )
          }}
        </FText>
        <FDivider
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap="containerNone"
          alignSelf="stretch"
          width="100%"
          margin="containerNone"
        />
        <FContainer
          display="flex"
          alignItems="stretch"
          alignContent="flex-start"
          gap="containerXLarge"
          alignSelf="stretch"
          flexDirection="column"
          v-for="timeSheet in timeSheetList"
          :key="timeSheet.id"
        >
          <FRow v-if="!isEmpty(timeSheet)">
            <FCol :span="4">
              <FContainer
                display="flex"
                flexDirection="column"
                alignItems="flex-start"
                justifyContent="spaceBetween"
                gap="containerMedium"
              >
                <FText appearance="captionMed12" color="textMain">{{
                  $t('time_sheet.time_sheet', { ns: 'fsm' })
                }}</FText>
                <FButton
                  appearance="link"
                  @click="redirectToOverview(timeSheet)"
                >
                  <FText appearance="bodyReg14" color="textCaption">
                    {{ getTimeSheetData(timeSheet, 'code', '---') }}
                  </FText>
                </FButton>
              </FContainer>
            </FCol>
            <FCol :span="4">
              <FContainer
                display="flex"
                flexDirection="column"
                alignItems="flex-start"
                justifyContent="spaceBetween"
                gap="containerMedium"
              >
                <FText appearance="captionMed12" color="textMain">{{
                  $t('service_appointment.service_appointment', { ns: 'fsm' })
                }}</FText>
                <FButton
                  appearance="link"
                  @click="redirectToAppointmentOverview(timeSheet)"
                >
                  <FText appearance="bodyReg14" color="textCaption">
                    {{
                      getTimeSheetData(
                        timeSheet,
                        'serviceAppointment.code',
                        '---'
                      )
                    }}
                  </FText>
                </FButton>
              </FContainer>
            </FCol>
            <FCol :span="4">
              <FContainer
                display="flex"
                flexDirection="column"
                alignItems="flex-start"
                justifyContent="spaceBetween"
                gap="containerMedium"
              >
                <FText appearance="captionMed12" color="textMain">{{
                  $t('time_sheet.start_time', { ns: 'fsm' })
                }}</FText>
                <FText appearance="bodyReg14" color="textDescription">{{
                  formatDate(getTimeSheetData(timeSheet, 'startTime', null))
                }}</FText>
              </FContainer>
            </FCol>
          </FRow>
        </FContainer>
      </FContainer>
      <template #footer>
        <FContainer
          display="flex"
          padding="containerXLarge sectionSmall"
          width="100%"
          borderTop="solid 1px"
          borderColor="borderNeutralBaseSubtler"
          justifyContent="flex-end"
        >
          <FButton appearance="secondary" @click="stopTimeSheet('onHold')">
            {{ $t('time_sheet.on_hold', { ns: 'fsm' }) }}
          </FButton>
          <FContainer marginLeft="containerLarge" />
          <FButton @click="stopTimeSheet('completed')" :loading="loading">
            {{ $t('time_sheet.complete', { ns: 'fsm' }) }}
          </FButton>
        </FContainer>
      </template>
    </FModal>
  </FContainer>
</template>

<script>
import { isEmpty } from '@facilio/utils/validation'
import {
  FContainer,
  FModal,
  FRow,
  FCol,
  FText,
  FAvatar,
  FDivider,
  FButton,
  ftoast,
} from '@facilio/design-system'
import { formatDate } from '../../../../utils/formatter'
import getProperty from 'dlv'
import { API } from '@facilio/api'
import FetchViewsMixin from '../../../../components/views/FetchViews.vue'
import { findRouteForModule, pageTypes } from '@facilio/router'

export default {
  props: ['timeConflictData'],
  mixins: [FetchViewsMixin],
  components: {
    FContainer,
    FModal,
    FRow,
    FCol,
    FText,
    FAvatar,
    FDivider,
    FButton,
    ftoast,
  },
  data() {
    return {
      isLoading: false,
      moduleName: 'timeSheet',
    }
  },
  computed: {
    timeSheetList() {
      let { timeConflictData } = this
      return getProperty(timeConflictData, 'errorRelatedData.timeSheet', [])
    },
  },
  methods: {
    isEmpty,
    formatDate,
    getErrorProperty(property, defaultValue) {
      let { timeConflictData } = this
      return getProperty(timeConflictData, property, defaultValue)
    },
    getTimeSheetData(timeSheet, property, defaultValue) {
      return getProperty(timeSheet, property, defaultValue)
    },
    async stopTimeSheet(transitionToState, validate = true) {
      let { timeSheetList = [] } = this
      this.isLoading = true
      let recordIds = timeSheetList.map(timeSheet => timeSheet.id)
      let params = {
        recordIds,
        transitionToState,
        validate,
      }
      let url = 'v3/serviceAppointment/timeSheet/bulkStopTimeSheet'
      let { error, data } = await API.post(url, params)
      if (error) {
        let { message = '', title = '' } = error
        ftoast.critical(message, {
          title: title,
          menuType: 'alerts',
          timeout: 5000,
        })
        this.handleCancel()
      } else {
        if (data?.serviceAppointmentStatusActions) {
          let { message = '', title = '' } =
            data.serviceAppointmentStatusActions
          ftoast.success(message, {
            title: title,
            menuType: 'alerts',
            timeout: 5000,
          })
        }
        this.$emit('complete')
      }
      this.isLoading = false
    },
    handleCancel() {
      this.$emit('cancel')
    },
    async redirectToOverview(timeSheet) {
      let { moduleName, $route } = this
      let viewname = await this.fetchView(moduleName)
      let { query } = $route
      let { id } = timeSheet || {}
      if (!isEmpty(id) && !isEmpty(viewname)) {
        let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
        let route = { name, params: { viewname, id, moduleName }, query }
        this.$router.push(route)
      }
    },
    async redirectToAppointmentOverview(timeSheet) {
      let { moduleName, $route } = this
      let viewname = await this.fetchView(moduleName)
      let { query } = $route
      let { serviceAppointment } = timeSheet || {}
      let { id } = serviceAppointment || {}
      if (!isEmpty(id) && !isEmpty(viewname)) {
        let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
        let route = { name, params: { viewname, id, moduleName }, query }
        this.$router.push(route)
      }
    },
  },
}
</script>

<style></style>
