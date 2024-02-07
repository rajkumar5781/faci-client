<template>
  <FContainer style="height: 100%">
    <FContainer
      v-if="loading"
      height="100%"
      display="flex"
      align-items="center"
      justify-content="center"
    >
      <FSpinner :size="30" />
    </FContainer>
    <FContainer
      v-else
      display="flex"
      flex-direction="column"
      width="100%"
      padding="containerXxLarge"
      height="100%"
      gap="containerXLarge"
    >
      <FContainer
        display="flex"
        flex-direction="row"
        position="relative"
        width="100%"
        padding="containerLarge 0px containerXLarge 0px"
        height="50%"
        gap="containerXLarge"
      >
        <FContainer width="33%">
          <FContainer
            v-if="!isEmpty(slotList)"
            height="100%"
            width="100%"
            backgroundColor="backgroundMidgroundSubtle"
            justify-content="center"
            display="flex"
            flex-direction="column"
            align-items="center"
            border-radius="high"
          >
            <FContainer>
              <FText appearance="bodyReg14">
                {{ getProperty(modifiedSlots, '0.name', '') }}
              </FText>
            </FContainer>
            <FContainer
              :cursor="setCursorType(modifiedSlots, 0)"
              @click="redirectToList(modifiedSlots, 0)"
            >
              <FText
                appearance="headingMed20"
                :color="setCountColor(modifiedSlots, 0)"
              >
                {{ getProperty(modifiedSlots, '0.count', '') }}
              </FText>
            </FContainer>
          </FContainer>
        </FContainer>
        <FContainer width="33%">
          <FContainer
            v-if="slotList.length > 1"
            height="100%"
            width="100%"
            backgroundColor="backgroundMidgroundSubtle"
            justify-content="center"
            display="flex"
            flex-direction="column"
            align-items="center"
            border-radius="high"
          >
            <FContainer>
              <FText appearance="bodyReg14">
                {{ getProperty(modifiedSlots, '1.name', '') }}
              </FText>
            </FContainer>
            <FContainer
              :cursor="setCursorType(modifiedSlots, 1)"
              @click="redirectToList(modifiedSlots, 1)"
            >
              <FText
                appearance="headingMed20"
                :color="setCountColor(modifiedSlots, 1)"
              >
                {{ getProperty(modifiedSlots, '1.count', '') }}
              </FText>
            </FContainer>
          </FContainer>
        </FContainer>
        <FContainer width="33%">
          <FContainer
            v-if="showFifthSlot"
            backgroundColor="backgroundMidgroundSubtle"
            height="100%"
            width="100%"
            justify-content="center"
            display="flex"
            flex-direction="column"
            align-items="center"
            border-radius="high"
          >
            <FContainer>
              <FText appearance="bodyReg14">
                {{ getProperty(modifiedSlots, '4.name', '') }}
              </FText>
            </FContainer>
            <FContainer
              :cursor="setCursorType(modifiedSlots, 4)"
              @click="redirectToList(modifiedSlots, 4)"
            >
              <FText
                appearance="headingMed20"
                :color="setCountColor(modifiedSlots, 4)"
              >
                {{ getProperty(modifiedSlots, '4.count', '') }}
              </FText>
            </FContainer>
          </FContainer>
        </FContainer>
      </FContainer>
      <FContainer
        display="flex"
        flex-direction="row"
        position="relative"
        width="100%"
        padding="containerLarge 0px containerXLarge 0px"
        height="50%"
        gap="containerXLarge"
      >
        <FContainer width="33%">
          <FContainer
            backgroundColor="backgroundMidgroundSubtle"
            height="100%"
            width="100%"
            justify-content="center"
            display="flex"
            flex-direction="column"
            align-items="center"
            border-radius="high"
          >
            <FContainer>
              <FText appearance="bodyReg14">
                {{ getProperty(modifiedSlots, '2.name', '') }}
              </FText>
            </FContainer>
            <FContainer
              :cursor="setCursorType(modifiedSlots, 2)"
              @click="redirectToList(modifiedSlots, 2)"
            >
              <FText
                appearance="headingMed20"
                :color="setCountColor(modifiedSlots, 2)"
              >
                {{ getProperty(modifiedSlots, '2.count', '') }}
              </FText>
            </FContainer>
          </FContainer>
        </FContainer>
        <FContainer width="33%">
          <FContainer
            v-if="showFourthSlot"
            backgroundColor="backgroundMidgroundSubtle"
            height="100%"
            width="100%"
            justify-content="center"
            display="flex"
            flex-direction="column"
            align-items="center"
            border-radius="high"
          >
            <FContainer>
              <FText appearance="bodyReg14">
                {{ getProperty(modifiedSlots, '3.name', '') }}
              </FText>
            </FContainer>
            <FContainer
              :cursor="setCursorType(modifiedSlots, 3)"
              @click="redirectToList(modifiedSlots, 3)"
            >
              <FText
                appearance="headingMed20"
                :color="setCountColor(modifiedSlots, 3)"
              >
                {{ getProperty(modifiedSlots, '3.count', '') }}
              </FText>
            </FContainer>
          </FContainer>
        </FContainer>
        <FContainer width="33%">
          <FContainer
            v-if="showSixthSlot"
            backgroundColor="backgroundMidgroundSubtle"
            height="100%"
            width="100%"
            justify-content="center"
            display="flex"
            flex-direction="column"
            align-items="center"
            border-radius="high"
          >
            <FContainer>
              <FText appearance="bodyReg14">
                {{ getProperty(modifiedSlots, '6.name', '') }}
              </FText>
            </FContainer>
            <FContainer
              :cursor="setCursorType(modifiedSlots, 6)"
              @click="redirectToList(modifiedSlots, 6)"
            >
              <FText
                appearance="headingMed20"
                :color="setCountColor(modifiedSlots, 6)"
              >
                {{ getProperty(modifiedSlots, '6.count', '') }}
              </FText>
            </FContainer>
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import { FContainer, FText, FSpinner } from '@facilio/design-system'
import getProperty from 'dlv'
import { isEmpty } from '@facilio/utils/validation'
import { findRouteForModule, pageTypes } from '@facilio/router'
export default {
  components: {
    FContainer,
    FText,
    FSpinner,
  },
  props: ['slotList', 'moduleName', 'record'],
  computed: {
    slotType() {
      if (['floor', 'space'].includes(this.moduleName)) {
        return '3'
      } else if (this.moduleName == 'site') {
        return '6'
      } else if (this.moduleName == 'building') {
        return '5'
      } else {
        return '0'
      }
    },
    redirectingModules() {
      return [
        this.$t('portfolio.insights.assets', { ns: 'portfolio' }),
        this.$t('portfolio.insights.meters', { ns: 'portfolio' }),
      ]
    },
    assetModuleName() {
      return this.$t('portfolio.insights.assets', { ns: 'portfolio' })
    },
    showFourthSlot() {
      let { slotType } = this || {}
      return ['6', '5'].includes(slotType)
    },
    showFifthSlot() {
      let { slotType } = this || {}
      return ['6', '5'].includes(slotType)
    },
    showSixthSlot() {
      let { slotType } = this || {}
      return ['6'].includes(slotType)
    },
    loading() {
      let { isLoading } = this
      return isLoading
    },
  },
  created() {
    this.initSlotList()
  },
  data() {
    return {
      modifiedSlots: [],
      isLoading: false,
    }
  },
  methods: {
    getProperty,
    isEmpty,
    initSlotList() {
      this.isLoading = true
      let slotList = this.slotList
      this.modifiedSlots = this.slotList
      let newSlotList = []
      let { moduleName } = this || {}
      switch (moduleName) {
        case 'building':
          newSlotList.push(slotList[1])
          newSlotList.push(slotList[4])
          newSlotList.push(slotList[2])
          newSlotList.push(slotList[3])
          newSlotList.push(slotList[6])
          this.modifiedSlots = newSlotList
          break
        case 'floor':
          newSlotList.push(slotList[2])
          newSlotList.push(slotList[3])
          newSlotList.push(slotList[6])
          this.modifiedSlots = newSlotList
          break
        case 'space':
          newSlotList.push(slotList[5])
          newSlotList.push(slotList[3])
          newSlotList.push(slotList[6])
          this.modifiedSlots = newSlotList
          break
      }
      this.isLoading = false
    },
    setCursorType(slots = [], index) {
      let { redirectingModules = [] } = this
      let slot = getProperty(slots, `${index}`, {})
      let { name } = slot || {}
      return redirectingModules.includes(name) ? `pointer` : `auto`
    },
    setCountColor(slots = [], index) {
      let { redirectingModules = [] } = this
      let slot = getProperty(slots, `${index}`, {})
      let { name } = slot || {}
      return redirectingModules.includes(name)
        ? `backgroundPrimaryDefault`
        : `textDefault`
    },
    redirectToList(slots = [], index) {
      let { redirectingModules = [], assetModuleName } = this
      let slot = getProperty(slots, `${index}`, {})
      let { name : slotName, count } = slot || {}
      if (redirectingModules.includes(slotName) && count > 0) {
        let { name } = findRouteForModule(assetModuleName === slotName ? 'asset' : 'meter', pageTypes.LIST)
        if (name) {
          let { record, moduleName } = this
          let { id } = record
          let filters = {}
          if (moduleName == 'site') {
            filters = {
              siteId: {
                operatorId: 36,
                value: [`${id}`],
                operatorLookupModule: {
                  displayName: 'Site',
                  filters: null,
                  name: `${moduleName}`,
                  showPopup: false,
                },
              },
              oneLevelLookup: {},
            }
          } else {
            filters = {
              [assetModuleName === slotName ? 'space' : 'meterLocation']: {
                operatorId: assetModuleName === slotName ? 36 : 38,
                value: [`${id}`],
                operatorLookupModule: {
                  displayName: 'Base Space',
                  filters: null,
                  name: 'baseSpace',
                  showPopup: false,
                },
              },
              oneLevelLookup: {},
            }
          }
          const routeData = this.$router.resolve({
            name,
            viewname: 'all',
            query: { search: JSON.stringify(filters) },
          })
          window.open(routeData.href, '_blank')
        }
      }
    },
  },
}
</script>
