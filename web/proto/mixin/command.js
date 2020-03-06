// 数据的所有改动都从这里走
import {
  cloneDeep,
} from 'lodash'
export default {
  methods: {
    _command (longProp, newValue) {
      let propObject = this._parseLongProp(longProp)
      let oldValue = propObject.get()
      propObject.set(newValue)
      this._historyDiffAdd(longProp, oldValue, newValue)
      this.renderHook ++
    },
    _commandRectAdd (rect) {
      let longProp = `rects.${rect.id}`
      this._command(longProp, rect)
    },
    _commandRectDelete (rectId) {
      let longProp = `rects.${rectId}`
      this._command(longProp, null)
    },
    _commandRectPropUpdate (rect, prop, newValue) {
      let longProp = `rects.${rect.id}.${prop}`
      this._command(longProp, newValue)
    },
    _commandRectDataPropUpdate (rect, prop, newValue) {
      let longProp = `rects.${rect.id}.data.${prop}`
      this._command(longProp, newValue)
    },
    _commandPropUpdate (prop, newValue) {
      let longProp = `${prop}`
      this._command(longProp, newValue)
    }
  },
}