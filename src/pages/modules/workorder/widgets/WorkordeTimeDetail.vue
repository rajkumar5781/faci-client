<template>
  <FContainer
    display="flex"
    padding="containerLarge"
    flexDirection="column"
    alignSelf="stretch"
  >
    <FContainer
      display="flex"
      width="100%"
      flexDirection="column"
      alignItems="flex-start"
      gap="containerLarge"
    >
      <FContainer
        display="flex"
        width="100%"
        justifyContent="space-between"
        alignItems="baseline"
      >
        <FContainer
          display="flex"
          paddingRight="containerNone"
          alignItems="center"
        >
          <WoTimer
            :actualWorkDurationField="actualWorkDurationField"
            :details="woBundle"
          ></WoTimer>
        </FContainer>
        <!-- task -->
        <FContainer display="flex" flexDirection="column" alignItems="center">
          <FContainer
            display="flex"
            justifyContent="center"
            textAlign="center"
            flexDirection="column"
            gap="containerXLarge"
            padding="containerMedium containerXLarge"
          >
            <FText appearance="headingMed16" color="textMain">{{
              getTotalTask
            }}</FText>
          </FContainer>
          <FContainer
            display="flex"
            justifyContent="center"
            textAlign="center"
            padding="containerMedium"
          >
            <FText appearance="captionReg12" color="textDescription">{{
              getTaskChart
            }}</FText>
          </FContainer>
        </FContainer>
      </FContainer>

      <!-- 2nd -->
      <FContainer
        width="100%"
        display="flex"
        flexDirection="column"
        padding="containerMedium containerNone"
        backgroundColor="borderNeutralGrey02Subtler"
        borderRadius="high"
        alignItems="flex-start"
      >
        <FContainer
          display="flex"
          width="100%"
          padding="containerMedium containerXLarge"
          gap="containerXLarge"
          ><FText appearance="captionMed12" color="textCaption">
            Scheduled
          </FText>
        </FContainer>

        <FContainer
          display="flex"
          justifyContent="space-between"
          width="100%"
          alignItems="center"
        >
          <FContainer
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            width="50%"
          >
            <template
              v-if="
                this.details.scheduledStart && this.details.scheduledStart > -1
              "
            >
              <FContainer
                display="flex"
                padding="containerSmall containerXLarge"
                gap="containerXLarge"
                width="80px"
              >
                <FText
                  appearance="bodyReg14"
                  textAlign="center"
                  color="textMain"
                >
                  {{ formatDateWithOnlyTime(this.details.scheduledStart) }}
                </FText>
              </FContainer>
              <FContainer
                display="flex"
                padding="containerSmall containerXLarge"
                gap="containerXLarge"
                alignItems="center"
                justifyContent="center"
              >
                <FText
                  appearance="captionReg12"
                  textAlign="left"
                  color="textCaption"
                >
                  {{ formatDateWithoutTime(this.details.scheduledStart) }}
                </FText>
              </FContainer>
            </template>
            <template v-else>
              <FContainer
                display="flex"
                padding="containerSmall containerXLarge"
                gap="containerXLarge"
                width="80px"
                class="opacity-20"
              >
                <FText
                  appearance="bodyReg14"
                  textAlign="center"
                  color="textMain"
                  >00:00</FText
                >
              </FContainer>
              <FContainer
                display="flex"
                padding="containerSmall containerXLarge"
                gap="containerXLarge"
                alignItems="center"
                justifyContent="center"
                class="opacity-20"
              >
                <FText
                  appearance="captionReg12"
                  textAlign="left"
                  color="textCaption"
                >
                  __/__/____
                </FText>
              </FContainer>
            </template>
          </FContainer>
          <FContainer
            display="flex"
            width="40px"
            padding="containerMedium containerNone"
            alignItems="center"
            justifyContent="center"
          >
            <FText appearance="bodyReg14" textAlign="center" color="textCaption"
              >To</FText
            >
          </FContainer>
          <FContainer
            display="flex"
            flexDirection="column"
            alignItems="flex-end"
            width="50%"
          >
            <template
              v-if="this.details.estimatedEnd && this.details.estimatedEnd > -1"
            >
              <FContainer
                display="flex"
                padding="containerSmall containerXLarge"
                gap="containerXLarge"
                width="80px"
              >
                <FText
                  appearance="bodyReg14"
                  textAlign="center"
                  color="textMain"
                >
                  {{ formatDateWithOnlyTime(this.details.estimatedEnd) }}
                </FText>
              </FContainer>
              <FContainer
                display="flex"
                padding="containerSmall containerXLarge"
                gap="containerXLarge"
                alignItems="center"
                justifyContent="center"
              >
                <FText
                  appearance="captionReg12"
                  textAlign="left"
                  color="textCaption"
                >
                  {{ formatDateWithoutTime(this.details.estimatedEnd) }}
                </FText>
              </FContainer>
            </template>
            <template v-else>
              <FContainer
                display="flex"
                padding="containerSmall containerXLarge"
                gap="containerXLarge"
                width="80px"
                class="opacity-20"
              >
                <FText
                  appearance="bodyReg14"
                  textAlign="center"
                  color="textMain"
                  >00:00</FText
                >
              </FContainer>
              <FContainer
                display="flex"
                padding="containerSmall containerXLarge"
                gap="containerXLarge"
                alignItems="center"
                justifyContent="center"
                class="opacity-20"
              >
                <FText
                  appearance="captionReg12"
                  textAlign="left"
                  color="textCaption"
                >
                  __/__/____
                </FText>
              </FContainer>
            </template>
          </FContainer>
        </FContainer>
      </FContainer>

      <!-- 3 -->
      <FContainer
        width="100%"
        display="flex"
        flexDirection="column"
        padding="containerMedium containerNone"
        backgroundColor="borderNeutralGrey02Subtler"
        borderRadius="high"
        alignItems="flex-start"
      >
        <FContainer
          display="flex"
          width="100%"
          padding="containerMedium containerXLarge"
          gap="containerXLarge"
        >
          <FText appearance="captionMed12" color="textCaption" font="Roboto">
            Actual
          </FText>
        </FContainer>

        <FContainer
          display="flex"
          justifyContent="space-between"
          width="100%"
          alignItems="center"
        >
          <FContainer
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            width="50%"
          >
            <template
              v-if="
                this.details.actualWorkStart &&
                this.details.actualWorkStart > -1
              "
            >
              <FContainer
                padding="containerSmall containerXLarge"
                gap="containerXLarge"
                width="80px"
                v-if="
                  (this.details.actualWorkStart &&
                    this.details.actualWorkStart > -1) ||
                  (this.details.actualWorkEnd &&
                    this.details.actualWorkEnd > -1)
                "
              >
                <FText
                  appearance="bodyReg14"
                  textAlign="center"
                  color="textMain"
                  >{{
                    formatDateWithOnlyTime(this.details.actualWorkStart)
                  }}</FText
                >
              </FContainer>
              <FContainer
                display="flex"
                padding="containerSmall containerXLarge"
                gap="containerXLarge"
                alignItems="center"
                justifyContent="center"
              >
                <FText
                  appearance="captionReg12"
                  textAlign="left"
                  color="textCaption"
                >
                  {{
                    formatDateWithoutTime(this.details.actualWorkStart)
                  }}</FText
                >
              </FContainer>
            </template>
            <template v-else>
              <FContainer
                display="flex"
                padding="containerSmall containerXLarge"
                gap="containerXLarge"
                width="80px"
                class="opacity-20"
              >
                <FText
                  appearance="bodyReg14"
                  textAlign="center"
                  color="textMain"
                  >00:00</FText
                >
              </FContainer>
              <FContainer
                display="flex"
                padding="containerSmall containerXLarge"
                gap="containerXLarge"
                alignItems="center"
                justifyContent="center"
                class="opacity-20"
              >
                <FText
                  appearance="captionReg12"
                  textAlign="left"
                  color="textCaption"
                >
                  __/__/____
                </FText>
              </FContainer>
            </template>
          </FContainer>
          <FContainer
            display="flex"
            padding="containerMedium containerNone"
            alignItems="center"
            justifyContent="center"
          >
            <FText appearance="bodyReg14" textAlign="center" color="textCaption"
              >To</FText
            >
          </FContainer>
          <FContainer
            display="flex"
            flexDirection="column"
            alignItems="flex-end"
            width="50%"
          >
            <template
              v-if="
                this.details.actualWorkEnd && this.details.actualWorkEnd > -1
              "
            >
              <FContainer
                display="flex"
                alignItems="center"
                justifyContent="center"
                padding="containerSmall containerXLarge"
                gap="containerXLarge"
                width="80px"
              >
                <FText
                  appearance="bodyReg14"
                  textAlign="center"
                  color="textMain"
                >
                  {{ formatDateWithOnlyTime(this.details.actualWorkEnd) }}
                </FText>
              </FContainer>
              <FContainer
                v-if="this.details.actualWorkEnd"
                display="flex"
                padding="containerSmall containerXLarge"
                gap="containerXLarge"
                alignItems="center"
                justifyContent="center"
              >
                <FText
                  appearance="captionReg12"
                  textAlign="left"
                  color="textCaption"
                >
                  {{ formatDateWithoutTime(this.details.actualWorkEnd) }}</FText
                >
              </FContainer>
            </template>
            <template v-else>
              <FContainer
                display="flex"
                padding="containerSmall containerXLarge"
                gap="containerXLarge"
                width="80px"
                class="opacity-20"
              >
                <FText
                  appearance="bodyReg14"
                  textAlign="center"
                  color="textMain"
                  >00:00</FText
                >
              </FContainer>
              <FContainer
                display="flex"
                padding="containerSmall containerXLarge"
                gap="containerXLarge"
                alignItems="center"
                justifyContent="center"
                class="opacity-20"
              >
                <FText
                  appearance="captionReg12"
                  textAlign="left"
                  color="textCaption"
                >
                  __/__/____
                </FText>
              </FContainer>
            </template>
          </FContainer>
        </FContainer>
      </FContainer>

      <!-- 4 -->
      <FContainer display="flex" width="100%" gap="containerLarge">
        <FContainer
          width="50%"
          display="flex"
          flexDirection="column"
          padding="containerMedium containerNone"
          backgroundColor="borderNeutralGrey02Subtler"
          borderRadius="high"
          alignItems="flex-start"
        >
          <FContainer
            display="flex"
            width="100%"
            padding="containerMedium containerXLarge"
            gap="containerXLarge"
          >
            <FText appearance="captionMed12" color="textCaption" font="Roboto">
              Response Due
            </FText>
          </FContainer>

          <FContainer
            display="flex"
            justifyContent="space-between"
            width="100%"
            alignItems="center"
          >
            <FContainer
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              width="50%"
            >
              <template
                v-if="
                  this.details.responseDueDate &&
                  this.details.responseDueDate > -1
                "
              >
                <FContainer
                  padding="containerSmall containerXLarge"
                  gap="containerXLarge"
                >
                  <FText
                    appearance="bodyReg14"
                    textAlign="center"
                    color="textMain"
                  >
                    {{ formatDateWithOnlyTime(this.details.responseDueDate) }}
                  </FText>
                </FContainer>
                <FContainer
                  display="flex"
                  padding="containerSmall containerXLarge"
                  gap="containerXLarge"
                  alignItems="center"
                  justifyContent="center"
                >
                  <FText
                    appearance="captionReg12"
                    textAlign="left"
                    color="textCaption"
                  >
                    {{ formatDateWithoutTime(this.details.responseDueDate) }}
                  </FText>
                </FContainer>
              </template>
              <template v-else>
                <FContainer
                  display="flex"
                  padding="containerSmall containerXLarge"
                  gap="containerXLarge"
                  width="80px"
                  class="opacity-20"
                >
                  <FText
                    appearance="bodyReg14"
                    textAlign="center"
                    color="textMain"
                    >00:00</FText
                  >
                </FContainer>
                <FContainer
                  display="flex"
                  padding="containerSmall containerXLarge"
                  gap="containerXLarge"
                  alignItems="center"
                  justifyContent="center"
                  class="opacity-20"
                >
                  <FText
                    appearance="captionReg12"
                    textAlign="left"
                    color="textCaption"
                  >
                    __/__/____
                  </FText>
                </FContainer>
              </template>
            </FContainer>
          </FContainer>
        </FContainer>
        <FContainer
          width="50%"
          display="flex"
          flexDirection="column"
          padding="containerMedium containerNone"
          backgroundColor="borderNeutralGrey02Subtler"
          borderRadius="high"
          alignItems="flex-start"
        >
          <FContainer
            display="flex"
            width="100%"
            padding="containerMedium containerXLarge"
            gap="containerXLarge"
          >
            <FText appearance="captionMed12" color="textCaption" font="Roboto">
              Due Date
            </FText>
          </FContainer>

          <FContainer
            display="flex"
            justifyContent="space-between"
            width="100%"
            alignItems="center"
          >
            <FContainer
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              width="50%"
            >
              <template
                v-if="this.details.dueDate && this.details.dueDate > -1"
              >
                <FContainer
                  padding="containerSmall containerXLarge"
                  gap="containerXLarge"
                >
                  <FText
                    appearance="bodyReg14"
                    textAlign="center"
                    color="textMain"
                  >
                    {{ formatDateWithOnlyTime(this.details.dueDate) }}
                  </FText>
                </FContainer>
                <FContainer
                  display="flex"
                  padding="containerSmall containerXLarge"
                  gap="containerXLarge"
                  alignItems="center"
                  justifyContent="center"
                >
                  <FText
                    appearance="captionReg12"
                    textAlign="left"
                    color="textCaption"
                  >
                    {{ formatDateWithoutTime(this.details.dueDate) }}
                  </FText>
                </FContainer>
              </template>
              <template v-else>
                <FContainer
                  display="flex"
                  padding="containerSmall containerXLarge"
                  gap="containerXLarge"
                  width="80px"
                  class="opacity-20"
                >
                  <FText
                    appearance="bodyReg14"
                    textAlign="center"
                    color="textMain"
                    >00:00</FText
                  >
                </FContainer>
                <FContainer
                  display="flex"
                  padding="containerSmall containerXLarge"
                  gap="containerXLarge"
                  alignItems="center"
                  justifyContent="center"
                  class="opacity-20"
                >
                  <FText
                    appearance="captionReg12"
                    textAlign="left"
                    color="textCaption"
                  >
                    __/__/____
                  </FText>
                </FContainer>
              </template>
            </FContainer>
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>

<script>
import { FContainer, FText, ftoast } from '@facilio/design-system'
import { API } from '@facilio/api'
import { formatDate } from '../../../../utils/formatter'
import viewStore from '../../../../store/views'
import WoTimer from './NewWorkorderTime.vue'
import { mapActions } from 'pinia'
export default {
  name: 'WorkTimeDetails',
  props: ['details', 'moduleName'],
  components: {
    WoTimer,
    FContainer,
    FText,
  },
  data() {
    return {
      workorder: {},
    }
  },

  created() {
    this.loadWorkorderSummary()
  },
  mounted() {
    this.loadFields()

    this.$root.$on('reloadWO', res => {
      if (res) {
        this.woBundle.workorder = res.wo
      } else {
        this.loadWorkorderSummary()
        this.loadWorkorderSurveys()
      }
    })
  },
  data() {
    return {
      loading: true,
      fields: [],
      woBundle: null,
    }
  },
  computed: {
    actualWorkDurationField() {
      let { fields } = this
      this.workorder = this.details
      return fields.find(field => field.name === 'actualWorkDuration')
    },
    getTotalTask() {
      return this.details.noOfClosedTasks > -1
        ? this.details.noOfClosedTasks
        : 0
    },
    getTaskChart() {
      return (
        this.$t('workorder.task.completed_of', 'Completed of', {
          ns: 'workorder',
        }) +
        ' ' +
        (this.details.noOfTasks > -1 ? this.details.noOfTasks : 0) +
        ' ' +
        this.$t('workorder.task.task', 'tasks', {
          ns: 'workorder',
        })
      )
    },
  },
  methods: {
    ...mapActions(viewStore, [
      'clearViews',
      'loadModuleMeta',
      'loadViewDetail',
    ]),
    loadFields() {
      this.loading = true
      this.loadModuleMeta('workorder').then(meta => {
        this.fields = meta.fields
        this.loading = false
      })
    },
    formatDate(date, exclTime, onlyTime) {
      return formatDate(date, exclTime, onlyTime)
    },
    formatDateWithoutTime(date) {
      return formatDate(date, true, false)
    },
    formatDateWithOnlyTime(date) {
      return formatDate(date, false, true)
    },
    loadWorkorderSummary(force = false, loadPage = true) {
      this.loading = loadPage
      API.fetchRecord(
        'workorder',
        {
          id: this.$route.params.id,
        },
        { force }
      )
        .then(res => {
          this.$set(this, 'woBundle', res)
          this.woBundle.id = this.woBundle.workorder.id
          if (this.woBundle.id) {
            this.woBundle.loadTimer = true
          }
          // this.$store.dispatch(
          //   'workorder/setCurrentWO',
          //   this.woBundle.workorder
          // )
        })
        .then(() => {
          // filtering prerequisite sections
          this.woBundle.workorder.preReqSections = {}
          for (const sectionID in this.woBundle.workorder.taskSections) {
            const taskSection = this.woBundle.workorder.taskSections[sectionID]
            if (taskSection.preRequest) {
              this.woBundle.workorder.preReqSections[+sectionID] = taskSection
            }
          }

          let preReqSectionIDs = Object.keys(
            this.woBundle.workorder.preReqSections
          ).map(k => +k)

          // filtering prerequisite tasks
          this.woBundle.workorder.preReqTasks = {}
          for (const sectionID in this.woBundle.workorder.tasks) {
            if (preReqSectionIDs.includes(+sectionID)) {
              this.woBundle.workorder.preReqTasks[sectionID] =
                this.woBundle.workorder.tasks[sectionID]
            }
          }
          this.loading = false
        })
        .catch(error => {
          let { message = 'Error occured while fetching workorkder' } = error
          ftoast.critical(message)
        })
    },
  },
}
</script>
