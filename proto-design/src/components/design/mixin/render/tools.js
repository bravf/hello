import jsx from 'vue-jsx'
let {
  div, 
  button,
  select,
  option,
} = jsx
let buttonJsxProps = {
  'class_btn': true,
  'class_btn-sm': true,
  'class_btn-primary': true,
}
let _renderToolsButton = function (type) {
  let me = this
  let {checkF, doF, text} = this._actionGet(type)
  return button({
    ...buttonJsxProps,
    domProps_disabled: !checkF.call(this),
    on_click () {
      doF.call(me)
    }
  }, text)
}
let _renderTools = function () {
  let me = this
  return div('.proto-tools',
    div('.btn-group',
      _renderToolsButton.call(this, 'sys-撤销'),
      _renderToolsButton.call(this, 'sys-重做'),
    ),
    div('.btn-group',
      _renderToolsButton.call(this, 'rect-组合'),
      _renderToolsButton.call(this, 'rect-打散'),
    ),
    div('.btn-group',
      _renderToolsButton.call(this, 'rect-复制'),
      _renderToolsButton.call(this, 'rect-粘贴'),
      _renderToolsButton.call(this, 'rect-删除'),
      _renderToolsButton.call(this, 'rect-剪切'),
    ),
    div('.btn-group', 
      _renderToolsButton.call(this, 'rect-上移'),
      _renderToolsButton.call(this, 'rect-下移'),
      _renderToolsButton.call(this, 'rect-置顶'),
      _renderToolsButton.call(this, 'rect-置底'),
    ),
    div ('.btn-group',
      _renderToolsButton.call(this, 'rect-锁定'),
      _renderToolsButton.call(this, 'rect-解锁'),
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