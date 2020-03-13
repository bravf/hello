import jsx from 'vue-jsx'
let {
  span,
  div
} = jsx
let _renderRectNav = function () {
  let me = this
  let retTags = ['rect', 'circle', 'text', 'line'].map(type => {
    return span({
      'class_proto-button': true,
      on_mousedown () {
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