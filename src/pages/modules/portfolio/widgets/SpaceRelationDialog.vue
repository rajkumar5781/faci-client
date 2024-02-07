<template>
  <FModal
    :visible="true"
    :hideHeader="true"
    :title="title"
    size="xs"
    :hideFooter="hideFooter"
    :saveText="saveTxt"
    :cancelText="cancelTxt"
    @cancel="closeDialog"
    @ok="deleteRecord"
  >
    <FContainer
      display="flex"
      flexDirection="column"
      padding="containerNone containerXxLarge containerXxLarge sectionSmall"
      gap="containerLarge"
    >
      <FContainer
        borderRadius="medium"
        background="#b61919"
        margin="containerNone containerSmall"
        width="35px"
      >
        <FIcon
          name="critical"
          group="alert"
          size="20"
          color="backgroundCanvas"
          background="containerNone"
        ></FIcon>
      </FContainer>
      <FContainer>
        <FText appearance="bodyReg14" color="textDescription">
          {{ warningDescription }}
        </FText>
      </FContainer>
      <FContainer
        display="flex"
        width="100%"
        flexDirection="column"
        borderRadius="medium"
        border="1px solid"
        padding="containerXLarge"
        borderColor="borderNeutralBaseSubtler"
        backgroundColor="backgroundMidgroundSubtle"
        gap="containerSmall"
      >
        <FContainer
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          width="100%"
        >
          <FContainer width="50%">
            <FText appearance="captionMed12" color="textMain"
              >{{
                $t(`portfolio.delete.dependency`, '', {
                  ns: 'portfolio',
                })
              }}
            </FText>
          </FContainer>
          <FContainer width="50%">
            <FText appearance="captionMed12" color="textMain">
              {{ $t(`portfolio.delete.count`, '', { ns: 'portfolio' }) }}</FText
            >
          </FContainer>
        </FContainer>
        <FContainer
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          width="100%"
          v-for="(value, key) in errorMap"
          :key="key"
        >
          <FContainer width="50%">
            <FText appearance="bodyReg14" color="textDescription">
              {{ key }}
            </FText>
          </FContainer>
          <FContainer width="50%">
            <FText appearance="bodyReg14" color="textDescription">
              {{ value }}
            </FText>
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
  </FModal>
</template>
<script>
import { API } from '@facilio/api'
import {
  ftoast,
  FTable,
  FIcon,
  FModal,
  FContainer,
  FText,
} from '@facilio/design-system'
export default {
  props: ['moduleName', 'errorMap', 'type', 'id'],
  components: {
    FModal,
    FContainer,
    FText,
    FTable,
    FIcon,
  },
  computed: {
    title() {
      return this.type === 3
        ? this.$t('portfolio.delete.error', 'Error', { ns: 'Portfolio' })
        : this.$t('portfolio.delete.warning', 'Warning', { ns: 'Portfolio' })
    },
    warningDescription() {
      let { type, moduleName } = this
      let msg
      if (type == 3) {
        msg = this.$t(
          `portfolio.delete.space_delete_error`,
          `Please remove the following dependencies underlying for the ${moduleName}`,
          {
            ns: 'portfolio',
            moduleName: moduleName,
          }
        )
      } else {
        msg = this.$t(
          `portfolio.delete.space_delete_warning`,
          `Following dependent records will be deleted along this ${moduleName} `,
          {
            ns: 'portfolio',
            moduleName: moduleName,
          }
        )
      }
      return msg
    },
    column() {
      let dependencyTxt = this.$t(`portfolio.delete.dependency`, '', {
        ns: 'portfolio',
      })
      let countTxt = this.$t(`portfolio.delete.count`, '', { ns: 'portfolio' })
      return [
        {
          displayName: dependencyTxt,
          name: 'dependancy',
          id: 1,
          fixed: true,
          width: '100px',
        },
        {
          displayName: countTxt,
          name: 'count',
          id: 2,
          fixed: true,
          width: '100px',
        },
      ]
    },
    tableData() {
      let list = []
      let { errorMap } = this
      Object.keys(errorMap).map(key => {
        list.push({ key: key, value: errorMap[key] })
      })
      return list
    },
    hideFooter() {
      let { type } = this
      return type === 3
    },
    saveTxt() {
      return 'Delete'
    },
    cancelTxt() {
      return 'Cancel'
    },
  },
  methods: {
    closeDialog() {
      this.$emit('close')
    },
    async deleteRecord() {
      this.$emit('delete', this.id)
    },
  },
}
</script>
