<template>
  <FContainer height="fit-content">
    <!-- portal will be uncommented once the commisitioning history is added -->
    <!-- <portal :to="`header-${widget.id}-${widget.name}`" v-if="showDropDown">
      <div class="flex-middle justify-content-start">
        <FContainer padding="containerXLarge">
          <el-dropdown
            class="fc-dropdown-menu-border"
            trigger="click"
            placement="bottom-start"
            @command="setActivity"
          >
            <el-button type="primary" class="fc-btn-group-white">
              <div>
                {{ fixedFilter }}
                <i class="el-icon-arrow-down"></i>
              </div>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="actual">
                <div>
                  {{ $t('setup.decommission.actual_log') }}
                </div>
              </el-dropdown-item>
              <el-dropdown-item
                v-if="showCommisitioningOption"
                command="decommisson"
              >
                <div>
                  {{ $t('setup.decommission.commissioning_log') }}
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </FContainer>
      </div>
    </portal> -->

    <activities
      v-if="isActualActivity"
      v-bind="$attrs"
      :record="details"
      :module="moduleName"
      :widget="widget"
      :activityModule="activityModule"
      @autoResizeWidget="autoResize"
    ></activities>
    <!-- <LogActivities
      v-else
      ref="activities-container"
      :recordId="recordId"
      @autoResizeWidget="autoResize"
      :selectedModule="moduleName"
      :details="details"
    ></LogActivities> -->
  </FContainer>
</template>
<script>
import Activities from './Activities.vue'
// import LogActivities from './LogActivities.vue'
import { FContainer } from '@facilio/design-system'
import dlv from 'dlv'

export default {
  name: 'activityWidget',
  props: [
    'details',
    'layoutParams',
    'hideTitleSection',
    'groupKey',
    'activeTab',
    'moduleName',
    'resizeWidget',
    'widget',
    'fitMyContent',
  ],
  components: {
    Activities,
    // LogActivities,
    FContainer,
  },
  data() {
    return {
      record: {},
      fixedFilter: 'All History',
      isActualActivity: true,
    }
  },
  mounted() {
    this.setDefaultData()
    // this.autoResize()
  },
  computed: {
    activityModule() {
      return this.getActivityModuleName()
    },
    recordId() {
      return dlv(this, 'details.id', null)
    },

    showCommisitioningOption() {
      return this.$helpers.isLicenseEnabled('COMMISSIONING')
    },
    showDropDown() {
      return false
    },
  },
  methods: {
    setDefaultData() {
      if (this.moduleName === 'newreadingalarm') {
        this.record.id = this.details.alarm.id
        this.record.occurrencId = this.details.occurrence.id
      }
    },
    setActivity(command) {
      if (command === 'actual') {
        this.isActualActivity = true
        this.fixedFilter = this.$t('setup.decommission.actual_log')
      } else {
        this.isActualActivity = false
        this.fixedFilter = this.$t('setup.decommission.commissioning_log')
      }
      this.$nextTick(() => {
        this.resizeWidget({ h: this.widget.height })
      })
    },
    getActivityModuleName() {
      if (this.moduleName === 'newreadingalarm') {
        return 'alarmActivity'
      } else {
        return dlv(this, 'widget.widgetParams.activityModuleName')
      }
    },
    autoResize() {
      this.$nextTick(() => {
        this.fitMyContent()
      })
    },
  },
}
</script>
<style lang="scss">
.activity-widget-page {
  .vue-portal-target {
    margin-top: 25px;
  }
  .el-table th.is-leaf {
    padding-top: 10px;
    padding-bottom: 10px;
    padding-left: 20px;
  }
}
</style>
