import jsx from 'vue-jsx'
let {div, span,  input} = jsx
let _renderSetting = function () {
  let me = this
  let jsxProps = {
    'class_proto-setting': true,
  }
  let rect = this.currRects[0]
  let children = []
  let setting = this.setting

  if (rect){
    let data = rect.data
    // size box
    let sizeBox = div({'class_proto-setting-box': true,},
      ...[
        {
          prop: 'left',
          emitF: '_moveLeftTo',
        },
        {
          prop: 'top',
          emitF: '_moveTopTo',
        },
        {
          prop: 'width',
          emitF: '_resizeWidthTo',
          checkValueF (value) {
            return Math.max(value, 0)
          },
        },
        {
          prop: 'height',
          emitF: '_resizeHeightTo',
          checkValueF (value) {
            return Math.max(value, 0)
          },
        },
        {
          prop: 'angle',
          emitF: '_rotateTo',
          checkValueF (value) {
            value = value % 360
            if (value < 0){
              return 360 + value
            }
            return value
          },
        },
        {
          prop: 'borderWidth',
        },
        // {
        //   prop: 'borderColor',
        // },
        // {
        //   prop: 'borderStyle',
        // },
      ].map(o => {
        let prop = o.prop
        let inputJsxProps = {
          domProps_value: (prop === setting.prop) ? setting.value : data[prop],
          domProps_type: 'number',
          domProps_min: o['min'],
          on_focus (e) {
            me._updateRectTempData(rect)
            setting.prop = prop
            setting.value = data[prop]
          },
          on_change (e) {
            let value = e.target.value
            if ('checkValueF' in o){
              value = o.checkValueF(value)
            }
            
            if ('emitF' in o){
              me[o['emitF']].call(me, rect, value)
            }
            else {
              data[prop] = value
              if ( (rect.type === 'line') && (prop === 'borderWidth') ) {
                data['height'] = parseInt(value)
              }
            }
            setting['value'] = value
          },
        }
        return div({'class_proto-setting-box-item': true},
          span(prop),
          input(inputJsxProps)
        )
      })
    )
    children = [...children, sizeBox]
  }
  return div(jsxProps, ...children)
}
export {
  _renderSetting,
}