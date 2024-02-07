import Vue from 'vue'
import { API } from '@facilio/api'
import { getApp } from '@facilio/router'
import { isEmpty } from '@facilio/utils/validation'
import { ftoast } from '@facilio/design-system'
export const getCommentService = () => {
  return new Vue({
    data() {
      return {
        module: '',
        parentModule: '',
        portalApps: [],
        defaultSharingApps: [],
        record: {},
        forWO: false,
        isServicePortal: false,
        peopleFromRecordFields: null,
      }
    },
    computed: {
      canShowSharing() {
        let PORTALS = 1
        if (getApp() && getApp().appCategory === PORTALS) {
          return false
        } else {
          return true
        }
      },
    },
    methods: {
      async getSharingApps() {
        let url = `/v3/commentPreferences/sharingOptions`
        let { error, data } = await API.get(url)
        if (error) {
          ftoast.critical(error.message || this.$t('error_occurred'))
        } else {
          let { licensedPortalApps, commentSharingPreferences } = data
          this.portalApps = licensedPortalApps
          this.defaultSharingApps = commentSharingPreferences
        }
      },

      async getPeopleFieldForRecord() {
        let { parentModule, record } = this
        let param = {
          moduleName: parentModule,
          recordId: record?.id,
        }
        let { data, error } = await API.post(
          `v3/people/util/${parentModule}/recordPeople/${param.recordId}`,
          param
        )
        if (!error) {
          let { peopleFromRecordFields } = data || []
          this.peopleFromRecordFields = peopleFromRecordFields
        }
      },

      async updateCommentSharing(comment) {
        let { module, parentModule } = this
        let { id, commentSharing } = comment
        let param = {
          note: { id, commentSharing },
        }
        let url = `v2/notes/${module}/${parentModule}/updateSharing/${comment.id}`
        let { error } = await API.post(url, param)
        return { error }
      },
      async save(newComment, isEdit) {
        let { isServicePortal, module, parentModule, record } = this
        if (isServicePortal) {
          newComment.notifyRequester = true
        }
        newComment.parentModuleLinkName = module
        newComment.parentId = record.id
        newComment.notifyRequester = false

        let addOrUpdate = isEdit ? 'update' : 'add'
        let url = `v2/notes/${module}/${parentModule}/${addOrUpdate}/${record.id}`

        let param = {
          note: newComment,
          module: module,
          parentModuleName: parentModule,
        }

        if (module === 'basealarmnotes') {
          param.alarmOccurrenceId = record.occurrence
            ? record.occurrence.id
            : -1
        }

        let { error, data } = await API.post(url, param)
        if (error) {
          return { error }
        } else {
          return { data: data.Notes }
        }
      },
      async delete(note) {
        let { module, parentModule, record } = this

        let url = `v2/notes/${module}/${parentModule}/delete/${record.id}`

        let params = {
          noteId: note.id,
          module: module,
          parentModuleName: parentModule,
        }

        let { error } = await API.delete(url, params)
        return { error }
      },
      async fetchComments(parentNote) {
        let { record } = this
        if (!record || typeof record !== 'object') {
          return
        }
        let listNameSpace = `/note/${this.parentModule}/get/${this.record.id}?module=${this.module}`
        if (this.isServicePortal) {
          listNameSpace = '/notelist?module='
        }
        let url =
          listNameSpace +
          (!isEmpty(parentNote)
            ? '&parentNoteId=' + parentNote.id
            : '&onlyFetchParentNotes=true')

        let { data, error } = await API.get(url)
        if (error) {
          return { error }
        } else {
          return { data: data }
        }
      },
    },
  })
}
