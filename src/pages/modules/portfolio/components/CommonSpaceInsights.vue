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
            v-if="slotList.length > 0"
            height="100%"
            width="100%"
            backgroundColor="backgroundMidgroundSubtle"
            justify-content="center"
            display="flex"
            flex-direction="column"
            align-items="center"
            border-radius="high"
          >
            <FContainer
              :cursor="modifiedSlots[0].name === 'Assets' ? `pointer` : `auto`"
              @click="redirectToList(modifiedSlots[0])"
            >
              <FText appearance="bodyReg14">
                {{ modifiedSlots[0].name }}
              </FText>
            </FContainer>
            <FContainer>
              <FText
                appearance="headingMed20"
                :color="
                  modifiedSlots[0].name === 'Assets'
                    ? `backgroundPrimaryDefault`
                    : `textDefault`
                "
              >
                {{ modifiedSlots[0].count }}
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
                {{ modifiedSlots[1].name }}
              </FText>
            </FContainer>
            <FContainer
              :cursor="modifiedSlots[1].name === 'Assets' ? `pointer` : `auto`"
              @click="redirectToList(modifiedSlots[1])"
            >
              <FText
                appearance="headingMed20"
                :color="
                  modifiedSlots[1].name === 'Assets'
                    ? `backgroundPrimaryDefault`
                    : `textDefault`
                "
              >
                {{ modifiedSlots[1].count }}
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
                {{ modifiedSlots[4].name }}
              </FText>
            </FContainer>
            <FContainer
              :cursor="modifiedSlots[4].name === 'Assets' ? `pointer` : `auto`"
              @click="redirectToList(modifiedSlots[4])"
            >
              <FText
                appearance="headingMed20"
                :color="
                  modifiedSlots[4].name === 'Assets'
                    ? `backgroundPrimaryDefault`
                    : `textDefault`
                "
              >
                {{ modifiedSlots[4].count }}
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
                {{ modifiedSlots[2].name }}
              </FText>
            </FContainer>
            <FContainer
              :cursor="modifiedSlots[2].name === 'Assets' ? `pointer` : `auto`"
              @click="redirectToList(modifiedSlots[2])"
            >
              <FText
                appearance="headingMed20"
                :color="
                  modifiedSlots[2].name === 'Assets'
                    ? `backgroundPrimaryDefault`
                    : `textDefault`
                "
              >
                {{ modifiedSlots[2].count }}
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
                {{ modifiedSlots[3].name }}
              </FText>
            </FContainer>
            <FContainer
              :cursor="modifiedSlots[3].name === 'Assets' ? `pointer` : `auto`"
              @click="redirectToList(modifiedSlots[3])"
            >
              <FText
                appearance="headingMed20"
                :color="
                  modifiedSlots[3].name === 'Assets'
                    ? `backgroundPrimaryDefault`
                    : `textDefault`
                "
              >
                {{ modifiedSlots[3].count }}
              </FText>
            </FContainer>
          </FContainer>
        </FContainer>
        <FContainer width="33%"> </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import { FContainer, FText, FSpinner } from '@facilio/design-system'
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
        return '2'
      } else if (this.moduleName == 'site') {
        return '5'
      } else if (this.moduleName == 'building') {
        return '4'
      } else {
        return '0'
      }
    },
    showFourthSlot() {
      let { slotType } = this || {}
      return ['4', '5'].includes(slotType)
    },
    showFifthSlot() {
      let { slotType } = this || {}
      return ['5'].includes(slotType)
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
          this.modifiedSlots = newSlotList
          break
        case 'floor':
          newSlotList.push(slotList[2])
          newSlotList.push(slotList[3])
          this.modifiedSlots = newSlotList
          break
        case 'space':
          newSlotList.push(slotList[5])
          newSlotList.push(slotList[3])
          this.modifiedSlots = newSlotList
          break
      }
      this.isLoading = false
    },
    redirectToList(slot) {
      if (['Assets'].includes(slot.name) && slot.count > 0) {
        let { name } = findRouteForModule('asset', pageTypes.LIST)
        if (name) {
          let { record, moduleName } = this
          let { id } = record
          let filters = {}
          if (moduleName == 'site') {
            filters = {
              siteId: {
                operatorId: 38,
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
              space: {
                operatorId: 38,
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
