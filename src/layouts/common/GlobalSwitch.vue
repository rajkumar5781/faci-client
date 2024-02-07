<template>
  <FContainer margin="containerNone containerXxLarge">
    <FPopover
      @show="() => (showPopover = true)"
      @hide="() => (showPopover = false)"
      trigger="clickToOpen"
      placement="bottom-end"
    >
      <FContainer v-if="initialLoading" display="flex">
        <FShimmer
          v-if="initialLoading"
          :rounded="false"
          :height="32"
          :width="100"
        />
      </FContainer>
      <FContainer
        v-else-if="!isEmpty(switchLinkName)"
        gradient="grey"
        borderColor="backgroundMidgroundDark"
        borderRadius="high"
        backgroundColor="backgroundMidgroundSubtle"
        hover-backgroundColor="backgroundMidgroundDark"
        padding="containerLarge containerLarge"
        cursor="pointer"
        display="flex"
        maxWidth="212px"
        height="32px"
      >
        <FIcon
          v-if="!isEmpty(moduleIconGroup)"
          :key="moduleIconName"
          :group="moduleIconGroup"
          :name="moduleIconName"
          size="16"
          :pressable="false"
        ></FIcon>
        <FText
          textOverflow="ellipsis"
          overflow="hidden"
          whiteSpace="nowrap"
          marginLeft="containerLarge"
          display="flex"
          alignItems="center"
          appearance="headingMed14"
        >
          {{ getProperty(defaultValue, 'displayName') }}
        </FText>
        <FIcon
          marginLeft="containerLarge"
          size="16"
          :pressable="false"
          group="dsm"
          :name="showPopover ? 'chevron-up' : 'chevron-down'"
        ></FIcon>
      </FContainer>
      <template #content>
        <FContainer
          width="240px"
          height="292px"
          borderRadius="high"
          borderColor="borderNeutralBaseSubtle"
        >
          <FContainer
            height="48px"
            padding="containerLarge containerXLarge"
            borderBottom="1px solid"
            borderColor="borderNeutralBaseSubtle"
          >
            <FInput
              prefix-icon="building"
              size="medium"
              @input="loadFilteredOptions"
              v-model="searchText"
              :placeholder="$t('search_here')"
            >
              <template #prefix>
                <FIcon
                  :pressable="false"
                  size="16"
                  color="iconNeutralLight"
                  group="action"
                  name="search"
                />
              </template>
            </FInput>
          </FContainer>
          <FContainer
            v-if="loading"
            height="240px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            overflow="scroll"
          >
            <FSpinner :size="24" />
          </FContainer>
          <FContainer
            v-else
            padding="containerSmall containerXLarge"
            height="240px"
            overflow="scroll"
          >
            <template v-if="isEmpty(moduleOptionList)">
              <FText
                height="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {{ $t('no_data') }}
              </FText>
            </template>
            <template>
              <FContainer
                v-for="(record, index) in moduleOptionList"
                :key="index"
                height="40px"
                width="100%"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                marginTop="containerMedium"
                overflow="hidden"
                whiteSpace="nowrap"
              >
                <FMenuItem
                  @click="setSwitchValue(getProperty(record, 'value'))"
                  :isSelected="isSelectedRecord(record)"
                >
                  <FContainer
                    width="170px"
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    overflow="hidden"
                  >
                    <FText
                      :appearance="
                        isSelectedRecord(record) ? 'headingMed14' : 'bodyReg14'
                      "
                      >{{ getProperty(record, 'label') }}
                    </FText>
                    <FIcon
                      v-if="record?.isDecommissioned"
                      size="16"
                      group="alert"
                      name="decommissioning"
                      :pressable="false"
                    ></FIcon>
                  </FContainer>
                </FMenuItem>
              </FContainer>
            </template>
          </FContainer>
        </FContainer>
      </template>
    </FPopover>
  </FContainer>
</template>

<script>
import { getApp } from '@facilio/router'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import Vue from 'vue'
import debounce from 'lodash/debounce'
import getProperty from 'dlv'

import {
  FContainer,
  FText,
  FTooltip,
  FIcon,
  FPopover,
  FInput,
  FMenuItem,
  FSpinner,
  FShimmer,
} from '@facilio/design-system'
const MODULE_ICON = {
  site: { group: 'default', name: 'site', displayName: 'Sites' },
  building: { group: 'portfolio', name: 'building', displayName: 'Buildings'  },
  territory: { group: 'modules', name: 'territory', displayName: 'Territories'  },
  vendors: { group: 'modules', name: 'vendor', displayName: 'Vendors'  },
  tenant: { group: 'modules', name: 'tenant', displayName: 'Tenants'  },
  client: { group: 'modules', name: 'client', displayName: 'Clients'  },
  storeRoom: { group: 'product', name: 'store-room', displayName: 'Storerooms'  },
  default: { group: 'toggle', name: 'radio-select', displayName: ''  },
  decommissioning: { group: 'alert', name: 'decommissioning', displayName: '' },
}
export default {
  components: {
    FContainer,
    FText,
    FTooltip,
    FIcon,
    FPopover,
    FInput,
    FMenuItem,
    FSpinner,
    FShimmer,
  },
  data() {
    return {
      moduleName: null,
      searchText: null,
      moduleOptionList: [],
      switchLinkName: null,
      isEmpty,
      getProperty,
      loading: true,
      initialLoading: true,
      showPopover: false,
      defaultValue: null,
    }
  },
  async created() {
    await this.getSwitchVariable()
    await this.loadModuleOptions()
    this.setDefaultValue()
    this.initialLoading = false
  },
  computed: {
    moduleIconGroup() {
      let { moduleIconConfig } = this
      return moduleIconConfig?.group
    },
    moduleIconName() {
      let { moduleIconConfig } = this
      return moduleIconConfig?.name
    },
    switchName() {
      return getProperty(MODULE_ICON,`${this.moduleName}.displayName`)
    },
    moduleIconConfig() {
      let { moduleName, defaultValue } = this
      if (defaultValue?.isDecommissioned) {
        moduleName = 'decommissioning'
      }
      if (isEmpty(MODULE_ICON[moduleName])) {
        moduleName = 'default'
      }
      return MODULE_ICON[moduleName]
    },
    switchCookieValue() {
      let cookieValue = Vue.cookie.get('fc.switchValue') || null
      return cookieValue
    },
    selectedId: {
      get() {
        let { linkName } = getApp() || {}
        let cookieValue = this.switchCookieValue
        if (cookieValue && cookieValue !== 'null' && !isEmpty(linkName)) {
          let convertedValue = atob(cookieValue)
          let decodedValue = JSON.parse(convertedValue)
          let { [linkName]: encodedAppSwitchValue } = decodedValue || {}
          if (!isEmpty(encodedAppSwitchValue)) {
            let decodedAppValue = atob(encodedAppSwitchValue)
            let appSpecificValue = JSON.parse(decodedAppValue)
            let { [this.switchLinkName]: selectedIdArr } =
              appSpecificValue || {}
            let [selectedId] = selectedIdArr || []
            if (!isEmpty(selectedId)) {
              return Number(selectedId)
            }
          }
        }
        return null
      },
      set(value) {
        let cookieValue = this.switchCookieValue
        if (cookieValue && cookieValue !== 'null' && !isEmpty(cookieValue)) {
          cookieValue = JSON.parse(atob(cookieValue))
        } else {
          cookieValue = {}
        }
        let encodedValue = null
        let appAllEncodedValue = null
        if (!isEmpty(value)) {
          let actualValue = { [this.switchLinkName]: [value.toString()] }
          encodedValue = btoa(JSON.stringify(actualValue))
        }
        let { linkName } = getApp() || {}
        if (!isEmpty(linkName)) {
          cookieValue[linkName] = encodedValue
          appAllEncodedValue = btoa(JSON.stringify(cookieValue))
        }

        let { selectedId } = this || {}
        if (value !== selectedId) {
          Vue.cookie.set('fc.switchValue', appAllEncodedValue, {
            expires: '10Y',
            path: '/',
          })
          window.location.href = window.location.pathname
        }
      },
    },
  },
  methods: {
    setDefaultValue() {
      let { selectedId, moduleOptionList, switchName } = this
      let displayName = `${this.$t('all')} ${switchName}`
      let isDecommissioned = false
      if (!isEmpty(moduleOptionList)) {
        moduleOptionList.forEach(option => {
          let { value, label, fourthLabel } = option || {}
          if (value === selectedId) {
            displayName = label
            if (!isEmpty(fourthLabel) && fourthLabel === 'true') {
              isDecommissioned = true
            }
          }
        })
      }
      this.defaultValue = { displayName, isDecommissioned }
    },
    isSelectedRecord(record) {
      let { value } = record || {}
      let { selectedId } = this || {}
      return value === selectedId
    },
    setSwitchValue(id) {
      if (id && id !== 'null') {
        this.selectedId = Number(id)
      } else this.selectedId = null
    },
    loadFilteredOptions: debounce(async function () {
      await this.loadModuleOptions()
    }, 500),
    async getSwitchVariable() {
      let url = `v3/switchVariable/getSwitchVariable`
      let { error, data } = await API.get(url, { force: true })
      if (error) {
        this.$message.error(
          error.message || this.$t('error_occurred_short_message')
        )
      } else {
        let [switchVariable] = data?.switchVariable || []
        if (!isEmpty(switchVariable)) {
          this.hasSwitch = true
          this.moduleName = getProperty(
            switchVariable,
            'applicableModuleName',
            null
          )
          this.switchLinkName = getProperty(switchVariable, 'linkName', null)
        }
      }
    },
    async loadModuleOptions() {
      this.loading = true
      let { moduleName, searchText,switchName } = this
      if (isEmpty(moduleName)) return
      let optionList = {}
      let { data, error } = await API.get(
        `v3/scopeVariable/options/${moduleName}`,
        {
          moduleName,
          search: searchText,
          page: 1,
          perPage: 10,
          default: this.selectedId,
          isToFetchDecommissionedResource: true,
        },
        {},
        {
          removeSwitchFilter: true,
        }
      )
      if (!error) {
        let { pickList } = data || {}
        optionList = []
        if (isEmpty(searchText)) {
          optionList = [
            {
              value: null,
              label: `${this.$t('all')} ${switchName}`,
              isDecommissioned: false,
            },
          ]
        }
        if (!isEmpty(pickList)) {
          Object.values(pickList).forEach(option => {
            let { fourthLabel } = option || {}
            let isDecommissioned = false
            if (!isEmpty(fourthLabel) && fourthLabel === 'true') {
              isDecommissioned = true
            }
            optionList.push({ ...option, isDecommissioned })
          })
        }
      }
      this.moduleOptionList = optionList
      this.loading = false
    },
  },
}
</script>
