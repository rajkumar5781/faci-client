<template>
  <FContainer :height="loading || isEmpty(activities) ? '100%' : 'fit-content'">
    <FContainer
      v-if="loading"
      display="flex"
      alignItems="center"
      justifyContent="center"
      width="100%"
      height="100%"
    >
      <FSpinner :size="20"
    /></FContainer>
    <FContainer
      v-else-if="isEmpty(activities)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      width="100%"
      height="100%"
    >
      <FEmptyState
        title="No History Available"
        illustration="no-activities"
        :vertical="true"
      ></FEmptyState>
    </FContainer>
    <FContainer v-else padding="containerXxLarge" paddingBottom="containerNone">
      <FTimeline :records="activities">
        <template #default="activity">
          <FContainer :key="activity.id" display="flex">
            <FContainer flexShrink="0" marginBottom="containerMedium">
              <FAvatar
                size="M"
                :userName="activity.doneBy.name"
                :avatarUrl="activity.doneBy.avatarUrl"
              ></FAvatar>
            </FContainer>
            <FContainer
              display="flex"
              flexDirection="column"
              paddingBottom="containerXxLarge"
              paddingLeft="containerMedium"
            >
              <FContainer wordBreak="break-word">
                <div
                  v-if="
                    [83, 3].includes(activity.type) && activity.info.assigned
                  "
                >
                  <FText appearance="bodyReg14" color="textCaption">
                    {{ activity.doneBy.name + ' ' }}</FText
                  >
                  <template v-if="activity.info.assigned.assignedTo">
                    <template v-if="activity.info.assigned.assignedTo > 0">
                      <span v-html="sanitize(activity.message)"></span>
                      {{ ' ' }}
                      <FAvatar
                        size="xs"
                        :userName="
                          getUserName(
                            activity.info.assigned.assignedTo,
                            activity
                          )
                        "
                      ></FAvatar>
                      {{ ' ' }}
                      <FText appearance="bodyReg14" color="textCaption">
                        {{
                          getUserName(
                            activity.info.assigned.assignedTo,
                            activity
                          )
                        }}</FText
                      >
                    </template>
                    <template v-else>
                      <FText appearance="headingMed14">{{
                        'removed the staff'
                      }}</FText>
                    </template>
                  </template>
                  <template v-else>
                    <template v-if="activity.info.assigned.assignmentGroup > 0">
                      <span v-html="sanitize(activity.message)"></span>

                      <FText appearance="bodyReg14" color="textCaption">
                        {{ 'team' }}
                        {{
                          getGroup(
                            activity.info.assigned.assignmentGroup,
                            activity
                          ).name
                        }}</FText
                      >
                    </template>
                    <template v-else>
                      <FText appearance="headingMed14">{{
                        'removed the team'
                      }}</FText>
                    </template>
                  </template>
                </div>
                <div v-else-if="activity.type === 24">
                  <FText appearance="bodyReg14" color="textCaption">
                    {{ activity.doneBy.name + ' ' }}</FText
                  >
                  <span v-html="sanitize(activity.message)"></span>

                  <FContainer
                    @click="openPm(activity.info.addPMWO[0].pmid)"
                    cursor="pointer"
                  >
                    <FText appearance="bodyReg14" color="textCaption"
                      ># {{ activity.info.addPMWO[0].pmid }}
                    </FText></FContainer
                  >
                </div>
                <div v-else-if="activity.type === 68">
                  <FText appearance="bodyReg14" color="textCaption">
                    {{ activity.doneBy.name + ' ' }}</FText
                  >
                  <span v-html="sanitize(activity.message)"></span>
                  <FContainer
                    @click="openQuotationPreview(activity.info.quotationId)"
                    cursor="pointer"
                    marginLeft="containerLarge"
                    ><FIcon group="default" name="eye-open"></FIcon
                    ><FText appearance="captionMed12">{{ 'Preview' }}</FText>
                  </FContainer>
                </div>
                <div v-else>
                  <FText appearance="bodyReg14" color="textCaption">
                    {{ activity.doneBy.name + ' ' }}</FText
                  >
                  <span v-html="sanitize(activity.message)"></span>
                </div>
              </FContainer>

              <FText appearance="captionMed10" color="textCaption">{{
                formatDate(activity.ttime)
              }}</FText>
            </FContainer>
          </FContainer>
        </template>
      </FTimeline>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FAvatar,
  FEmptyState,
  FTimeline,
  FSpinner,
  FContainer,
  FText,
  FIcon,
  ftoast,
} from '@facilio/design-system'
import ActivityMixin from './ActivityMixin.vue'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import { dset as setProperty } from 'dset'
import views from '../../../../store/views'
import { mapState } from 'pinia'
import { findRouteForModule, pageTypes } from '@facilio/router'
import { getFieldOptions } from '../../../../utils/picklist'
import {
  getTimeZone,
  getDateFormat,
  getTimeFormat,
} from '../../../../utils/formatter'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { sanitize } from '@facilio/utils/sanitize'
dayjs.extend(utc)
dayjs.extend(timezone)

const formatDate = function (date) {
  let timezone = getTimeZone()
  let dateformat = getDateFormat()
  let timeformat = getTimeFormat()
  return dayjs(date)
    .tz(timezone)
    .format(dateformat + ' | ' + timeformat)
}

export default {
  props: ['record', 'serviceportal', 'module', 'widget'],
  mixins: [ActivityMixin],
  components: {
    FAvatar,
    FEmptyState,
    FTimeline,
    FIcon,
    FSpinner,
    FContainer,
    FText,
  },

  async created() {
    this.init()
  },
  data() {
    return {
      activities: [],
      loading: true,
      portalUserList: [],
      groupList: [],
      isEmpty,
      formatDate,
      sanitize,
    }
  },
  computed: {
    ...mapState(views, ['metaInfo']),
    fieldsMap() {
      let { metaInfo } = this
      let map = {}
      if (!isEmpty(metaInfo)) {
        let fields = getProperty(metaInfo, 'fields', [])
        fields.forEach(field => {
          setProperty(map, `${field.name}`, field)
        })
      }
      return map
    },
    activityModule() {
      return getProperty(this.widget, 'widgetParams.activityModuleName')
    },
  },
  watch: {
    record: 'init',
  },
  methods: {
    async init() {
      this.loadActivities().then(() => {
        let prom1 = this.loadGroups()
        let prom2 = this.loadusers()
        Promise.all([prom1, prom2]).then(() => {
          this.setMessages()
          this.$nextTick(() => {
            this.$emit('autoResizeWidget')
          })
        })
      })
    },
    getGroup(grpId) {
      return this.groupList[grpId] || null
    },
    openPm(id) {
      let { name } =
        findRouteForModule('plannedmaintenance', pageTypes.OVERVIEW) || {}
      if (name) this.$router.replace({ name, params: { id, viewname: 'all' } })
    },
    setMessages() {
      let activities = (this.activities || []).map(activity => {
        let activityObj = this.getMessage(activity) || {}
        return { ...activity, message: activityObj.message }
      })
      this.activities = activities.filter(act => act.message !== null)
    },
    async loadGroups() {
      let grpIdList = this.activities
        .map(activity => activity?.info?.assigned?.assignmentGroup)
        .filter(actv => actv > 0)

      if (isEmpty(grpIdList)) return

      let { error, options } = await getFieldOptions({
        field: {
          lookupModuleName: 'peopleGroup',
          skipDeserialize: true,
          name: 'assignmentGroup',
        },
        defaultIds: grpIdList,
        perPage: grpIdList.length,
        parentModuleName: this.module,
      })

      if (!error && !isEmpty(options['siteId'])) {
        this.groupList = options
      }
    },
    async loadusers() {
      this.loading = true
      let assignedToIds = (this.activities || [])
        .map(actv => {
          let assignedToId = getProperty(actv, 'info.assigned.assignedTo', null)
          if (!isEmpty(assignedToId) && assignedToId !== -99)
            return `${assignedToId}`
          return null
        })
        .filter(actv => !isEmpty(actv))

      let userIds = [...new Set([...assignedToIds])]
      if (!isEmpty(userIds)) {
        let params = {
          includeParentFilter: true,
          filters: JSON.stringify({ ouid: { operatorId: 36, value: userIds } }),
        }

        let { error, data } = await API.get('/setup/portalUsersList', params)
        if (!error) this.portalUserList = data.users || []
      }
      this.loading = false
    },
    async loadActivities() {
      if (this.activityModule) {
        let params = {}
        if (this.module === 'newreadingalarm') {
          params.occurrenceId = this.record.occurrence.id
        } else {
          params['parentId'] = this.record.id
        }
        this.loading = true

        let { error, data } = await API.post(
          `/v2/activity/${this.module}/${this.activityModule}`,
          params
        )
        if (!error) {
          let activityList = data?.activity || []

          if (this.module === 'newreadingalarm') {
            activityList = activityList.map(activity => activity.data)
          }
          this.activities = activityList
        } else ftoast.critical(error.message)
      }
      this.loading = false
    },
    openQuotationPreview(id) {
      console.log('Currently unsupported')
      // window.open(
      //   `${window.location.protocol}//${window.location.host}/app/pdf/quotationpdf?quotationId=${id}`
      // )
    },
    // typeOfActivity(activity) {
    //   if ([83, 3].includes(activity.type) && activity.info.assigned) return '1'
    //   if (activity.type === 24) return '2'
    //   if (activity.type === 68) return '3'
    //   return '4'
    // },
  },

  //renderer is part of history rewamp will release this code once we start rewamping it
  // render() {
  //   let { loading, activities } = this
  //   return (
  //     <div class="block mL30 mT20">
  //       {loading ? (
  //         <FContainer
  //           display="flex"
  //           alignItems="center"
  //           justifyContent="center"
  //           width="100%"
  //           height="100%"
  //         >
  //           <FSpinner size={20} />
  //         </FContainer>
  //       ) : isEmpty(activities) ? (
  //         <FEmptyState
  //           v-else-if="isEmpty(activities)"
  //           title="No History Available"
  //           illustration="no-activities"
  //           vertical={true}
  //         ></FEmptyState>
  //       ) : (
  //         <FContainer padding="containerXxLarge" height="100%">
  //           <FTimeline records={activities}>
  //             {activity => (
  //               <FContainer key={activity.id} display="flex">
  //                 <FContainer flexShrink="0" marginBottom="containerMedium">
  //                   <FAvatar
  //                     size="M"
  //                     userName={activity.doneBy.name}
  //                     avatarUrl={activity.doneBy.avatarUrl}
  //                   ></FAvatar>
  //                 </FContainer>
  //                 <FContainer
  //                   display="flex"
  //                   flexDirection="column"
  //                   paddingBottom="containerXxLarge"
  //                   paddingLeft="containerMedium"
  //                 >
  //                   <FContainer wordBreak="break-word">
  //                     {() => {
  //                       switch (this.typeOfActivity(activity)) {
  //                         case '1':
  //                           return
  //                         case '2':
  //                           return
  //                         case '3':
  //                           return
  //                         case '4':
  //                           return
  //                       }
  //                     }}
  //                   </FContainer>
  //                   <FText appearance="captionMed10" color="textCaption">
  //                     {this.formatDate(activity.ttime)}
  //                   </FText>
  //                 </FContainer>
  //               </FContainer>
  //             )}
  //           </FTimeline>
  //         </FContainer>
  //       )}
  //     </div>
  //   )
  // },
}
</script>
<style lang="scss">
.activity-bold-text {
  color: var(--colors-text-main, #283648);
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 130%;
}
.activity-normal-text {
  color: var(--colors-text-caption, #607796);
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 130%;
}
</style>

<style lang="scss">
.wo-activity {
  .el-timeline-item__timestamp.is-bottom {
    margin-top: 8px;
    position: absolute;
    left: -70px;
    top: -1px;
  }
  .el-timeline-item__wrapper {
    position: relative;
    padding-left: 130px;
    top: -3px;
  }
  .el-timeline-item {
    position: relative;
    padding-bottom: 20px;
    margin-left: 40px;
  }
  .el-timeline-item__node--normal {
    left: 80px;
    width: 10px;
    height: 10px;
    top: 5px;
    letter-spacing: 0.3px;
    font-size: 12px;
    border: solid 2px #ff3184;
    background: #fff;
  }
  .el-timeline-item__tail {
    margin-left: 80px;
    margin-top: 10px;
  }
  .el-timeline-item__timestamp.is-bottom {
    color: #8ca1ad;
    line-height: 1;
    font-size: 12px;
  }
}
</style>
