import jsx from 'vue-jsx'
import { tNumber } from '@/core/base'
let {
  div, 
  span,
  input,
  select,
  option,
  label,
  i,
} = jsx
let _renderSetting = function () {
  let me = this
  let jsxProps = {
    'class_proto-setting': true,
  }
  let rect = this.objects[this.currRectId]
  let children = []
  let setting = this.setting

  if (rect){
    let isGroupLike = this._checkIsGroupLike(rect)
    let isLine = rect.type === 'rect-line'
    let isText = rect.type === 'rect-text'
    let isAutoSize = rect.data.isAutoSize
    let isSameRatio = rect.data.isSameRatio
    let data = rect.data
    let getInputJsxProps = (prop) => {
      let value = (prop === setting.prop) ? setting.value : data[prop]
      if (typeof value === 'number'){
        value = tNumber(value, 0)
      }
      return {
        'class_form-input': true,
        'class_input-sm': true,
        domProps_value: value,
        domProps_type: 'number',
        key: prop,
        'on_focus' () {
          me._updateRectTempData(rect)
          me._commandPropUpdate('setting.prop', prop)
          me._commandPropUpdate('setting.value', data[prop])
        },
        'on_change' (e) {
          let value = e.target.value
          me._updateRectTempData(rect)
          me._commandRectDataPropUpdate(rect, prop, value)
          me._historyPush()
          if (['borderColor', 'borderStyle'].includes(prop)){
            me._flashHandler()
          }
        },
        'on_blur' () {
          me._historyPush()
        }
      }
    }
    let $left = div({'class_proto-setting-box-item': true},
      span('X轴坐标'),
      input({
        ...getInputJsxProps('left'),
        'on_change' (e) {
          let value = e.target.value
          let intValue = parseInt(value)
          me._moveLeftTo(rect, intValue)
          me._commandPropUpdate('setting.value', intValue)
        },
      })
    )
    children = [...children, $left]
    let $top = div({'class_proto-setting-box-item': true},
      span('Y轴坐标'),
      input({
        ...getInputJsxProps('top'),
        'on_change' (e) {
          let value = e.target.value
          let intValue = parseInt(value)
          me._moveTopTo(rect, intValue)
          me._commandPropUpdate('setting.value', intValue)
        },
      })
    )
    children = [...children, $top]
    let $width = div({'class_proto-setting-box-item': true},
      span('宽度'),
      input({
        ...getInputJsxProps('width'),
        domProps_disabled: isAutoSize,
        'on_change' (e) {
          let value = e.target.value
          let intValue = Math.max(10, parseInt(value))
          me._resizeWidthTo(rect, intValue)
          me._commandPropUpdate('setting.value', intValue)
          me._historyPush()
        },
      })
    )
    children = [...children, $width]
    let $height = div({'class_proto-setting-box-item': true},
      span('高度'),
      input({
        ...getInputJsxProps('height'),
        domProps_disabled: isAutoSize || isLine || isSameRatio,
        'on_change' (e) {
          let value = e.target.value
          let intValue = Math.max(10, parseInt(value))
          me._resizeHeightTo(rect, intValue)
          me._commandPropUpdate('setting.value', intValue)
          me._historyPush()
        },
      })
    )
    children = [...children, $height]
    let $angle = div({'class_proto-setting-box-item': true},
      span('角度'),
      input({
        ...getInputJsxProps('angle'),
        'on_change' (e) {
          let value = e.target.value
          let intValue = parseInt(value) % 360
          if (intValue < 0){
            intValue += 360
          }
          me._rotateTo(rect, intValue)
          me._commandPropUpdate('setting.value', intValue)
        },
      })
    )
    children = [...children, $angle]

    if (!isLine){
      let $isSameRatio = div({'class_proto-setting-box-item': true},
        span('等比缩放'),
        label({
          'class_form-switch': true,
        },
          input({
            key: 'isSameRatio',
            domProps_type: 'checkbox',
            domProps_checked: data['isSameRatio'],
            'on_change' () {
              let value = !data['isSameRatio']
              me._commandRectDataPropUpdate(rect, 'isSameRatio', value)
              me._historyPush()
            }
          }),
          i({'class_form-icon': true,}),
        ),
      )
      children = [...children, $isSameRatio]
    }

    if (isLine){
      let $isAngleLock = div({'class_proto-setting-box-item': true},
        span('锁定角度'),
        label({
          'class_form-switch': true,
        },
          input({
            key: 'isAngleLock',
            domProps_type: 'checkbox',
            domProps_checked: data['isAngleLock'],
            'on_change' () {
              let value = !data['isAngleLock']
              me._commandRectDataPropUpdate(rect, 'isAngleLock', value)
              me._historyPush()
            }
          }),
          i({'class_form-icon': true,}),
        ),
      )
      children = [...children, $isAngleLock]
    }
    if (!isGroupLike){
      if (!isText){
        let $borderWidth = div({'class_proto-setting-box-item': true},
          span('边框宽度'),
          input({
            ...getInputJsxProps('borderWidth'),
            'on_change' (e) {
              let value = e.target.value
              let intValue = Math.max(1, parseInt(value))
              me._commandPropUpdate('setting.value', intValue)
              me._commandRectDataPropUpdate(rect, 'borderWidth', intValue)
              if (isLine){
                me._commandRectDataPropUpdate(rect, 'height', intValue)
              }
            }
          })
        )
        children = [...children, $borderWidth]
        let $borderStyle = div({'class_proto-setting-box-item': true},
          span('边框样式'),
          select({
            ...getInputJsxProps('borderStyle'),
            'class_form-select': true,
            'class_select-sm': true,
          },
            option({props_value: 'solid'},'solid'),
            option({props_value: 'dashed'},'dashed'),
            option({props_value: 'dotted'},'dotted'),
          )
        )
        children = [...children, $borderStyle]
        let $borderColor = div({'class_proto-setting-box-item': true},
          span('边框颜色'),
          input({
            ...getInputJsxProps('borderColor'),
            domProps_type: 'color',
          })
        )
        children = [...children, $borderColor]
      }
      if (!isLine){
        let $backgroundColor = div({'class_proto-setting-box-item': true},
          span('背景颜色'),
          input({
            ...getInputJsxProps('backgroundColor'),
            domProps_type: 'color',
          })
        )
        children = [...children, $backgroundColor]
      }
      if (!isLine){
        let $color = div({'class_proto-setting-box-item': true},
          span('文本颜色'),
          input({
            ...getInputJsxProps('color'),
            domProps_type: 'color',
          })
        )
        children = [...children, $color]
      }
      if (isText){
        let $isAutoSize = div({'class_proto-setting-box-item': true},
          span('自适应尺寸'),
          label({
            'class_form-switch': true,
          },
            input({
              key: 'isAutoSize',
              domProps_checked: data['isAutoSize'],
              domProps_type: 'checkbox',
              'on_change' () {
                let value = !data['isAutoSize']
                me._updateRectTempData(rect)
                me._commandRectDataPropUpdate(rect, 'isAutoSize', value)
                me._resizeText(rect)
                me._historyPush()
              }
            }),
            i({'class_form-icon': true,}),
          )
        )
        children = [...children, $isAutoSize]
      }
      let $fontSize = div({'class_proto-setting-box-item': true},
        span('文本大小'),
        input({
          ...getInputJsxProps('fontSize'),
          'on_change' (e) {
            let value = e.target.value
            let intValue = Math.max(12, parseInt(value))
            me._commandRectDataPropUpdate(rect, 'fontSize', intValue)
            me._commandPropUpdate('setting.value', intValue)
            if (data.isAutoSize) {
              me._resizeText(rect)
            }
          },
        })
      )
      children = [...children, $fontSize]
    }
  }
  return div(jsxProps, ...children)
}
export {
  _renderSetting,
}