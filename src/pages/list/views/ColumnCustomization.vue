<template>
  <FPopover
    v-model="showContent"
    trigger="clickToOpen"
    placement="bottom-end"
    @hide="closeContent"
    ref="custom-container"
  >
    <FTooltip placement="top">
      <template slot="title">
        {{ $t('column_customization.title') }}
      </template>
      <FIcon group="action" name="add-column" size="18" @click="openForm" />
    </FTooltip>

    <FContainer
      v-if="showContent"
      slot="content"
      borderRadius="high"
      display="flex"
      flexDirection="column"
      width="320px"
      maxHeight="520px"
    >
      <FContainer
        display="flex"
        padding="containerMedium containerXLarge"
        borderBottom="1px solid"
        borderColor="borderNeutralBaseSubtler"
      >
        <FText
          appearance="headingMed14"
          lineHeight="130%"
          display="flex"
          height="32px"
          alignItems="center"
          >{{ $t('column_customization.title') }}</FText
        >
      </FContainer>

      <FContainer
        padding="containerLarge containerXLarge"
        borderBottom="1px solid"
        borderColor="borderNeutralBaseSubtler"
      >
        <FInput
          v-model="searchText"
          size="medium"
          :placeholder="$t('column_customization.search')"
        >
          <template #prefix>
            <FIcon
              group="action"
              name="search"
              size="16"
              color="iconNeutralLight"
              :pressable="false"
            />
          </template>
        </FInput>
      </FContainer>

      <FContainer height="100%" overflow="auto">
        <FContainer
          v-if="
            isEmpty(filteredFrozenFields) && isEmpty(filteredFlexibleFields)
          "
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <FEmptyState
            illustration="no-entries"
            :title="$t('column_customization.no_fields')"
            :vertical="false"
            size="S"
          />
        </FContainer>
        <FContainer v-else>
          <FContainer
            v-if="!isEmpty(filteredFrozenFields)"
            display="flex"
            flexDirection="column"
            padding="containerLarge containerXLarge"
            rowGap="containerMedium"
            borderBottom="1px solid"
            borderColor="borderNeutralBaseSubtler"
          >
            <FText appearance="captionMed10" color="textCaption">
              {{ $t('column_customization.frozen') }}
            </FText>
            <FContainer
              v-for="field in filteredFrozenFields"
              :key="field.name"
              padding="containerLarge containerMedium"
              display="flex"
              alignItems="center"
              columnGap="containerLarge"
              height="40px"
            >
              <FContainer v-if="field.fixed" display="flex"
                ><FContainer paddingRight="containerLarge"
                  ><FIcon
                    group="action"
                    name="lock"
                    size="14"
                    :pressable="false"
                /></FContainer>
                <FText appearance="bodyReg14" color="textMain">{{
                  field.displayName
                }}</FText>
              </FContainer>
              <FCheckbox
                v-else
                v-model="selectedFieldsMap[field.name]"
                color="textMain"
                >{{ field.displayName }}</FCheckbox
              >
            </FContainer>
          </FContainer>

          <FContainer
            v-if="!isEmpty(filteredFlexibleFields)"
            display="flex"
            flexDirection="column"
            padding="containerLarge containerXLarge"
            rowGap="containerMedium"
          >
            <FText appearance="captionMed10" color="textCaption">
              {{ $t('column_customization.flexible') }}
            </FText>
            <Draggable
              :options="dragOptions"
              :list="flexibleFields"
              data-parent="default"
              class="flex flex-col"
              style="row-gap: var(--spacing-containerMedium)"
            >
              <FContainer
                v-for="field in filteredFlexibleFields"
                :key="field.name"
                padding="containerLarge containerMedium"
                display="flex"
                alignItems="center"
                columnGap="containerLarge"
                :hover-backgroundColor="getBackgroundColour(field.name)"
                borderRadius="medium"
                class="hover-effect"
                height="40px"
                width="100%"
              >
                <FContainer
                  v-if="showInputBox(field.name)"
                  display="flex"
                  alignItems="center"
                  width="100%"
                  columnGap="containerLarge"
                >
                  <FInput
                    ref="editedName"
                    v-model="fieldValue"
                    size="medium"
                    padding="containerLarge containerXLarge"
                    :placeholder="$t('column_customization.edit_name')"
                    @enterPress="updateFieldName"
                  >
                  </FInput>
                  <FContainer
                    display="flex"
                    alignItems="center"
                    borderRadius="medium"
                    hover-backgroundColor="backgroundNeutralHovered"
                    cursor="pointer"
                    style="padding: 6px"
                  >
                    <fc-icon
                      group="alert"
                      name="circle-clear-all-filled"
                      size="16"
                      @click.stop="setEditFieldName"
                    ></fc-icon>
                  </FContainer>
                  <FContainer
                    backgroundColor="backgroundPrimaryDefault"
                    cursor="pointer"
                    display="flex"
                    alignItems="center"
                    borderRadius="medium"
                    style="padding: 6px"
                  >
                    <fc-icon
                      group="alert"
                      name="circle-tick-filled"
                      size="16"
                      color="#fff"
                      @click.stop="updateFieldName"
                    ></fc-icon>
                  </FContainer>
                </FContainer>
                <FContainer
                  v-else
                  display="flex"
                  flexGrow="1"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <FContainer
                    display="flex"
                    alignItems="center"
                    columnGap="containerLarge"
                  >
                    <FIcon
                      v-if="isEmpty(searchText)"
                      group="action"
                      name="drag"
                      size="14"
                      cursor="move"
                      :pressable="false"
                      hover-pointer="”drag”"
                      color="iconNeutralLight"
                      class="icon-right visible"
                    />

                    <FCheckbox
                      v-model="selectedFieldsMap[field.name]"
                      color="textMain"
                    >
                      {{ field.displayName }}
                    </FCheckbox>
                  </FContainer>

                  <FIcon
                    v-if="
                      selectedFieldsMap[field.name] && isEmpty(editFieldName)
                    "
                    group="edit"
                    name="edit-line"
                    size="14"
                    @click.stop="setEditFieldName(field)"
                    class="edit-view-icon"
                  />
                </FContainer>
              </FContainer>
            </Draggable>
          </FContainer>
        </FContainer>
      </FContainer>

      <FContainer
        display="flex"
        justifyContent="end"
        width="100%"
        flexShrink="0"
        padding="containerLarge containerXLarge"
        columnGap="containerLarge"
        borderTop="1px solid"
        borderColor="borderNeutralBaseSubtler"
      >
        <FButton appearance="secondary" @click="closeContent" size="medium">{{
          $t('column_customization.cancel')
        }}</FButton>
        <FButton
          appearance="primary"
          @click="save"
          :loading="isSaving"
          size="medium"
          >{{ $t('column_customization.save') }}</FButton
        >
      </FContainer>
    </FContainer>
  </FPopover>
</template>
<script>
import {
  FPopover,
  FCheckbox,
  FContainer,
  FButton,
  FText,
  FDivider,
  FIcon,
  FInput,
  FTooltip,
  FEmptyState,
  ftoast,
} from '@facilio/design-system'
import Draggable from 'vuedraggable'
import { API } from '@facilio/api'
import { mapActions } from 'pinia'
import viewStore from '../../../store/views'
import { isEmpty } from '@facilio/utils/validation'

export default {
  props: [
    'moduleName',
    'viewName',
    'viewFields',
    'fitToScreen',
    'parentModuleName',
  ],
  components: {
    FPopover,
    FCheckbox,
    FContainer,
    FButton,
    FText,
    FDivider,
    FIcon,
    FInput,
    FTooltip,
    FEmptyState,
    Draggable,
  },
  data() {
    return {
      columnFields: [],
      frozenFields: [],
      flexibleFields: [],
      selectedFieldsMap: {},
      searchText: '',
      showContent: false,
      isSaving: false,
      editFieldName: null,
      dragOptions: {
        handle: '.icon-right',
        ghostClass: 'drag-ghost',
        dragClass: 'custom-drag',
        animation: 150,
      },
      fieldValue: null,
      isEmpty,
    }
  },
  created() {
    this.loadFields()
  },
  computed: {
    filteredFrozenFields() {
      let { searchText, frozenFields } = this || {}

      if (isEmpty(searchText)) {
        return frozenFields
      } else {
        return (frozenFields || []).filter(fld =>
          (fld.displayName || '')
            .toLowerCase()
            .includes(searchText.toLowerCase())
        )
      }
    },
    filteredFlexibleFields() {
      let { searchText, flexibleFields } = this || {}
      if (isEmpty(searchText)) {
        return flexibleFields
      } else {
        return (flexibleFields || []).filter(fld =>
          (fld.displayName || '')
            .toLowerCase()
            .includes(searchText.toLowerCase())
        )
      }
    },
  },
  watch: {
    viewFields() {
      this.constructFields()
    },
    showContent(newVal) {
      if (newVal && this.fitToScreen) {
        this.$nextTick(() => {
          const container = this.$refs['custom-container']
          let { $el: element } = container || {}
          element.scrollIntoView({ behavior: 'smooth' })
        })
      }
    },
  },
  methods: {
    ...mapActions(viewStore, ['customizeColumns']),
    async loadFields() {
      let url = null
      let { moduleName, parentModuleName } = this
      if (isEmpty(parentModuleName) || this.parentModuleName === moduleName) {
        url = `v2/fields/config/viewFields/${moduleName}`
      } else {
        url = `v2/fields/config/viewFields/${parentModuleName}/${moduleName}`
      }

      let { data, error } = await API.get(url)
      if (error) {
        ftoast.critical(this.$t('column_customization.error_message'))
      } else {
        this.columnFields = data?.fields || []
        this.constructFields()
      }
    },
    constructFields() {
      let { columnFields } = this

      this.frozenFields = columnFields.filter(
        fld => fld.fixed || fld.fixedSelectable
      )

      let frozenFldName = this.frozenFields.map(fld => fld.name)
      let selectedFldNameList = (this.viewFields || []).map(fld => {
        let { fieldName, field } = fld || {}
        if (isEmpty(fieldName) && !isEmpty(field?.name)) {
          return field?.name || ''
        }
        return fieldName || ''
      })
      let selectedFlexibleFields = (this.viewFields || [])
        .filter(fld => {
          let { fieldName, field } = fld || {}
          if (isEmpty(fieldName) && !isEmpty(field?.name)) {
            fieldName = field?.name
          }
          return !frozenFldName.includes(fieldName)
        })
        .map(fld => {
          let { columnDisplayName, fieldName, fieldId } = fld || {}
          return {
            ...fld,
            displayName: columnDisplayName,
            name: fieldName,
            id: fieldId,
          }
        })

      this.flexibleFields = [
        ...selectedFlexibleFields,
        ...columnFields.filter(
          fld =>
            !(
              fld.fixed ||
              fld.fixedSelectable ||
              selectedFldNameList.includes(fld.name)
            )
        ),
      ]

      this.selectedFieldsMap = selectedFldNameList.reduce(
        (fldHash, fldName) => {
          fldHash[fldName] = true
          return fldHash
        },
        {}
      )
    },
    openForm() {
      this.constructFields()
      this.showContent = true
    },
    setEditFieldName(field) {
      let { name = null, displayName = null } = field || {}
      this.editFieldName = name
      this.fieldValue = displayName
    },
    updateFieldName() {
      let index = this.flexibleFields.findIndex(
        fld => fld.name === this.editFieldName
      )
      if (index > -1 && !isEmpty(this.fieldValue)) {
        let fldObj = this.flexibleFields[index]
        fldObj.displayName = this.fieldValue
      }
      this.setEditFieldName()
    },
    getBackgroundColour(fieldName) {
      return this.editFieldName !== fieldName ? 'backgroundMidgroundSubtle' : ''
    },
    showInputBox(fieldName) {
      let { editFieldName } = this
      return editFieldName && editFieldName === fieldName
    },
    async save() {
      this.isSaving = true
      let fields = [...this.frozenFields, ...this.flexibleFields]

      fields = fields
        .filter(fld => fld.fixed || this.selectedFieldsMap[fld.name])
        .map(selectedFld => {
          let {
            id,
            parentFieldId,
            parentFieldName,
            displayName,
            name,
            customization,
          } = selectedFld || {}
          return {
            fieldId: id,
            parentFieldId: parentFieldId || -1,
            parentFieldName: parentFieldName,
            columnDisplayName: displayName,
            fieldName: name,
            customization: customization,
          }
        })
      let { moduleName, viewName } = this || {}
      let { error } = await this.customizeColumns({
        moduleName,
        viewName,
        fields,
      })
      if (error) {
        ftoast.critical(
          error.message || this.$t('column_customization.error_message')
        )
      } else {
        this.isSaving = false
        this.$emit('refreshRelatedList')
        ftoast.success(this.$t('column_customization.success_message'))
      }

      this.closeContent()
    },
    closeContent() {
      this.searchText = null
      this.editFieldName = null
      this.showContent = false
    },
  },
}
</script>

<style lang="scss" scoped>
.hover-effect {
  &:hover {
    .edit-view-icon {
      visibility: visible;
    }
  }
  .edit-view-icon {
    visibility: hidden;
  }
}
</style>
