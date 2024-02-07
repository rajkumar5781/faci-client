import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import dlv from 'dlv'
import { clone } from 'lodash'
import { defineStore } from 'pinia'

const module = defineStore('module', {
  state: () => ({
    ticketStatus: {},
    approvalStatus: {},
  }),
  getters: {
    isStatusLocked: state => (id, moduleName) => {
      if (isEmpty(state.ticketStatus[moduleName])) {
        return false
      }
      let status = state.ticketStatus[moduleName].find(
        ticketStatus => ticketStatus.id === id
      )
      return status ? status.recordLocked : false
    },
    getApprovalStatus: state => id => {
      if (!isEmpty(state.approvalStatus)) {
        let status = state.approvalStatus.find(
          ticketStatus => ticketStatus.id === id
        )

        return status ? clone(status) : null
      }
    },
    getTicketStatus: state => (id, moduleName) => {
      if (!isEmpty(state.ticketStatus[moduleName])) {
        return clone(
          state.ticketStatus[moduleName].find(
            ticketStatus => ticketStatus.id === id
          )
        )
      }
    },
    getTicketStatusByLabel: state => (label, moduleName) => {
      if (!isEmpty(state.ticketStatus[moduleName])) {
        return clone(
          state.ticketStatus[moduleName].find(
            ticketStatus => ticketStatus.status === label
          )
        )
      }
    },
  },
  actions: {
    async loadTicketStatus(moduleName) {
      let response = await API.get(
        `v2/state/${moduleName}/list?parentModuleName=${moduleName}`
      )
      let status = dlv(response, 'data.status')
      if (!isEmpty(status)) {
        this.ticketStatus[moduleName] = status
      }
    },
    async loadApprovalStatus(moduleName) {
      let response = await API.get(`v2/state/${moduleName}/list`, {
        approvalStatus: true,
        moduleName,
      })
      let status = dlv(response, 'data.status')
      if (!isEmpty(status)) {
        this.approvalStatus[moduleName] = status
      }
    },
  },
})

export default module
