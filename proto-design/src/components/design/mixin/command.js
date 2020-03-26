// 数据的所有改动都从这里走
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
      this._commandObjectDelete(rectId)
    },
    _commandRectPropUpdate (rect, prop, newValue) {
      this._commandObjectPropUpdate(rect, prop, newValue)
    },
    _commandRectDataPropUpdate (rect, prop, newValue) {
      this._commandObjectDataPropUpdate(rect, prop, newValue)
      // let longProp = `objects.${rect.id}.data.${prop}`
      // this._command(longProp, newValue)
    },
    _commandPropUpdate (prop, newValue) {
      let longProp = `${prop}`
      this._command(longProp, newValue)
    },
    _commandPageAdd (page) {
      let longProp = `objects.${page.id}`
      this._command(longProp, page)
    },
    _commandObjectDelete (objectId) {
      let longProp = `objects.${objectId}.isDelete`
      this._command(longProp, true)
    },
    _commandProjectAdd (project) {
      let longProp = `objects.${project.id}`
      this._command(longProp, project)
    },
    _commandObjectPropUpdate (object, prop, newValue) {
      let longProp = `objects.${object.id}.${prop}`
      this._command(longProp, newValue)
    },
    _commandObjectDataPropUpdate (object, prop, newValue) {
      let longProp = `objects.${object.id}.data.${prop}`
      this._command(longProp, newValue)
    },
  },
}