<template>
  <div class="h-full">
    <FContainer
      width="100%"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <portal :to="`action-${widget.id}-${widget.name}`">
        <FButton
          appearance="secondary"
          size="small"
          iconGroup="navigation"
          iconName="addition"
          iconPosition="prefix"
          @click="associateSkill()"
        >
          {{ $t('employee.skills.associate_skill', { ns: 'fsm' }) }}
        </FButton>
      </portal>
    </FContainer>
    <FContainer
      v-if="isLoading"
      display="flex"
      justifyContent="center"
      alignItems="center"
      padding="sectionLarge"
    >
      <FSpinner :size="30" />
    </FContainer>
    <FContainer
      v-else-if="isEmpty(records)"
      paddingTop="containerXLarge"
      display="flex"
      justifyContent="center"
      height="100%"
    >
      <FEmptyState
        :illustration="'add-item'"
        :title="$t('employee.skills.no_skills_assoicated', { ns: 'fsm' })"
        :description="
          $t('employee.skills.no_skills_assoicated_description', { ns: 'fsm' })
        "
        :vertical="true"
        :size="'M'"
      >
        <template #buttons>
          <FContainer display="flex" cursor="pointer" @click="associateSkill()">
            <FButton
              appearance="secondary"
              size="medium"
              iconGroup="navigation"
              iconName="addition"
              iconPosition="prefix"
            >
              <FText appearance="headingMed14">{{
                $t('employee.skills.associate_skill', { ns: 'fsm' })
              }}</FText>
            </FButton>
          </FContainer></template
        >
      </FEmptyState>
    </FContainer>
    <FContainer
      v-else
      display="flex"
      flexDirection="column"
      height="100%"
      justifyContent="space-between"
    >
      <FContainer overflow="scroll">
        <FTable
          :columns="column"
          :data="records"
          :rounded="false"
          :hideBorder="false"
        >
          <template #cell.skill="{ row, prop }">
            <FText>{{ getSkillDisplayName(row, prop) }}</FText>
          </template>
          <template #[`cell.action`]="data">
            <FContainer display="flex">
              <FIcon
                group="default"
                name="edit"
                size="16"
                @click="editPeopleSkill(data)"
              />
              <FIcon
                group="default"
                name="trash-can"
                size="16"
                @click="deletePeopleSkill(data)"
              />
            </FContainer>
          </template>
        </FTable>
      </FContainer>
      <FContainer
        display="flex"
        alignItems="center"
        padding="containerLarge"
        backgroundColor="backgroundCanvas"
        marginTop="containerLarge containerXLarge"
        width="100%"
        borderTop="solid 1px"
        borderColor="borderNeutralBaseSubtler"
        justifyContent="flex-start"
        position="sticky"
        bottom="0"
      >
        <FPagination
          :pageSize="pageSize"
          :total="totalRecords"
          :currentPage="currentPage"
          :disabled="disabled"
          @nextClick="currentChange"
          @prevClick="currentChange"
          @currentChange="currentChange"
        />
      </FContainer>
    </FContainer>
    <FContainer v-if="showPopup">
      <FModal
        :title="$t('employee.skills.associate_skill', { ns: 'fsm' })"
        :visible="showPopup"
        :cancelText="'Cancel'"
        :saveText="'Save'"
        size="S"
        :hideFooter="false"
        @ok="saveForm"
        @cancel="handleCancel"
      >
        <FForm
          ref="employee-skill-form"
          :model="formModel"
          position="top"
          :rules="rules"
        >
          <FContainer display="flex" padding="containerXxLarge">
            <FContainer>
              <FFormItem
                :label="$t('employee.skills.label', { ns: 'fsm' })"
                prop="skill"
                :hideLabel="false"
                id="employee-form-skill"
                :required="true"
              >
                <FSelect
                  v-model="formModel.skill"
                  placeholder="Select Skill"
                  :options="skillOptions"
                  size="medium"
                >
                  <template #clickable>
                    <FContainer @click="showLookupWizard()">
                      <FIcon
                        group="dsm"
                        name="lookup"
                        size="16"
                        color="#283648"
                        :pressable="false"
                      />
                    </FContainer>
                  </template>
                </FSelect>
              </FFormItem>
            </FContainer>
            <FContainer marginLeft="containerXxLarge">
              <FFormItem
                :label="$t('employee.skills.level', { ns: 'fsm' })"
                prop="level"
                :hideLabel="false"
                id="employee-form-level"
                :required="true"
              >
                <FSelect
                  v-model="formModel.level"
                  placeholder="Select Level"
                  :options="levelsData"
                  size="medium"
                >
                </FSelect>
              </FFormItem>
            </FContainer>
          </FContainer>
        </FForm>
      </FModal>
    </FContainer>
    <FContainer v-if="showSkillLookup">
      <LookupWizard
        :field.sync="serviceSkillField"
        :canShowLookupWizard.sync="canShowLookupWizard"
        @closeWizard="hideLoopUpWizard"
        @setLookupFieldValue="setSkill"
      ></LookupWizard>
    </FContainer>
  </div>
</template>
<script>
import { API } from '@facilio/api'
import { isEmpty, isArray } from '@facilio/utils/validation'
import getProperty from 'dlv'
import {
  FContainer,
  FText,
  FIcon,
  FTable,
  FModal,
  FButton,
  FSelect,
  ftoast,
  FSpinner,
  FForm,
  FFormItem,
  FEmptyState,
  FPagination,
} from '@facilio/design-system'
import { LookupWizard } from '@facilio/ui/new-forms'
import { RelatedListData } from '../../../../components/page-builder/widgets/relatedList/RelatedListData'
import timezones from '../../../../utils/data/timezones'

export default {
  props: ['details', 'widget', 'fitToViewArea', 'moduleName'],
  components: {
    FText,
    FContainer,
    FIcon,
    FTable,
    FModal,
    FButton,
    FSelect,
    FSpinner,
    FForm,
    FFormItem,
    LookupWizard,
    FEmptyState,
    FPagination,
  },
  data() {
    return {
      relatedModuleName: 'peopleskilllevel',
      relatedFieldName: 'people',
      urlParams: {
        perPage: 10,
        page: 1,
        viewName: 'hidden-all',
      },
      levelsData: [
        { value: 1, label: 'Expert' },
        { value: 2, label: 'Proficient' },
        { value: 3, label: 'Novice' },
        { value: 4, label: 'Trainee' },
      ],
      isLoading: false,
      pageSize: 10,
      pageCount: 1,
      currentPage: 1,
      totalRecords: 0,
      disabled: false,
      skillOptions: [],
      showPopup: false,
      showSkillLookup: false,
      column: [
        { displayName: 'Skill Name', name: 'skill', id: 1, fixed: true },
        {
          displayName: 'Level',
          name: 'levelName',
          id: 2,
          width: 250,
        },
      ],
      records: [],
      rules: {
        skill: [
          {
            required: true,
            message: this.$t('employee.skills.skill_required', { ns: 'fsm' }),
            trigger: 'change',
          },
        ],
        level: [
          {
            required: true,
            message: this.$t('employee.skills.skill_level_required', {
              ns: 'fsm',
            }),
            trigger: 'change',
          },
        ],
      },
      serviceSkillField: {
        lookupModule: {
          name: 'serviceSkill',
          displayName: 'Skills',
        },
      },
      canShowLookupWizard: true,
      formModel: {
        skill: null,
        level: null,
      },
      skillValue: null,
      levelValue: null,
    }
  },
  async created() {
    this.fitToViewArea()
    await this.fetchSkillOptions()
    await this.fetchPeopleSkills()
  },
  methods: {
    isEmpty,
    async fetchSkillOptions() {
      let { data, error } = await API.get(
        'v3/employee/serviceSkill/pickList',
        this.urlParams,
        { force: true }
      )
      if (!isEmpty(data)) {
        let { pickList } = data || []
        this.skillOptions = pickList || []
      }
      if (error) {
        let { message } = error
        ftoast.critical(message, {
          title: '',
          timeout: 1000,
        })
      }
    },
    async fetchPeopleSkills(force = true) {
      this.isLoading = true
      let {
        details,
        moduleName,
        relatedFieldName,
        relatedModuleName,
        currentPage,
        pageSize,
      } = this
      let { id: recordId } = details || {}

      let params = {
        moduleName: relatedModuleName,
        viewname: 'hidden-all',
        page: currentPage,
        perPage: pageSize,
        force,
        recordId,
        relatedFieldName,
        currentModuleName: moduleName,
      }
      try {
        let recordList = await RelatedListData.fetchAll(params)
        if (isArray(recordList)) {
          this.records = recordList
        }
        this.totalRecords = RelatedListData.recordListCount
      } catch (error) {
        let { message, title = '' } = error
        ftoast.critical(message || this.$t('error_occurred'), {
          title,
          menuType: 'alerts',
          timeout: 5000,
        })
      }
      this.isLoading = false
    },
    async associateSkill() {
      this.showPopup = true
    },
    showLookupWizard() {
      this.canShowLookupWizard = true
    },
    handleCancel() {
      this.formModel = {
        level: null,
        skill: null,
      }
      this.showPopup = false
    },
    async reLoadPage() {
      await this.fetchPeopleSkills()
    },
    saveForm() {
      let { formModel } = this
      let { id } = formModel || {}
      let isValid = this.$refs['employee-skill-form'].validate()
      if (isValid) {
        if (!isEmpty(id)) this.updatePeopleSkill()
        else this.createPeopleSkill()
      }
    },
    async createPeopleSkill() {
      let { details, relatedModuleName, moduleName } = this
      let { id } = details || {}
      let { skill, level } = this.formModel || {}
      let params = {
        data: {
          people: { id },
          skill: { id: skill },
          level,
        },
      }

      let { data, error } = await API.post(
        `v3/modules/data/${moduleName}/${relatedModuleName}`,
        params
      )

      if (!error) {
        let { peopleskilllevel } = data || {}
        let { successMsg } = peopleskilllevel || {}
        if (!isEmpty(successMsg)) {
          ftoast.success(successMsg, {
            title: '',
            menuType: 'alerts',
            timeout: 5000,
          })
        } else {
          ftoast.success('Skill and Level associated successfully!', {
            title: '',
            menuType: 'alerts',
            timeout: 5000,
          })
        }
      }
      this.reLoadPage()
      this.handleCancel()
    },
    hideLoopUpWizard() {
      this.canShowLookupWizard = false
    },
    setSkill(data) {
      if (!isEmpty(data)) {
        let { field } = data || {}
        let { selectedItems } = field || []
        let skill = getProperty(selectedItems, '0', null)
        let { value } = skill || {}
        this.formModel.skill = value
      }
    },
    currentChange(page) {
      this.currentPage = page
      this.fetchPeopleSkills()
    },
    getSkillDisplayName(row, prop) {
      return getProperty(row, `${prop}.name`, '---')
    },
    async editPeopleSkill(peopleSkill) {
      let { moduleName, relatedModuleName } = this
      let { row } = peopleSkill || {}
      let { id } = row || {}
      if (!isEmpty(id)) {
        let { data, error } = await API.get(
          `v3/modules/data/${moduleName}/${relatedModuleName}/${id}`
        )
        if (error) {
          let { message } = error || this.$t('error_occurred')
          ftoast.critical(message, {
            menuType: 'alerts',
            timeout: 3000,
          })
        } else {
          let { peopleskilllevel } = data || {}
          let { id, level, skill } = peopleskilllevel || {}
          let { id: skillId } = skill || {}
          this.formModel = { level, skill: skillId, id }
          this.showPopup = true
        }
      }
    },
    async updatePeopleSkill() {

      let { details, relatedModuleName, moduleName, formModel } = this
      let { id : peopleId } = details || {}
      let { skill, level, id } = this.formModel || {}
      let params = {
        id,
        data: {
          people: { id: peopleId },
          skill: { id: skill },
          level,
        },
        moduleName: relatedModuleName,
      }

      let { error } = await API.patch(
        `v3/modules/data/${moduleName}/${relatedModuleName}/${id}`,
        params
      )
      if (error) {
        let { message } = error || this.$t('error_occurred')
        ftoast.critical(message, {
          menuType: 'alerts',
          timeout: 3000,
        })
      } else {
        this.reLoadPage()
        this.handleCancel()
        ftoast.success('Updated Successfully', {
          menuType: 'alerts',
          timeout: 3000,
        })
      }
    },
    async deletePeopleSkill(data) {
      let { moduleName, relatedModuleName } = this
      let { row } = data || {}
      let { id } = row || {}
      if (!isEmpty(id)) {
        let { error } = await API.delete(
          `v3/modules/data/${moduleName}/${relatedModuleName}/${id}`
        )
        if (error) {
          let { message } = error || this.$t('error_occurred')
          ftoast.critical(message, {
            menuType: 'alerts',
            timeout: 3000,
          })
        } else {
          ftoast.success('Deleted Successfully', {
            menuType: 'alerts',
            timeout: 3000,
          })
          this.reLoadPage()
        }
      }
    },
  },
}
</script>
