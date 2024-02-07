import { VueRenderer } from '@tiptap/vue-2'
import tippy, { sticky } from 'tippy.js'
import CommentMentions from './CommentMentions.vue'
export const getSuggestions = parent => {
  return {
    render: () => {
      let component
      let popup

      return {
        onStart: props => {
          console.log(parent, props)
          component = new VueRenderer(CommentMentions, {
            parent: parent,
            propsData: props,
            editor: props.editor,
          })
          console.log('component: ', component, component.element)
          if (!props.clientRect) {
            return
          }

          popup = tippy('body', {
            plugins: [sticky],
            getReferenceClientRect: props.clientRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
            zIndex: 2100,
            sticky: true,
          })
        },

        onUpdate(props) {
          component.updateProps(props)

          if (!props.clientRect) {
            return
          }

          popup[0].setProps({
            getReferenceClientRect: props.clientRect,
          })
        },

        onKeyDown(props) {
          if (props.event.key === 'Escape') {
            popup[0].hide()

            return true
          }

          return component.ref?.onKeyDown(props)
        },

        onExit() {
          popup[0].destroy()
          component.destroy()
        },
      }
    },
  }
}
