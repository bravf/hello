import {
  cloneDeep,
  forEachRight,
  forEach,
} from 'lodash'
export default {
  data () {
    return {
      history: {
        diff: [],
        list: [],
        cursor: -1,
      }
    }
  },
  methods: {
    _historyDiffAdd (longProp, oldValue, newValue) {
      // 排除一些噪音
      // 排除状态没改变的
      if (oldValue === newValue) {
        return
      }
      let oldValue2 = cloneDeep(oldValue)
      let newValue2 = cloneDeep(newValue)
      let history = this.history
      let idx = history.diff.findIndex(o => o.longProp === longProp)
      let isIn = idx !== -1
      if (isIn){
        let diffObject = history.diff[idx]
        // 更新新值
        diffObject['newValue'] = newValue2
        // 更新位置
        history.diff.splice(idx, 1)
        // 如果最终没发生变化，则忽略
        if (newValue2 !== diffObject.oldValue){
          history.diff.push(diffObject)
        }
      }
      else {
        this.history.diff.push({
          longProp, 
          oldValue: oldValue2, 
          newValue: newValue2
        })
      }
    },
    _historyPush() {
      if (!this.history.diff.length){
        return
      }
      // 如果处于历史中，删掉后边的记录
      if (this._historyCanGo()){
        this.history.list = this.history.list.slice(0, this.history.cursor + 1)
      }
      let historyObject = this.history.diff
      this.history.list.push(historyObject)
      this.history.diff = []
      this.history.cursor ++
      this._historyCommitChange(historyObject)
    },
    _historyBack () {
      if (!this._historyCanBack()){
        return
      }
      let historyObject = this.history.list[this.history.cursor --]
      forEachRight(historyObject, (change) => {
        let {longProp, oldValue} = change
        this._parseLongProp(longProp).set(cloneDeep(oldValue))
      })
      this._historyCommitChange(historyObject, 'left')
    },
    _historyGo () {
      if (!this._historyCanGo()){
        return
      }
      let historyObject = this.history.list[++ this.history.cursor]
      forEach(historyObject, (change) => {
        let {longProp, newValue} = change
        this._parseLongProp(longProp).set(cloneDeep(newValue))
      })
      this._historyCommitChange(historyObject)
    },
    _historyCanGo () {
      return this.history.cursor < this.history.list.length - 1
    },
    _historyCanBack () {
      return this.history.cursor > -1
    },
    // 每次历史的更新都从当前的 historyChange 合并变化
    // 并且同步到 server
    _historyCommitChange (historyObject, dir = 'right') {
      historyObject = cloneDeep(historyObject)
      let objects = {}
      let isRight = dir === 'right'
      let f = isRight ? forEach : forEachRight
      f(historyObject, (change) => {
        let {longProp, oldValue, newValue} = change
        let props = longProp.split('.')
        let firstProp = props[0]
        if (!['objects'].includes(firstProp)){
          return
        }
        let object = objects
        let lastProp = props.slice(-1)[0]
        props.slice(1, -1).forEach((p) => {
          if (!(p in object)){
            object[p] = {}
          }
          object = object[p]
        })
        object[lastProp] = isRight ? newValue : oldValue
      })
      // console.log(objects)
    }
  },
}