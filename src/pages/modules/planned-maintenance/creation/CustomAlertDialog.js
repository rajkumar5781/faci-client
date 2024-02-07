import { FModal, FText, FContainer, FIcon } from '@facilio/design-system'
import { isEmpty } from 'lodash'

import Vue from 'vue'
class ConfirmMessage {
  container = ''
  value = false
  modalInstance = null
  constructor() {
    const container = document.createElement('div')
    const root = document.createElement('div')
    container.setAttribute('id', 'f-confirm-container')
    root.appendChild(container)
    document.body.appendChild(root)
    this.container = container
    this.root = root
  }

  default = (data, props) => {
    return this.createDialog({ ...data, intent: 'default', ...props })
  }
  info = (data, props) => {
    return this.createDialog({ ...data, intent: 'info', ...props })
  }
  danger = (data, props) => {
    return this.createDialog({ ...data, intent: 'danger', ...props })
  }
  warning = (data, props) => {
    return this.createDialog({ ...data, intent: 'warning', ...props })
  }
  save() {
    this.value = true
    this.removeDialog()
  }
  close() {
    this.value = false
    this.removeDialog()
  }
  removeDialog() {
    let div = document.getElementById('f-modal')
    div.remove()
  }
  async createDialog(props) {
    return new Promise(resolve => {
      let {
        title,
        description,
        descriptionHighlighted,
        showHighlightedDescriptionFirst,
        intent,
        saveText,
        cancelText,
      } = props || {}
      const div = document.createElement('div')
      div.setAttribute('id', 'f-modal')
      this.container.appendChild(div)
      this.modalInstance = new Vue({
        render: h =>
          h(
            FModal,
            {
              props: {
                title,
                visible: true,
                size: 'S',
                hideFooter: false,
                saveText,
                cancelText,
              },
              attrs: {
                id: 'f-modal',
              },
              on: {
                cancel: () => {
                  this.close()
                  resolve(this.value)
                },
                ok: () => {
                  this.save()
                  resolve(this.value)
                },
              },
            },
            [
              h(
                FContainer,
                {
                  attrs: {
                    padding: 'containerXLarge sectionSmall',
                    display: 'flex',
                    flexDirection: 'column',
                  },
                },
                [
                  h(
                    FContainer,
                    {
                      attrs: {
                        display: 'flex',
                        flexDirection: 'row',
                        marginTop: 'containerXLarge',
                        marginBottom: 'containerXLarge',
                      },
                    },
                    [
                      intent === 'warning'
                        ? h(FIcon, {
                            attrs: {
                              group: 'alert',
                              name: 'triangle-warning-filled',
                              size: '28',
                              pressable: false,
                              color: 'iconAccentYellow',
                            },
                          })
                        : h(),
                      h(
                        FContainer,
                        {
                          attrs: {
                            display: 'flex',
                            flexDirection: 'column',
                            marginTop: !(
                              !isEmpty(descriptionHighlighted) &&
                              !isEmpty(description)
                            )
                              ? 'containerMedium'
                              : 'containerNone',
                          },
                        },
                        [
                          !isEmpty(descriptionHighlighted) &&
                          !isEmpty(description)
                            ? [
                                h(FText, {
                                  domProps: {
                                    innerHTML: showHighlightedDescriptionFirst
                                      ? descriptionHighlighted
                                      : description,
                                  },
                                  attrs: {
                                    appearance: showHighlightedDescriptionFirst
                                      ? 'headingMed16'
                                      : 'bodyReg14',
                                    padding:
                                      'containerNone sectionSmall containerMedium',
                                  },
                                }),
                                h(FText, {
                                  domProps: {
                                    innerHTML: showHighlightedDescriptionFirst
                                      ? description
                                      : descriptionHighlighted,
                                  },
                                  attrs: {
                                    appearance: showHighlightedDescriptionFirst
                                      ? 'bodyReg14'
                                      : 'headingMed16',
                                    padding:
                                      'containerMedium sectionSmall containerNone',
                                  },
                                }),
                              ]
                            : h(FText, {
                                domProps: {
                                  innerHTML: description,
                                },
                                attrs: {
                                  appearance: 'bodyReg14',
                                  padding:
                                    'containerNone sectionSmall containerNone',
                                  height: '100%',
                                },
                              }),
                        ]
                      ),
                    ]
                  ),
                ]
              ),
            ]
          ),
      }).$mount(div)
    })
  }
}

const customAlertDialog = new ConfirmMessage()

export default customAlertDialog
