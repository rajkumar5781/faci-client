<template>
  <FContainer overflowY="scroll">
    <FContainer
      float="right"
      margin="containerXLarge"
      display="flex"
      gap="containerXLarge"
    >
      <FButton @click="submit()" appearance="primary" :loading="isLoading">{{
        $t('run')
      }}</FButton>
      <FButton
        v-if="id"
        @click="update()"
        appearance="secondary"
        :loading="isUpdating"
        >{{ $t('update') }}</FButton
      >
    </FContainer>
    <FContainer
      marginTop="containerXLarge"
      overflowY="scroll"
      border="1px solid"
      borderColor="borderNeutralBaseSubtle"
      width="97%"
      boxShadow="lightLow02"
      cursor="pointer"
    >
      <ScriptEditor
        v-model="code.payload"
        :scriptClass="'pt-5 pr-5 w-full h-96'"
      ></ScriptEditor>
    </FContainer>
    <FContainer
      marginTop="sectionLarge"
      width="97%"
      boxShadow="lightLow02"
      cursor="pointer"
    >
      <FTextArea
        :rows="8"
        class="pl-5 pr-5 pt-2"
        placeholder="Result"
        :readOnly="true"
        v-model="code.result"
      />
    </FContainer>
  </FContainer>
</template>

<script>
import { API } from '@facilio/api'
import getProperty from 'dlv'
import { isEmpty } from '@facilio/utils/validation'
import { FContainer, FButton, FTextArea, ftoast } from '@facilio/design-system'
import { ScriptEditor } from '@facilio/ui/setup'

export default {
  name: 'WorkflowEditor',
  data: () => ({
    code: {
      payload: '',
      result: '',
    },
    isLoading: false,
    isUpdating: false,
  }),
  components: { FContainer, FButton, FTextArea, ScriptEditor },
  computed: {
    id() {
      let { $route = {} } = this
      let id = getProperty($route, 'query.id', null)

      return !isEmpty(id) ? parseInt(id) : null
    },
  },
  created() {
    this.initEditor()
  },
  methods: {
    async initEditor() {
      let { id } = this
      let defaultScript = 'void test(){\n    \n    \n}'
      if (!isEmpty(id)) {
        let { error, data = {} } = await API.get(
          `/v2/workflow/getFunctionMeta`,
          {
            ids: [id],
          }
        )
        if (error) {
          ftoast.critical(error?.message || this.$t('error_occured'))
        } else {
          let { workflowUserFunctions } = data
          let payload = getProperty(
            workflowUserFunctions[0],
            'workflowV2String',
            ''
          )
          this.code = { payload }
        }
      } else {
        let payload = window.localStorage.getItem('workflow.playground')
        if (isEmpty(payload)) {
          payload = defaultScript
        }
        this.code = { payload }
      }
    },
    async submit() {
      this.isLoading = true
      let { code, $route } = this
      let { query } = $route || {}
      let { cloudService } = query || {}
      let { payload } = code || {}

      this.setResult('')
      window.localStorage.setItem('workflow.playground', payload)
      let url = ''
      let params = {}

      if (cloudService === 'true') {
        url = 'v3/agent/runWorkflow'
        params = {
          data: {
            workflow: {
              workflowV2String: payload,
              isV2Script: true,
            },
          },
        }
        let { error, data } = await API.post(url, params)
        if (error) {
          ftoast.critical(error?.message || this.$t('error_occured'))
        } else {
          let { workflowResponse, workflowSyntaxError } = data || {}
          if (!isEmpty(workflowResponse)) {
            this.setResult(workflowResponse)
          }
          if (!isEmpty(workflowSyntaxError)) {
            this.showError(workflowSyntaxError)
          }
        }
      } else {
        url = '/v2/workflow/runWorkflow'
        params = {
          workflow: { workflowV2String: payload, isV2Script: true },
        }
        let { error, data } = await API.post(url, params)
        if (error) {
          ftoast.critical(error?.message || this.$t('error_occured'))
        } else {
          let logString = getProperty(data, 'workflow.logString', '')
          let workflowSyntaxError = getProperty(data, 'workflowSyntaxError', [])
          if (!isEmpty(logString)) {
            this.setResult(logString)
          }
          if (!isEmpty(workflowSyntaxError)) {
            this.showError(workflowSyntaxError)
          }
        }
      }
      this.isLoading = false
    },
    showError({ errors = [] }) {
      if (!isEmpty(errors)) {
        errors.forEach(error => {
          ftoast.critical(error)
        })
      }
    },
    setResult(result) {
      let { code } = this
      code = { ...code, result }
      this.code = code
    },
    async update() {
      this.isUpdating = true
      let { id } = this
      let payload = getProperty(this, 'code.payload', '')

      this.setResult('')
      window.localStorage.setItem('workflow.playground', payload)
      let params = {
        workflow: { workflowV2String: payload, id },
      }
      let { error } = await API.post(`/v2/workflow/updateWorkflow`, params)
      if (error) {
        ftoast.critical(error?.message || this.$t('error_occured'))
      } else {
        ftoast.success(this.$t('updated', { ns: 'energy' }))
      }
      this.isUpdating = false
    },
  },
}
</script>
