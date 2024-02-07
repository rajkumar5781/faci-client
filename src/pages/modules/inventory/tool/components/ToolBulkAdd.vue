<template>
  <FModal
    :title="$t('inventory.storeroom.tool_bulk_add', { ns: 'inventory' })"
    :visible="visible"
    :cancelText="this.$t('cancel')"
    :saveText="this.$t('save')"
    size="L"
    :hideFooter="false"
    @ok="saveToolBulkAddForm"
    @cancel="cancelForm"
  >
    <FContainer
      v-if="loading"
      height="300px"
      display="flex"
      justifyContent="center"
      alignItems="center"
      padding="sectionLarge"
    >
      <FSpinner :size="30" />
    </FContainer>
    <FContainer v-else minHeight="300px">
      <FContainer
        display="flex"
        paddingTop="containerXxLarge"
        paddingLeft="containerXxLarge"
        paddingRight="containerXxLarge"
        marginLeft="containerLarge"
      >
        <FContainer width="200px">
          <FText appearance="headingMed14" color="textMain">
            {{ $t('inventory.tool_type', { ns: 'inventory' }) }}
          </FText>
        </FContainer>
        <FContainer width="200px" marginLeft="containerXxLarge">
          <FText appearance="headingMed14" color="textMain">
            {{ 'Bin' }}
          </FText>
        </FContainer>
        <FContainer width="120px" marginLeft="containerXxLarge">
          <FText appearance="headingMed14" color="textMain">
            {{ $t('inventory.quantity', { ns: 'inventory' }) }}
          </FText>
        </FContainer>
        <FContainer width="150px" marginLeft="containerXxLarge">
          <FText appearance="headingMed14" color="textMain">
            {{ $t('inventory.unit_price', { ns: 'inventory' }) }}
          </FText>
        </FContainer>
        <FContainer width="150px" marginLeft="containerXxLarge">
          <FText appearance="headingMed14" color="textMain">
            {{ $t('inventory.cost', { ns: 'inventory' }) }}
          </FText>
        </FContainer>
      </FContainer>
      <FContainer v-for="(addTool, index) in toolData" :key="index">
        <FContainer
          display="flex"
          paddingTop="containerXxLarge"
          paddingLeft="containerXxLarge"
          paddingRight="containerXxLarge"
          marginLeft="containerLarge"
        >
          <FContainer width="200px">
            <FSelect
              v-model="addTool.toolType.id"
              :options="toolTypesList"
              :placeholder="
                $t('inventory.storeroom.select_tool', { ns: 'inventory' })
              "
              size="medium"
              :clearable="false"
              @change="addToolFormData(formData, addTool.toolType.id, index)"
            >
            </FSelect>
          </FContainer>
          <FContainer width="200px" marginLeft="containerXxLarge">
            <FSelect
              v-model="addTool.bin.id"
              :options="getBinListForToolType(addTool.toolType.id)"
              :allowCreate="true"
              :clearable="false"
              filterable
              @addOption="name => addNewBin(name, addTool)"
              :placeholder="'Select Bin'"
              size="medium"
            >
            </FSelect>
          </FContainer>
          <FContainer width="120px" marginLeft="containerXxLarge">
            <FInput
              v-model="addTool.purchasedTools[0].quantity"
              type="number"
              :placeholder="
                $t('inventory.storeroom.quantity', { ns: 'inventory' })
              "
              appearance="default"
              size="medium"
            />
          </FContainer>
          <FContainer width="150px" marginLeft="containerXxLarge">
            <FInput
              v-model="addTool.purchasedTools[0].unitPrice"
              type="number"
              appearance="default"
              :placeholder="
                $t('inventory.storeroom.enter_price', { ns: 'inventory' })
              "
              size="medium"
            />
          </FContainer>
          <FContainer
            width="150px"
            display="flex"
            alignItems="center"
            justifyContent="left"
            marginLeft="containerXxLarge"
          >
            <FText appearance="headingMed14" columnGap="4px">
              {{ addTool.costValue }}
            </FText>
          </FContainer>
          <FContainer
            marginLeft="containerXxLarge"
            display="flex"
            alignItems="center"
            justifyContent="center"
            width="60px"
          >
            <FButton
              v-if="formData.length > 1"
              iconGroup="action"
              iconName="delete"
              size="medium"
              appearance="tertiary"
              @click="removeToolFormDataEntry(formData, index)"
            ></FButton>
          </FContainer>
        </FContainer>
      </FContainer>
      <FContainer
        paddingTop="containerXxLarge"
        paddingBottom="containerXLarge"
        paddingLeft="containerXLarge"
        paddingRight="containerXLarge"
        marginLeft="containerLarge"
      >
        <FButton
          iconGroup="sign-symbols"
          iconName="addition"
          size="medium"
          appearance="tertiary"
          @click="addToolFormDataEntry(formData)"
          iconPosition="prefix"
          color="backgroundPrimaryDefault"
        >
          <FText color="backgroundPrimaryDefault">
            {{ $t('inventory.service.add', { ns: 'inventory' }) }}
          </FText>
        </FButton>
      </FContainer>
    </FContainer>
  </FModal>
</template>
<script>
import { API } from '@facilio/api'
import { loadNonIndTrackedInventory } from '/src/pages/modules/inventory/utils/InventoryUtil.js'
import { dset as setProperty } from 'dset'
import { Lookup } from '@facilio/ui/new-forms'
import cloneDeep from 'lodash/cloneDeep'
import getProperty from 'dlv'

import { isEmpty } from '@facilio/utils/validation'
import {
  FContainer,
  FText,
  FIcon,
  FTable,
  FModal,
  ftoast,
  FButton,
  FSelect,
  FSpinner,
  FForm,
  FFormItem,
  FEmptyState,
  FPagination,
  FInput,
} from '@facilio/design-system'

export default {
  name: 'ToolBulkAdd',
  props: ['toolList', 'storeRoom', 'visible'],
  components: {
    FText,
    FContainer,
    FIcon,
    FTable,
    FModal,
    FButton,
    ftoast,
    FSelect,
    FSpinner,
    FForm,
    FFormItem,
    FEmptyState,
    FPagination,
    FInput,
    Lookup,
  },
  data() {
    return {
      toolTypesList: [],
      binList: [],
      formData: [],
      loading: true,
      negativeIndex: -1,
      toolId: null,
      metaFieldTypeMap: {},
    }
  },
  async created() {
    this.loading = true
    await this.loadBinPickList()
    await this.loadNonRotatingToolTypes()
    this.loading = false
  },

  computed: {
    tools() {
      return this.toolList.filter(
        i => i.toolType.isRotating === false || !i.toolType.isRotating
      )
    },
    toolData() {
      let { formData = [] } = this
      return formData.map(addTool => {
        let costValue =
          getProperty(addTool, 'purchasedTools.0.quantity') > 0 &&
          getProperty(addTool, 'purchasedTools.0.unitPrice') > 0
            ? getProperty(addTool, 'purchasedTools.0.quantity') *
              getProperty(addTool, 'purchasedTools.0.unitPrice')
            : '0'
        return { ...addTool, costValue }
      })
    },
  },
  methods: {
    isEmpty,
    async loadNonRotatingToolTypes() {
      let toolTypes = await loadNonIndTrackedInventory('toolTypes')
      if (!isEmpty(toolTypes)) {
        this.toolTypesList = toolTypes.map(tool => ({
          value: tool.id,
          label: tool.name,
        }))

        this.fillFormData()
      }
    },
    addNewBin(binName, addTool) {
      let toolTypeId = addTool.toolType.id
      let { negativeIndex } = this
      if (isEmpty(binName)) {
        return
      }
      let { binList } = this
      let newOption = {
        name: binName,
        tool: {
          toolType: {
            id: toolTypeId,
          },
        },
        id: negativeIndex,
      }
      setProperty(addTool, 'bin.id', negativeIndex)
      setProperty(this, 'binList', [newOption, ...binList])
      this.negativeIndex = negativeIndex - 1
    },
    isSelected(id, index) {
      for (let i in this.formData) {
        if (this.formData[i].toolType.id === id) {
          if (parseInt(i) === index) {
            return false
          }
          return true
        }
      }
      return false
    },
    cancelForm() {
      this.$emit('closeDialog')
    },
    async loadBinPickList() {
      let { storeRoom = {} } = this
      let { id } = storeRoom
      if (isEmpty(id)) {
        return
      }
      let filters = {}

      filters = {
        oneLevelLookup: {
          tool: [
            {
              operatorId: 35,
              criteriaValue: {
                storeRoom: { operatorId: 36, value: [`${id}`] },
              },
            },
          ],
        },
      }

      let params = {
        filters: JSON.stringify(filters),
        force: true,
      }
      let { error, list = [] } = await API.fetchAll('bin', params)

      if (error) {
        ftoast.critical(error.message || 'Error Occured')
      } else {
        this.binList = list
      }
    },
    getBinListForToolType(toolTypeId) {
      let toolBins = []
      let { binList = [] } = this
      binList.forEach(bin => {
        let { tool = {} } = bin
        let { toolType = {} } = tool
        let { id } = toolType
        if (isEmpty(id)) {
          return
        }
        if (toolTypeId === id) {
          toolBins.push({ label: bin.name, value: bin.id })
        }
      })

      return toolBins
    },

    async saveToolBulkAddForm() {
      let updateTools = []
      let createTools = []

      let { formData = [] } = this
      let toolList = cloneDeep(formData)
      for (let idx in toolList) {
        let data = toolList[idx]
        let quantity = getProperty(data, `purchasedTools.0.quantity`)
        let unitPrice = getProperty(data, `purchasedTools.0.unitPrice`)

        if (
          data.purchasedTools[0].hasOwnProperty('quantity') &&
          quantity === null &&
          data.purchasedTools[0].hasOwnProperty('unitPrice') &&
          unitPrice === null
        ) {
          continue
        }
        if (isEmpty(quantity)) {
          ftoast.critical('Please enter the Quantity')
          return
        }
        if (isEmpty(unitPrice)) {
          ftoast.critical('Please enter the Unit Price')
          return
        }
        let storeroomId = getProperty(this, 'storeRoom.id')
        let toolTypeId = getProperty(data, `toolType.id`)

        let toolTypeObj = getProperty(data, `toolType`)
        if (toolTypeObj && toolTypeId) {
          data['storeRoom'] = { id: storeroomId }
          let status = await this.isAlreadyPresentInStore(
            toolTypeId,
            storeroomId
          )
          let binId = getProperty(data, `bin.id`)

          if (binId != null) {
            let bin = this.getBinForId(binId) || {}
            data.purchasedTools[0]['bin'] = bin
          }
          if (status) {
            let existingToolIndex = this.toolAlreadyPresent(updateTools, data)
            if (existingToolIndex >= 0) {
              let { purchasedTools } = updateTools[existingToolIndex]
              purchasedTools.push(data.purchasedTools[0])
              updateTools[existingToolIndex].purchasedTools = purchasedTools
            } else {
              data['id'] = this.toolId
              updateTools.push(data)
            }
          } else {
            let existingToolIndex = this.toolAlreadyPresent(createTools, data)
            if (existingToolIndex >= 0) {
              let { purchasedTools } = createTools[existingToolIndex]
              purchasedTools.push(data.purchasedTools[0])
              createTools[existingToolIndex].purchasedTools = purchasedTools
            } else {
              data['costType'] = 1
              createTools.push(data)
            }
          }
        }
      }
      if (createTools.length === 0 && updateTools.length === 0) {
        ftoast.critical('Kindly enter Tools to add')
        return
      }
      let promise
      if (createTools.length > 0) {
        let url = 'v3/modules/data/bulkCreate'
        let params = {
          data: {
            tool: createTools,
          },
          moduleName: 'tool',
        }
        promise = await API.post(url, params)
      }
      if (updateTools.length > 0) {
        let url = 'v3/modules/data/bulkpatch'
        let params = {
          data: {
            tool: updateTools,
          },
          moduleName: 'tool',
        }
        promise = await API.post(url, params)
      }
      let { error } = (await promise) || {}
      if (error) {
        ftoast.critical(error.message || 'Error Occurred while stocking tools')
      } else {
        ftoast.success(`Added successfully`)
        this.cancelForm()
        this.$emit('refresh')
      }
    },
    toolAlreadyPresent(toolList, tool) {
      let toolTypeId = getProperty(tool, `toolType.id`)
      let index = toolList.findIndex(it => {
        let currentToolTypeId = getProperty(it, `toolType.id`)
        return toolTypeId === currentToolTypeId && toolTypeId != null
      })
      return index
    },
    getBinForId(id) {
      let { binList = [] } = this
      return binList.find(bin => bin.id === id)
    },
    async isAlreadyPresentInStore(toolTypeId, storeId) {
      let params = {
        filters: JSON.stringify({
          toolType: {
            operatorId: 36,
            value: [toolTypeId + ''],
          },
          storeRoom: {
            operatorId: 36,
            value: [storeId + ''],
          },
        }),
      }
      let { list, error } = await API.fetchAll('tool', params)
      if (error) {
        ftoast.critical(
          error.message || 'Error ocurred while checking the availability'
        )
        return false
      } else {
        if (list.length > 0) {
          this.toolId = list[0].id
        }
        return list.length > 0
      }
    },
    removeToolFormDataEntry(list, index) {
      list.splice(index, 1)
    },
    addToolFormData(field, id, index) {
      let tool = this.tools.findIndex(element => element.toolType.id === id)
      let { defaultBin = {} } = this.tools[tool] || {}
      let binId = defaultBin?.id
      let currentRecord = field[index]
      currentRecord.bin = { id: binId }
    },
    addToolFormDataEntry(field) {
      field.push({
        toolType: { id: null },
        bin: { id: null },
        purchasedTools: [{ quantity: null, unitPrice: null }],
      })
    },
    fillFormData() {
      if (this.tools.length === 0) {
        let t = {
          toolType: { id: null },
          bin: { id: null },
          purchasedTools: [{ quantity: null, unitPrice: null }],
        }
        this.formData.push(t)
      }
      for (let i in this.tools) {
        if (i === '10') {
          break
        } else {
          let defaultBin = this.tools[i].defaultBin
          let bin = !isEmpty(defaultBin) ? defaultBin : { id: null }
          let temp = {
            toolType: { id: this.tools[i].toolType.id },
            bin,
            purchasedTools: [{ quantity: null, unitPrice: null }],
          }
          this.formData.push(temp)
        }
      }
    },
  },
}
</script>
