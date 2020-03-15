import jsx from 'vue-jsx'
let {
  div, 
  span,
  input,
  select,
  option,
} = jsx
let _renderSetting = function (h) {
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
    let data = rect.data
    let getInputJsxProps = (prop) => {
      return {
        domProps_value: (prop === setting.prop) ? setting.value : data[prop],
        domProps_type: 'number',
        key: prop,
        'on_focus' (e) {
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
      span('left'),
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
      span('top'),
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
      span('width'),
      input({
        ...getInputJsxProps('width'),
        domProps_disabled: isAutoSize,
        'on_change' (e) {
          let value = e.target.value
          let intValue = Math.max(10, parseInt(value))
          me._resizeWidthTo(rect, intValue)
          me._commandPropUpdate('setting.value', intValue)
        },
      })
    )
    children = [...children, $width]
    let $height = div({'class_proto-setting-box-item': true},
      span('height'),
      input({
        ...getInputJsxProps('height'),
        domProps_disabled: isAutoSize || isLine,
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
      span('angle'),
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
    if (isLine){
      let $isAngleLock = div({'class_proto-setting-box-item': true},
        span('isAngleLock'),
        input({
          key: 'isAngleLock',
          domProps_type: 'checkbox',
          domProps_checked: data['isAngleLock'],
          'on_change' () {
            let value = !data['isAngleLock']
            me._commandRectDataPropUpdate(rect, 'isAngleLock', value)
            me._historyPush()
          }
        })
      )
      children = [...children, $isAngleLock]
    }
    if (!isGroupLike){
      if (!isText){
        let $borderWidth = div({'class_proto-setting-box-item': true},
          span('borderWidth'),
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
          span('borderStyle'),
          select({
            ...getInputJsxProps('borderStyle'),
          },
            option({props_value: 'solid'},'solid'),
            option({props_value: 'dashed'},'dashed'),
            option({props_value: 'dotted'},'dotted'),
          )
        )
        children = [...children, $borderStyle]
        let $borderColor = div({'class_proto-setting-box-item': true},
          span('borderColor'),
          input({
            ...getInputJsxProps('borderColor'),
            domProps_type: 'color',
          })
        )
        children = [...children, $borderColor]
      }
      if (!isLine){
        let $backgroundColor = div({'class_proto-setting-box-item': true},
          span('bgColor'),
          input({
            ...getInputJsxProps('backgroundColor'),
            domProps_type: 'color',
          })
        )
        children = [...children, $backgroundColor]
      }
      if (!isLine){
        let $color = div({'class_proto-setting-box-item': true},
          span('color'),
          input({
            ...getInputJsxProps('color'),
            domProps_type: 'color',
          })
        )
        children = [...children, $color]
      }
      if (isText){
        let $isAutoSize = div({'class_proto-setting-box-item': true},
          span('isAutoSize'),
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
          })
        )
        children = [...children, $isAutoSize]
      }
      let $fontSize = div({'class_proto-setting-box-item': true},
        span('fontSize'),
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