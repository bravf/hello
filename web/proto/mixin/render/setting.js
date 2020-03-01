import jsx from 'vue-jsx'
let {div, span, input, select, option} = jsx
let _renderSetting = function () {
  let me = this
  let jsxProps = {
    'class_proto-setting': true,
  }
  let rect = this.currRects[0]
  let children = []
  let setting = this.setting

  if (rect){
    let isGroupLike = this._checkIsGroupLike(rect)
    let isLine = rect.type === 'line'
    let isText = rect.type === 'text'
    let data = rect.data
    let getInputJsxProps = (prop) => {
      return {
        domProps_value: (prop === setting.prop) ? setting.value : data[prop],
        domProps_type: 'number',
        on_focus (e) {
          me._updateRectTempData(rect)
          setting.prop = prop
          setting.value = data[prop]
        }
      }
    }
    let $left = div({'class_proto-setting-box-item': true},
      span('left'),
      input({
        ...getInputJsxProps('left'),
        on_change (e) {
          let value = e.target.value
          let intValue = parseInt(value)
          me._moveLeftTo(rect, intValue)
          setting.value = intValue
        }
      })
    )
    children = [...children, $left]
    let $top = div({'class_proto-setting-box-item': true},
      span('top'),
      input({
        ...getInputJsxProps('top'),
        on_change (e) {
          let value = e.target.value
          let intValue = parseInt(value)
          me._moveTopTo(rect, intValue)
          setting.value = intValue
        }
      })
    )
    children = [...children, $top]
    let $width = div({'class_proto-setting-box-item': true},
      span('width'),
      input({
        ...getInputJsxProps('width'),
        on_change (e) {
          let value = e.target.value
          let intValue = Math.max(10, parseInt(value))
          me._resizeWidthTo(rect, intValue)
          setting.value = intValue
        }
      })
    )
    children = [...children, $width]
    if (!isLine) {
      let $height = div({'class_proto-setting-box-item': true},
        span('height'),
        input({
          ...getInputJsxProps('height'),
          on_change (e) {
            let value = e.target.value
            let intValue = Math.max(10, parseInt(value))
            me._resizeHeightTo(rect, intValue)
            setting.value = intValue
          }
        })
      )
      children = [...children, $height]
    }
    let $angle = div({'class_proto-setting-box-item': true},
      span('angle'),
      input({
        ...getInputJsxProps('angle'),
        on_change (e) {
          let value = e.target.value
          let intValue = parseInt(value) % 360
          if (intValue < 0){
            intValue += 360
          }
          me._rotateTo(rect, intValue)
          setting.value = intValue
        }
      })
    )
    children = [...children, $angle]
    if (isLine){
      let $isAngleLock = div({'class_proto-setting-box-item': true},
        span('isAngleLock'),
        input({
          attrs_type: 'checkbox',
          domProps_checked: data['isAngleLock'],
          on_change (e) {
            data['isAngleLock'] = !data['isAngleLock']
          }
        })
      )
      children = [...children, $isAngleLock]
    }
    if (!isGroupLike){
      let $borderWidth = div({'class_proto-setting-box-item': true},
        span('borderWidth'),
        input({
          ...getInputJsxProps('borderWidth'),
          on_change (e) {
            let value = e.target.value
            let intValue = Math.max(1, parseInt(value))
            setting.value = data['borderWidth'] = intValue
            if (isLine){
              data['height'] = intValue
            }
          }
        })
      )
      children = [...children, $borderWidth]
      let $borderStyle = div({'class_proto-setting-box-item': true},
        span('borderStyle'),
        select({
          domProps_value: data['borderStyle'],
          on_change (e) {
            data['borderStyle'] = e.target.value         
          }
        },
          option({domProps_value: 'solid'},'solid'),
          option({domProps_value: 'dashed'},'dashed'),
          option({domProps_value: 'dotted'},'dotted'),
        )
      )
      children = [...children, $borderStyle]
      let $borderColor = div({'class_proto-setting-box-item': true},
        span('borderColor'),
        input({
          domProps_value: data['borderColor'],
          attrs_type: 'color',
          on_change (e) {
            data['borderColor'] = e.target.value
          }
        })
      )
      children = [...children, $borderColor]
      let $backgroundColor = div({'class_proto-setting-box-item': true},
        span('bgColor'),
        input({
          domProps_value: data['backgroundColor'],
          attrs_type: 'color',
          on_change (e) {
            data['backgroundColor'] = e.target.value
          }
        })
      )
      children = [...children, $backgroundColor]
      if (!isLine){
        let $color = div({'class_proto-setting-box-item': true},
          span('color'),
          input({
            domProps_value: data['color'],
            attrs_type: 'color',
            on_change (e) {
              data['color'] = e.target.value
            }
          })
        )
        children = [...children, $color]
      }
      if (isText){
        let $isAutoSize = div({'class_proto-setting-box-item': true},
          span('isAutoSize'),
          input({
            domProps_checked: data['isAutoSize'],
            attrs_type: 'checkbox',
            on_change (e) {
              data['isAutoSize'] = !data['isAutoSize']
            }
          })
        )
        children = [...children, $isAutoSize]
      }
      let $fontSize = div({'class_proto-setting-box-item': true},
        span('fontSize'),
        input({
          domProps_type: 'number',
          domProps_value: data['fontSize'],
          on_change (e) {
            let value = e.target.value
            let intValue = Math.max(12, parseInt(value))
            data['fontSize'] = intValue
            if (data.isAutoSize) {
              me._resizeText(rect)
            }
          }
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