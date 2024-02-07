<template>
  <FContainer>
    <FContainer
      v-if="loading"
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
    >
      <FSpinner :size="30" />
    </FContainer>
    <FContainer
      v-else
      display="flex"
      justifyContent="center"
      alignItems="flex-start"
    >
      <FContainer width="84%">
        <FContainer display="flex" justifyContent="space-between">
          <FContainer
            display="flex"
            flexDirection="column"
            rowGap="containerLarge"
            width="80%"
          >
            <FText appearance="headingMed16">{{
              $t('my_app.manage_your_apps', 'Manage Your Apps', {
                ns: 'account',
              })
            }}</FText>
            <FText color="textCaption">{{
              $t('my_app.my_apps_desc', { ns: 'account' })
            }}</FText>
          </FContainer>
          <fc-illustration name="my-apps" size="S"></fc-illustration>
        </FContainer>
        <FContainer padding="sectionMedium containerNone">
          <FDivider width="100%" />
        </FContainer>
        <FContainer
          display="flex"
          flexDirection="column"
          gap="containerXxLarge"
        >
          <FText appearance="headingMed20">{{
            $t('my_apps', 'My Apps', { ns: 'account' })
          }}</FText>
          <FContainer>
            <FTable :columns="column" :data="myAppsList">
              <template #[`cell.default`]="{ row }">
                <FContainer v-if="row?.showDefaultAppOption" display="flex">
                  <FIcon
                    v-if="row?.isDefaultMobileApp"
                    group="platform"
                    name="mobile"
                    size="16"
                  />
                  <FIcon
                    v-if="row?.isDefaultApp"
                    group="platform"
                    name="laptop"
                    size="16"
                  />
                </FContainer>
              </template>
              <template #[`cell.action`]="{ row }">
                <FContainer>
                  <FDropdown
                    v-if="canShowMoreOption(row)"
                    :options="getOptionsArray(row)"
                    :selectable="true"
                    contentWidth="210px"
                    @dropdown="
                      selectedOption => {
                        handleDropdown(selectedOption, row)
                      }
                    "
                  >
                    <FIcon group="action" name="options-vertical" size="16" />
                  </FDropdown>
                </FContainer>
              </template>
            </FTable>
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FTable,
  FTags,
  FText,
  FIcon,
  FDropdown,
  FSpinner,
  FDivider,
  ftoast,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'

export default {
  components: {
    FContainer,
    FTable,
    FTags,
    FText,
    FIcon,
    FDropdown,
    FSpinner,
    FDivider,
  },
  data() {
    return {
      loading: false,
      myAppsList: [],
      column: [
        { displayName: 'App name', name: 'appName', id: 1, width: '200' },
        {
          displayName: 'Sample Text',
          name: 'sampleText',
          id: 2,
          width: '300',
        },
        { displayName: 'Role', name: 'roleName', id: 3, width: '250' },
        { displayName: 'Default', name: 'default', id: 4, width: '100' },
      ],
      optionsArray: [
        {
          label: this.$t('my_app.set_default_web', { ns: 'account' }),
          value: 1,
        },
        {
          label: this.$t('my_app.set_default_mobile', { ns: 'account' }),
          value: 2,
        },
      ],
      selectable: true,
      manualClear: false,
      menuType: 'alerts',
      timeout: 1000,
    }
  },
  title() {
    let title = this.$t('my_apps', 'My Apps', { ns: 'account' })
    return title
  },
  created() {
    this.listMyAppsForUser()
  },
  methods: {
    async listMyAppsForUser() {
      this.loading = true
      let { error, data } = await API.get('v3/myApps/listMyApps')
      if (error) {
        let { options } = this || {}
        let { message } = error || 'Error Occured'
        ftoast.critical(message, options)
      } else {
        let myApps = data?.myApps
        if (!isEmpty(myApps)) {
          let filteredMyApps = []
          myApps.forEach(myApp => {
            if (!isEmpty(myApp?.application)) {
              let { application } = myApp || {}
              if (
                application?.appCategoryEnum === 'FEATURE_GROUPING' ||
                application?.appCategoryEnum === 'WORK_CENTERS'
              ) {
                myApp.showDefaultAppOption = true
              } else {
                myApp.showDefaultAppOption = false
              }
              filteredMyApps.push(myApp)
            }
          })
          if (!isEmpty(filteredMyApps)) {
            filteredMyApps.forEach(app => {
              let { application, role } = app || {}
              let { name, description } = application || {}
              let { name: roleName } = role || {}
              app.appName = name
              app.sampleText = description
              app.roleName = roleName
              this.myAppsList.push(app)
            })
          }
        }
      }
      this.loading = false
    },
    async handleDropdown(option, myApp) {
      if (!isEmpty(option)) {
        let isWeb = option?.value == 1
        let isMobile = option?.value == 2
        let { applicationId, ouid } = myApp || {}
        let { error } = await API.get(`v3/defaultApp/setUserDefaultApp`, {
          ouIds: [ouid],
          appId: applicationId,
          isMobile,
          isWeb,
        })
        if (error) {
          let { options } = this || {}
          let { message } = error || 'Error Occured'
          ftoast.critical(message, options)
        } else {
          let message = this.$t('my_app.default_app_updated_successfully', {
            ns: 'account',
          })
          let { options } = this || {}
          ftoast.success(message, options)
        }
        this.refreshList()
      }
    },
    refreshList() {
      this.myAppsList = []
      this.listMyAppsForUser()
    },
    getOptionsArray(row) {
      let { isDefaultMobileApp, isDefaultApp } = row
      if (isDefaultApp && isDefaultMobileApp) {
        return []
      } else if (isDefaultApp) {
        return [
          {
            label: this.$t('my_app.set_default_mobile', { ns: 'account' }),
            value: 2,
          },
        ]
      } else if (isDefaultMobileApp) {
        return [
          {
            label: this.$t('my_app.set_default_web', { ns: 'account' }),
            value: 1,
          },
        ]
      } else {
        return this.optionsArray
      }
    },
    canShowMoreOption(row) {
      let { isDefaultMobileApp, isDefaultApp } = row
      return !(isDefaultMobileApp && isDefaultApp)
    },
  },
  computed: {
    options() {
      return {
        manualClear: this.manualClear,
        menuType: this.menuType,
        timeout: this.timeout,
      }
    },
  },
}
</script>
