import jsx from 'vue-jsx'
let {
  div, 
  span,
  button,
  select,
  option,
} = jsx
let buttonJsxProps = {
  'class_btn': true,
  'class_btn-sm': true,
  // 'class_btn-primary': true,
}
let vIcon = jsx.bind('v-icon')
let _renderToolsButton = function (type, iconType) {
  let me = this
  let {checkF, doF, text} = this._actionGet(type)
  let jsxProps = {
    ...buttonJsxProps,
    domProps_disabled: !checkF.call(this),
    on_click () {
      doF.call(me)
    }
  }
  let children = [span(text)]
  if (iconType) {
    children = [
      vIcon({props_name: iconType}),
      ...children,
    ]
  }
  return button(jsxProps, ...children)
}
let _renderTools = function () {
  let me = this
  return div('.proto-tools',
    div('.btn-group',
      _renderToolsButton.call(this, 'sys-撤销', 'undo-alt'),
      _renderToolsButton.call(this, 'sys-重做', 'redo-alt'),
    ),
    div('.btn-group',
      _renderToolsButton.call(this, 'rect-组合', 'object-group'),
      _renderToolsButton.call(this, 'rect-打散', 'object-ungroup'),
    ),
    div('.btn-group',
      _renderToolsButton.call(this, 'rect-复制', 'copy'),
      _renderToolsButton.call(this, 'rect-粘贴', 'paste'),
      _renderToolsButton.call(this, 'rect-删除', 'trash-alt'),
      _renderToolsButton.call(this, 'rect-剪切', 'cut'),
    ),
    div('.btn-group', 
      _renderToolsButton.call(this, 'rect-上移', 'layer-group'),
      _renderToolsButton.call(this, 'rect-下移', 'layer-group'),
      _renderToolsButton.call(this, 'rect-置顶', 'layer-group'),
      _renderToolsButton.call(this, 'rect-置底', 'layer-group'),
    ),
    div ('.btn-group',
      _renderToolsButton.call(this, 'rect-锁定', 'lock'),
      _renderToolsButton.call(this, 'rect-解锁', 'unlock'),
    ),
    div('.btn-group',
      select({
        'class_form-select': true,
        'class_select-sm': true,
        domProps_value: this.scale,
        'on_change' (e) {
          me.scale = e.target.value
          me._renderRule()
        }
      },
        ...[0.5, 0.8, 1, 1.25, 2].map(o => {
          return option({
            domProps_value:  o,
          }, o + 'x')
        })
      ),
    ),
  )    
}
export {
  _renderTools,
}