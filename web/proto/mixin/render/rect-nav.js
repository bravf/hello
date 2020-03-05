import iview from '../../core/iview'
import jsx from 'vue-jsx'
let {
  div
} = jsx
let {
  tag
} = iview
let _renderRectNav = function () {
  let me = this
  let retTags = ['rect', 'circle', 'text', 'line'].map(type => {
    return tag({
      'class_proto-button': true,
      nativeOn_mousedown () {
        me.mouse.eventType = 'create'
        me.mouse.createType = type
        me.mouse.ing = true
      },
    },type)
  })
  return div({
    'class_proto-tags': true,
  },
  ...retTags,
  )
}
export {
  _renderRectNav
}