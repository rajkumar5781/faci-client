<template>
  <FModal
    :saveText="'Assign'"
    :title="
      $t('flagged_event.assign', {
        ns: 'remote_monitor',
      })
    "
    :confirmLoading="isSaving"
    @ok="assignPeople"
    :visible="true"
    size="S"
    @cancel="closeReasonListDialog"
  >
    <FForm
      :ref="`field-value-form-people`"
      :uniqueId="`field-value-form-people`"
      :model="formModel"
        :rules="formRules"
    >
      <FContainer diplay="flex" alignItems="center" padding="sectionSmall">
        <FFormItem
          :label="$t('field_names.assignTo', { ns: 'remote_monitor' })"
          prop="people"
        >
          <Lookup
            width="80%"
            :field.sync="peopleField"
            v-model="formModel.people"
            :hideLookupIcon="true"
            @showLookupWizard="openLookupWizard"
            :fetchOptionsMethod="fetchOptionsMethod"
            moduleName="flaggedAlarm"
          />
        </FFormItem>
      </FContainer>
    </FForm>
    <FContainer v-if="canShowLookupWizard">
      <LookupWizard
        :field.sync="getPeopleField"
        :canShowLookupWizard.sync="canShowLookupWizard"
        @closeWizard="hideLoopUpWizard"
      ></LookupWizard>
    </FContainer>
  </FModal>
</template>

<script>
import {
  FModal,
  FContainer,
  FCheckboxGroup,
  FButton,
  FDivider,
  FText,
  FForm,
  FFormItem,
  ftoast
} from '@facilio/design-system'
import { DatePicker, Lookup, LookupWizard } from '@facilio/ui/new-forms'
import { getOptionsForSecondLevelLookup } from '../../../remotemonitor/forms/utils/rmHelpers'
import getProperty from 'dlv'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'

export default {
  components: {
    FModal,
    FContainer,
    FCheckboxGroup,
    FButton,
    FDivider,
    FText,
    Lookup,
    LookupWizard,
    FForm,
    FFormItem,
    ftoast
  },
  props: ['flaggedEventId'],
  data() {
    return {
      formModel: {
          people : null
      },
      showLookupWizard: false,
      peopleField : {
        isDataLoading: false,
        options: [],
        lookupModuleName: 'people',
        placeHolderText: this.$t('field_names.assignTo', {
          ns: 'remote_monitor',
        }),
        field: {
          lookupModule: {
            name: 'people',
            displayName: 'People',
          },
        },
        isSaving : false
      },
      formRules: {
        people: {
          trigger: 'change',
          required: true,
          validator: value => {
            if (isEmpty(value)) {
              return {
                errorMessage: this.$t(
                  'field_names.people_empty_message',
                  {
                    ns: 'remote_monitor',
                  }
                ),
                invalid: true,
              }
            }
          },
        },
      }
    }
  },
  computed: {
    canShowLookupWizard() {
      let { showLookupWizard } = this
      return showLookupWizard
    },
  },
  methods: {
    async assignPeople() {
        let valid = this.$refs['field-value-form-people'].validate()
        if (!valid) {
          return
        }
        this.isSaving = true
        let { formModel = {} } = this
        let { people } = formModel 
        await this.setPeople(people)
        this.closeReasonListDialog(true)
        this.isSaving = false
    },
    async setPeople(peopleId) {
      let { flaggedEventId } = this
      let { error } = await API.patch(
        `/v3/flaggedEvent/${flaggedEventId}/assign`,{
          id:flaggedEventId,
          assignToPeople : {
              id : peopleId
          }
        }
      )
      if (isEmpty(error)) {
        let message = this.$t('flagged_event.assign_success', {
          ns: 'remote_monitor',
        })
        ftoast.success(message)
      } else {
        let message =
          error?.message ||
          this.$t('flagged_event.assign_error', {
            ns: 'remote_monitor',
          })
        ftoast.critical(message)
      }
    },
    closeReasonListDialog(reload = false) {
      this.$emit('closeDialog', reload)
    },
    hideLoopUpWizard() {
      this.showLookupWizard = false
    },
    openLookupWizard() {
      this.showLookupWizard = true
    },
    async fetchOptionsMethod(props) {
      let { moduleName, flaggedEventId } = this
      let options = await getOptionsForSecondLevelLookup(
        props,
        moduleName,
        null,
        `v3/flaggedEvent/options/${flaggedEventId}/fetchPeople`
      )
      return options
    },
  },
}
</script>
