import {
  merge,
  cloneDeep,
  forEachRight,
  forEach,
} from 'lodash'
export default {
  data () {
    return {
      history: {
        temp: null,
        list: [],
        cursor: -1,
      }
    }
  },
  methods: {
    _historyAdd (id, oldValue, newValue) {
      oldValue = cloneDeep(oldValue)
      newValue = cloneDeep(newValue)
      let history = this.history
      let historyObject
      if (history.temp) {
        historyObject = history.temp
      }
      else {
        historyObject = []
        this._historyListPush(historyObject)
      }
      historyObject.push({
        id, 
        oldValue,
        newValue,
      })
    },
    _historyListPush (historyObject) {
      // 检查是否在旧版本，如果在抛弃后边的历史
      if (this._historyCanGo()){
        this.history.list = this.history.list.slice(0, this.history.cursor + 1)
      }
      this.history.list.push(historyObject)
      this.history.cursor ++
    },
    _historyGroup () {
      if (!this.history.temp){
        this.history.temp = []
      }
    },
    _historyGroupEnd () {
      let history = this.history
      if (history.temp && history.temp.length){
        this._historyListPush(history.temp)
        history.temp = null
      }
    },
    _historyAddDataSizeChange (rect, props = []) {
      this._historyAddDataPropChange(rect, [
        ...props,
        'angle',
        'top',
        'left',
        'width',
        'height',
      ])
    },
    _historyAddDataPropChange (rect, props = []) {
      this._historyGroup()
      this._walkRect(rect, (rect2) => {
        let tempData = rect2.tempData
        let data = rect2.data
        let oldValue = {}
        let newValue = {}
        props.forEach(prop => {
          // 去掉一样的，做一次小 diff
          if (tempData[prop] === data[prop]){
            return
          }
          oldValue[prop] = tempData[prop]
          newValue[prop] = data[prop]
        })
        // 判断是否有值
        if (Object.keys(oldValue).length){
          this._historyAdd(rect2.id, {
            data: oldValue,
          }, {
            data: newValue,
          })
        }
      })
      this._historyGroupEnd()
    },
    _historyCanGo () {
      return this.history.cursor < this.history.list.length - 1
    },
    _historyCanBack () {
      return this.history.cursor > -1
    },
    _historyBack () {
      if (!this._historyCanBack()){
        return
      }
      let historyObject = this.history.list[this.history.cursor --]
      forEachRight(historyObject, (change) => {
        let {id, oldValue, newValue} = change
        if (oldValue === null) {
          this._removeRectById(id)
          this._updateCurrRect()
        }
        else if (newValue === null){
          this.rects[id] = cloneDeep(oldValue)
          this._updateCurrRect(this.rects[id])
        }
        else {
          merge(this.rects[id], oldValue)
        }
      })
    },
    _historyGo () {
      if (!this._historyCanGo()){
        return
      }
      let historyObject = this.history.list[++ this.history.cursor]
      forEach(historyObject, (change) => {
        let {id, oldValue, newValue} = change
        if (oldValue === null) {
          this.rects[id] = cloneDeep(newValue)
          this._updateCurrRect(this.rects[id])
        }
        else if (newValue === null){
          this._removeRectById(id)
          this._updateCurrRect()
        }
        else {
          merge(this.rects[id], newValue)
        }
      })
    }
  },
}