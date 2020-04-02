// 数据的所有改动都从这里走
export default {
  methods: {
    _command (
      longProp, 
      newValue
    ) {
      let propObject = this._parseLongProp(longProp)
      let oldValue = propObject.get()
      propObject.set(newValue)
      this._historyDiffAdd(longProp, oldValue, newValue)
    },
    _commandRectAdd (object) {
      object = this._safeObject(object)
      let longProp = `objects.${object.id}`
      this._command(longProp, object)
    },
    _commandRectDelete (object) {
      object = this._safeObject(object)
      this._commandObjectDelete(object)
    },
    _commandRectPropUpdate (object, prop, newValue) {
      object = this._safeObject(object)
      this._commandObjectPropUpdate(object, prop, newValue)
    },
    _commandRectDataPropUpdate (object, prop, newValue) {
      object = this._safeObject(object)
      this._commandObjectDataPropUpdate(object, prop, newValue)
    },
    _commandPropUpdate (
      prop, 
      newValue
    ) {
      let longProp = `${prop}`
      this._command(longProp, newValue)
    },
    _commandPageAdd (object) {
      object = this._safeObject(object)
      let longProp = `objects.${object.id}`
      this._command(longProp, object)
    },
    _commandObjectDelete (object) {
      object = this._safeObject(object)
      let longProp = `objects.${object.id}.isDelete`
      this._command(longProp, true)
    },
    _commandProjectAdd (object) {
      object = this._safeObject(object)
      let longProp = `objects.${object.id}`
      this._command(longProp, object)
    },
    _commandObjectPropUpdate (
      object, 
      prop, 
      newValue
    ) {
      object = this._safeObject(object)
      let longProp = `objects.${object.id}.${prop}`
      this._command(longProp, newValue)
    },
    _commandObjectDataPropUpdate (
      object, 
      prop, 
      newValue
    ) {
      object = this._safeObject(object)
      let longProp = `objects.${object.id}.data.${prop}`
      this._command(longProp, newValue)
    },
  },
}