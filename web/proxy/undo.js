import { 
  cloneDeep,
  forEachRight,
  forEach,
  isPlainObject,
 } from 'lodash'
import EventEmitter from 'events'
let arrayFStrs = ['push', 'pop', 'shift', 'unshift', 'splice', 'reverse']
class Undo {
  constructor (object = {}) {
    this._ee = new EventEmitter()
    this._changeRules = []
    this._init(object)
  }
  _init (object) {
    this.data = this._proxy(object)
    this._changes = []
    this._historys = []
    this._cursor = -1
    this._historyFlag = false
    this._arrayFFlag = false
  }
  watch (object) {
    this._init(object)
    return this
  }
  on (msg, f) {
    this._ee.on(msg, f)
    return this
  }
  emit (msg, data) {
    this._ee.emit(msg, data)
    return this
  }
  getHistorys () {
    return cloneDeep(this._historys)
  }
  getChanges () {
    return cloneDeep(this._changes)
  }
  getCursor () {
    return this._cursor
  }
  changeRule (f) {
    this._changeRules.push(f)
    return this
  }
  // 检测是否需要加入到 change 里
  _checkAddChange (longProp, operation, data) {
    if (this._historyFlag) {
      return false
    }
    if (operation === 'set') {
      if (data.newValue === data.oldValue) {
        return false
      }
    }
    return true
    // if (context.value === context.oldValue) {
    //   return false
    // }
    // let ret = true
    // this._changeRules.every(f => {
    //   if (f(context) === false) {
    //     ret = false
    //     return false
    //   }
    // })
    // return ret
  }
  _udpateValueByHistory (change, historyType) {
    change = cloneDeep(change)
    let { longProp, operation, data } = change
    let props = longProp.split('.')
    let lastProp = props.slice(-1)[0]
    let object = this.data
    props.slice(0, -1).forEach(prop => {
      object = object[prop]
    })
    if (operation === 'set') {
      object[lastProp] = historyType === 'go' ? data.newValue : data.oldValue
    }
    else {
      object = object[lastProp]
      let isBack = historyType === 'back'
      if (operation === 'array_push') {
        isBack ?
          object.pop() :
          object.push(data.value)
      }
      else if (operation === 'array_pop') {
        isBack ?
          object.push(data.value) :
          object.pop()
      }
      else if (operation === 'array_unshift') {
        isBack ?
          object.shift() :
          object.unshift(data.value)
      }
      else if (operation === 'array_shift') {
        isBack ?
          object.unshift(data.value) :
          object.shift()
      }
      else if (operation === 'array_splice') {
        isBack ?
          object.splice(data.start, data.addeds.length, ...data.deleteds) :
          object.splice(data.start, data.deleteds.length, ...data.addeds)
      }
      // TODO: 这里有问题
      else if (operation === 'array_sort') {
        isBack ?
          object.sort( (a, b) => -data.sortF(a, b)) :
          object.sort(data.sortF)
      }
      else if (operation === 'array_reverse') {
        object.reverse()
      }
    }
  }
  _handleArray (object, parentProps) {
    let me = this
    let arrayMethod = Object.create(Array.prototype)
    let longProp = parentProps.join('.')
    arrayFStrs.forEach(function (method) {
      Object.defineProperty(arrayMethod, method, {
        enumerable: true,
        configurable: true,
        value: function () {
          let args = [...arguments]
          if (method === 'push') {
            me._addChange(longProp, 'array_push', { value: args[0] })
          }
          else if (method === 'pop') {
            if (this.length) {
              me._addChange(longProp, 'array_pop', { value: this[this.length - 1] })
            }
          }
          else if (method === 'unshift') {
            me._addChange(longProp, 'array_unshift', { value: args[0] })
          }
          else if (method === 'shift') {
            if (this.length) {
              me._addChange(longProp, 'array_shift', { value: this[0] })
            }
          }
          else if (method === 'splice') {
            let start = args[0]
            let length = args[1]
            let deleteds = this.slice(start, start + length)
            let addeds = args.slice(2)
            if (deleteds.length || addeds.length) {
              me._addChange(longProp, 'array_splice', {
                start,
                deleteds,
                addeds,
              })
            }
          }
          else if (method === 'sort') {
            let defaultF = (a ,b) => (a + '').charCodeAt() - (b + '').charCodeAt()
            let sortF = args[0] || defaultF
            me._addChange(longProp, 'array_sort', { sortF })
          }
          else if (method === 'reverse') {
            me._addChange(longProp, 'array_reverse', {})
          }
          Array.prototype[method].apply(this, args)
        }
      })
    })
    object.__proto__ = arrayMethod
  }
  _proxy (object, parentProps = []) {
    if (Array.isArray(object)) {
      this._handleArray(object, parentProps)
      object.forEach((value, idx) => {
        object[idx] = this._proxy(value, [...parentProps, idx])
      })
      return this._proxyBase(object, parentProps)
    }
    else if (isPlainObject(object)) {
      for (let key in object) {
        let value = object[key]
        object[key] = this._proxy(value, [...parentProps, key])
      }
      return this._proxyBase(object, parentProps)
    }
    else {
      return object
    }
  }
  _proxyBase (object, parentProps = []) {
    let me = this
    return new Proxy(object, {
      get (object, prop) {
        if (Array.isArray(object) && arrayFStrs.includes(prop)) {
          me._arrayFFlag = true
        }
        return object[prop]
      },
      set (object, prop, value) {
        // 如果是数组方法调用触发的，则不记录
        if (me._arrayFFlag) {
          // length 是数组调用出发的最后一个 set
          if (prop === 'length') {
            me._arrayFFlag = false
          }
        }
        else {
          let props = [...parentProps, prop]
          let oldValue = object[prop]
          me._addChange(props.join('.'), 'set', { oldValue, newValue: value })
        }
        object[prop] = me._proxy(value, parentProps)
        return true
      }
    })
  }
  _addChange (longProp, operation, data) {
    if (!this._checkAddChange(longProp, operation, data)) {
      return false
    }
    data = cloneDeep(data)
    if (operation === 'set') {
      let { newValue } = data
      let longPropIdx = this._changes.findIndex(
        o => o.longProp === longProp
      )
      let isLongPropIn = longPropIdx !== -1
      if (isLongPropIn) {
        let change = this._changes[longPropIdx]
        change.data.newValue = newValue
        // 删除原来的位置
        this._changes.splice(longPropIdx, 1)
        if (newValue !== change.data.oldValue) {
          this._changes.push(change)
        }
      }
      else {
        this._changes.push({
          longProp,
          operation,
          data,
        })
      }
    }
    else {
      this._changes.push({
        longProp,
        operation,
        data,
      })
    }
  }
  push () {
    if (!this._changes.length) {
      return
    }
    if (this.canGo()) {
      this._historys = this._historys.slice(0, this._cursor + 1)
    }
    let history = this._changes
    this._historys.push(history)
    this._changes = []
    this._cursor ++
    let changeObjects = this.getChangeObjects(history)
    this.emit('history', changeObjects)
    this.emit('push', changeObjects)
    return this
  }
  back () {
    if (!this.canBack()) {
      return
    }
    this._historyFlag = true
    let history = this._historys[this._cursor --]
    forEachRight(history, change => {
      this._udpateValueByHistory(change, 'back')
    })
    let changeObjects = this.getChangeObjects(history, 'back')
    this.emit('history', changeObjects)
    this.emit('back', changeObjects)
    this._historyFlag = false
    return this
  }
  go () {
    if (!this.canGo()) {
      return
    }
    this._historyFlag = true
    let history = this._historys[++ this._cursor]
    forEach(history, change => {
      this._udpateValueByHistory(change, 'go')
    })
    let changeObjects = this.getChangeObjects(history, 'go')
    this.emit('history', changeObjects)
    this.emit('go', changeObjects)
    this._historyFlag = false
    return this
  }
  canGo () {
    return this._cursor < this._historys.length - 1
  }
  canBack () {
    return this._cursor > -1
  }
  // right 向前，left 向后
  getChangeObjects (history, historyType = 'go') {
    return {
      history,
      historyType,
    }
    // history = cloneDeep(history)
    // let objects = {}
    // // let isRight = dir === 'right'
    // // let f = isRight ? forEach : forEachRight
    // forEach(history, change => {
    //   let { longProp, data, operation } = change
    //   let object = objects
    //   let props = longProp.split('.')
    //   let lastProp = props.slice(-1)[0]
    //   props.slice(0, -1).forEach(prop => {
    //     if (!(prop in object)) {
    //       object[prop] = {}
    //     }
    //     object = object[prop]
    //   })
    //   if (operation === 'set') {
    //     object[lastProp] = { 
    //       $$data: data, 
    //       $$operation: operation, 
    //     }
    //   }
    //   else {
    //     // object[lastProp] = 
    //   }
    // })
    // return objects
  }
  toString () {
    return JSON.stringify(this.data)
  }
}
export default Undo