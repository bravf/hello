import jsx from 'vue-jsx'
let {
  div, 
  button,
  select,
  option,
} = jsx
let _renderTools = function () {
  let me = this
  let jsxProps = {
    'class_btn': true,
    'class_btn-sm': true,
    'class_btn-primary': true,
  }
  return div('.proto-tools',
    div('.btn-group',
      button({
        ...jsxProps,
        domProps_disabled: !this._actionCanGroup(),
        on_click () {
          me._actionGroup()
        },
      }, '组合'),
      button({
        ...jsxProps,
        domProps_disabled: !this._actionCanUnGroup(),
        on_click () {
          me._actionUnGroup()
        },
      }, '打散'),
    ),
    div('.btn-group',
      button({
        ...jsxProps,
        domProps_disabled: !me._historyCanBack(),
        on_click () {
          me._historyBack()
        }
      }, '撤销'),
      button({
        ...jsxProps,
        domProps_disabled: !me._historyCanGo(),
        on_click () {
          me._historyGo()
        }
      }, '重做'),
    ),
    div('.btn-group',
      button({
        ...jsxProps,
        domProps_disabled: !this._actionCanRectDelete(),
        on_click () {
          me._actionRectCopy()
        }
      }, '复制'),
      button({
        ...jsxProps,
        domProps_disabled: !me._actionCanRectPaste(),
        on_click () {
          me._actionRectPaste()
        }
      }, '粘贴'),
      button({
        ...jsxProps,
        domProps_disabled: !this._actionCanRectDelete(),
        on_click () {
          me._actionRectDelete()
        }
      }, '删除'),
    ),
    div('.btn-group', 
      button({
        ...jsxProps,
        domProps_disabled: !this._actionCanRectDelete(),
        on_click () {
          me._actionRectMoveUp()
        },
      },
        '上移',
      ),
      button({
        ...jsxProps,
        domProps_disabled: !this._actionCanRectDelete(),
        on_click () {
          me._actionRectMoveDown()
        },
      },
        '下移',
      ),
      button({
        ...jsxProps,
        domProps_disabled: !this._actionCanRectDelete(),
        on_click () {
          me._actionRectMoveTop()
        },
      },
        '置顶',
      ),
      button({
        ...jsxProps,
        domProps_disabled: !this._actionCanRectDelete(),
        on_click () {
          me._actionRectMoveBottom()
        },
      },
        '置底',
      ),
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