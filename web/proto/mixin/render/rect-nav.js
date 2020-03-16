import jsx from 'vue-jsx'
let {
  span,
  div
} = jsx
let _renderRectNav = function () {
  let me = this
  let retTags = ['rect', 'circle', 'text', 'line'].map(type => {
    return span({
      'class_label': true,
      'class_label-secondary': true,
      on_mousedown () {
        me.mouse.eventType = 'create'
        me.mouse.createType = type
        me.mouse.ing = true
      },
    }, type)
  })
  return div({
    'class_proto-rect-tags': true,
    'class_card': true,
  },
    div({
      'class_card-header': true
    }, '组件'),
    div({
      'class_card-body': true,
    },
      ...retTags,
    ),
  )
}
export {
  _renderRectNav
}