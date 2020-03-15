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
      let longProp = `objects.${rect.id}`
      this._command(longProp, rect)
    },
    _commandRectDelete (rectId) {
      let longProp = `objects.${rectId}`
      this._command(longProp, null)
    },
    _commandRectPropUpdate (rect, prop, newValue) {
      let longProp = `objects.${rect.id}.${prop}`
      this._command(longProp, newValue)
    },
    _commandRectDataPropUpdate (rect, prop, newValue) {
      let longProp = `objects.${rect.id}.data.${prop}`
      this._command(longProp, newValue)
    },
    _commandPropUpdate (prop, newValue) {
      let longProp = `${prop}`
      this._command(longProp, newValue)
    },
    // page
    _commandPageAdd (page) {
      let longProp = `objects.${page.id}`
      this._command(longProp, page)
    },
    // _commandLog (longProp, oldValue, newValue) {
    //   this._historyDiffAdd(longProp, oldValue, newValue)
    // },
    _commandObjectPropUpdate (object, prop, newValue) {
      let longProp = `objects.${object.id}.${prop}`
      this._command(longProp, newValue)
    },
  },
}