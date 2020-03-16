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
    props_type: 'primary',
    'class_btn': true,
    'class_btn-sm': true,
    'class_btn-primary': true,
  }
  let rect = this.objects[this.currRectId]
  let isTempGroup = rect && this._checkIsTempGroup(rect)
  let isGroup = rect && this._checkIsGroup(rect)
  let buttonGroup = div(
    button({
      ...jsxProps,
      domProps_disabled: !isTempGroup,
      on_click () {
        let newGroup = me._createRect('group')
        // 绑定
        me._bindGroup(newGroup, me._getDeepRectsByRect(rect))
        me._unbindTempGroup()
        me._updateCurrRect(newGroup)
        me._historyPush()
      },
    }, '组合'),
    button({
      ...jsxProps,
      domProps_disabled: !isGroup,
      on_click () {
        let rect = me.objects[me.currRectId]
        if (rect && me._checkIsGroup(rect)){
          me._unbindGroup(rect)
          me._updateCurrRect()
          me._historyPush()
        }
      },
    }, '打散'),
    button({
      ...jsxProps,
      domProps_disabled: !rect,
      on_click () {
        let rect = me.objects[me.currRectId]
        if (rect){
          me._getDeepRectsByRect(rect).forEach(rect2 => {
            me._removeRectById(rect2.id)
          })
          me._commandPropUpdate('tempGroupId', '')
          me._updateCurrRect()
          me._historyPush()
        }
      }
    }, '删除'),
    button({
      ...jsxProps,
      domProps_disabled: !me._historyCanBack(),
      on_click () {
        me._historyBack()
      }
    }, '后退'),
    button({
      ...jsxProps,
      domProps_disabled: !me._historyCanGo(),
      on_click () {
        me._historyGo()
      }
    }, '前进'),
    button({
      ...jsxProps,
      domProps_disabled: !rect,
      on_click () {
        if (me._checkIsTempGroup(rect)) {
          me._commandPropUpdate('clipboard', 
            me._getRectsByGroup(rect).map(rect2 => {
              return me._cloneRect(rect2)
            })
          )
        }
        else {
          me._commandPropUpdate('clipboard', [me._cloneRect(rect)])
        }
      }
    }, '复制'),
    button({
      ...jsxProps,
      domProps_disabled: !me.clipboard.length,
      on_click () {
        // todo，粘贴的位置还得考虑
        let rects = me.clipboard.map(config => {
          let rect = me._createRectByConfig(config)
          me._updateRectTempData(rect)
          me._move(rect, 20, 20)
          return rect
        })
        let currRect = rects[0]
        if (rects.length > 1){
          me._unbindTempGroup()
          currRect = me._bindTempGroup(rects)
        }
        me._updateCurrRect(currRect)
        me._clearGuideShow()
        me._historyPush()
      }
    }, '粘贴'),
    button({
      ...jsxProps,
      domProps_disabled: !rect,
      on_click () {
        let parentId = rect.groupId || me.currPageId
        me._linkedListMoveUp(parentId, rect)
        me._historyPush()
      },
    },
      '上移',
    ),
    button({
      ...jsxProps,
      domProps_disabled: !rect,
      on_click () {
        let parentId = rect.groupId || me.currPageId
        me._linkedListMoveDown(parentId, rect)
        me._historyPush()
      },
    },
      '下移',
    ),
    button({
      ...jsxProps,
      domProps_disabled: !rect,
      on_click () {
        let parentId = rect.groupId || me.currPageId
        me._linkedListMoveTop(parentId, rect)
        me._historyPush()
      },
    },
      '置顶',
    ),
    button({
      ...jsxProps,
      domProps_disabled: !rect,
      on_click () {
        let parentId = rect.groupId || me.currPageId
        me._linkedListMoveBottom(parentId, rect)
        me._historyPush()
      },
    },
      '置底',
    ),
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
          props_value:  o,
        }, o)
      })
    ),
  )
  return div({
    'class_proto-tools': true,
  },
    buttonGroup,
  )    
}
export {
  _renderTools,
}