import undo from '../undo'
export default {
  methods: {
    _historyPush() {
      undo.push()
    },
    _historyBack () {
      undo.back()
    },
    _historyGo () {
      undo.go()
    },
    _historyCanGo () {
      return undo.canGo()
    },
    _historyCanBack () {
      return undo.canBack()
    },
    _historyWatch () {
      undo.watch(this.$data)
        .changeRule(context => {
          // 只处理 this.objects 里的数据
          let isObject = context.props[0] === 'objects'
          if (!isObject) {
            return false
          }
          // 不关心 data.isOpen, tempIndex, tempData, tempGroupId
          if (['isOpen', 'tempIndex', 'tempData', 'tempGroupId'].includes(context.prop)) {
            return false
          }
          // 不关心 tempGroup
          let objectId = context.props[1]
          let object = this._safeObject(objectId)
          if (object && this._checkIsTempGroup(this._safeObject(objectId))) {
            return false
          }
        })
        .on('history', (objects) => {
          console.log('history change', objects)
          this._dbSave(objects.objects)
          this._updateCurrRectBySelected()
          this.renderHook ++
        })
        // .on('push', () => console.log('undo push'))
        // .on('go', () => console.log('undo go'))
        // .on('back', () => console.log('undo back'))
    },
  },
}