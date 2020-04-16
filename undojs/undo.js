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
    this._event = new EventEmitter()
    this._rules = []
    this._init(object)
  }
  _init (object) {
    this._data = this._proxy(object)
    this._changes = []
    this._historys = []
    this._cursor = -1
    this._historyFlag = false
    this._arrayFlag = false
  }
  watch (object) {
    this._init(object)
    return this
  }
  on (msg, f) {
    this._event.on(msg, f)
    return this
  }
  emit (msg, data) {
    this._event.emit(msg, data)
    return this
  }
  getData () {
    return this._data
  }
  getHistorys () {
    return this._historys
  }
  getChanges () {
    return this._changes
  }
  getCursor () {
    return this._cursor
  }
  addRule (f) {
    this._rules.push(f)
    return this
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
    let updaters = this._getHistroyUpdaters(history)
    this.emit('history', updaters)
    this.emit('push', updaters)
    return this
  }
  back () {
    if (!this.canBack()) {
      return
    }
    this._historyFlag = true
    let history = this._historys[this._cursor --]
    let updaters = this._getHistroyUpdaters(history, 'back')
    forEach(updaters, updater => {
      this._udpateValueByUpdater(updater, 'back')
    })
    this.emit('history', updaters)
    this.emit('back', updaters)
    this._historyFlag = false
    return this
  }
  go () {
    if (!this.canGo()) {
      return
    }
    this._historyFlag = true
    let history = this._historys[++ this._cursor]
    let updaters = this._getHistroyUpdaters(history, 'go')
    forEach(updaters, updater => {
      this._udpateValueByUpdater(updater, 'go')
    })
    this.emit('history', updaters)
    this.emit('go', updaters)
    this._historyFlag = false
    return this
  }
  canGo () {
    return this._cursor < this._historys.length - 1
  }
  canBack () {
    return this._cursor > -1
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
        if (object.hasOwnProperty(key)) {
          let value = object[key]
          object[key] = this._proxy(value, [...parentProps, key])
        } 
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
          me._arrayFlag = true
        }
        return object[prop]
      },
      set (object, prop, value) {
        // 如果是数组方法调用触发的，则不记录
        if (me._arrayFlag) {
          // length 是数组调用出发的最后一个 set
          if (prop === 'length') {
            me._arrayFlag = false
          }
        }
        else {
          let props = [...parentProps, prop]
          let oldValue = object[prop]
          me._addChange(props.join('.'), 'set', { oldValue, newValue: value })
        }
        object[prop] = me._proxy(value, parentProps)
        me.emit('valueSet', {
          object,
          prop,
          value,
        })
        return true
      }
    })
  }
  _handleArray (object, parentProps) {
    let me = this
    let arrayFs = Object.create(Array.prototype)
    let orignFs = Object.create(object.__proto__)
    let longProp = parentProps.join('.')
    arrayFStrs.forEach(fstr => {
      arrayFs[fstr] = function () {
        let args = [...arguments]
        if (fstr === 'push') {
          me._addChange(longProp, 'array_push', { value: args[0] })
        }
        else if (fstr === 'pop') {
          if (this.length) {
            me._addChange(longProp, 'array_pop', { value: this[this.length - 1] })
          }
        }
        else if (fstr === 'unshift') {
          me._addChange(longProp, 'array_unshift', { value: args[0] })
        }
        else if (fstr === 'shift') {
          if (this.length) {
            me._addChange(longProp, 'array_shift', { value: this[0] })
          }
        }
        else if (fstr === 'splice') {
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
        // else if (fstr === 'sort') {
        //   let defaultF = (a ,b) => (a + '').charCodeAt() - (b + '').charCodeAt()
        //   let sortF = args[0] || defaultF
        //   me._addChange(longProp, 'array_sort', { sortF })
        // }
        else if (fstr === 'reverse') {
          me._addChange(longProp, 'array_reverse', {})
        }
        orignFs[fstr].apply(this ,args)
      }
    })
    object.__proto__ = arrayFs
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
  // 检测是否可以加入到 change 里
  _checkAddChange (longProp, operation, data) {
    if (this._historyFlag) {
      return false
    }
    if (operation === 'set') {
      if (data.newValue === data.oldValue) {
        return false
      }
    }
    let ret = true
    let context = {
      longProp,
      operation,
      data,
    }
    this._rules.every(f => {
      if (f(context) === false) {
        ret = false
        return false
      }
    })
    return ret
  }
  _udpateValueByUpdater (updater) {
    updater = cloneDeep(updater)
    let { longProp, operation, data } = updater
    let props = longProp.split('.')
    let lastProp = props.slice(-1)[0]
    let object = this._data
    props.slice(0, -1).forEach(prop => {
      object = object[prop]
    })
    if (operation === 'set') {
      object[lastProp] = data.value
    }
    else {
      object = object[lastProp]
      if (operation === 'array_push') {
        object.push(data.value)
      }
      else if (operation === 'array_pop') {
        object.pop()
      }
      else if (operation === 'array_unshift') {
        object.unshift(data.value)
      }
      else if (operation === 'array_shift') {
        object.shift()
      }
      else if (operation === 'array_splice') {
        object.splice(data.start, data.deleteds.length, ...data.addeds)
      }
      // TODO: 这里有问题
      // else if (operation === 'array_sort') {
      //   isBack ?
      //     object.sort( (a, b) => -data.sortF(a, b)) :
      //     object.sort(data.sortF)
      // }
      else if (operation === 'array_reverse') {
        object.reverse()
      }
    }
  }
  _getHistroyUpdaters (history, historyType = 'go') {
    let updaters = []
    let isBack = historyType === 'back'
    let f = isBack ? forEachRight : forEach
    f(history, change => {
      let { 
        longProp, 
        operation, 
        data 
      } = change
      let updater = {
        longProp,
        operation,
        data,
      }
      updaters.push(updater)
      if (operation === 'set') {
        updater.data = {
          value: isBack ? data.oldValue : data.newValue
        }
      }
      else {
        if (operation === 'array_push') {
          if (isBack) {
            updater.operation = 'array_pop'
            updater.data = {}
          }
        }
        else if (operation === 'array_pop') {
          if (isBack) {
            updater.operation = 'array_push'
          }
          else {
            updater.data = {}
          }
        }
        else if (operation === 'array_unshift') {
          if (isBack) {
            updater.operation = 'array_shift'
            updater.data = {}
          }
        }
        else if (operation === 'array_shift') {
          if (isBack) {
            updater.operation = 'array_unshift'
          }
          else {
            updater.data = {}
          }
        }
        else if (operation === 'array_splice') {
          if (isBack) {
            updater.data = {
              start: data.start,
              deleteds: [...data.addeds],
              addeds: [...data.deleteds],
            }
          }
        }
      }
    })
    return updaters
  }
}
let undo = new Undo()
export {
  undo,
  Undo,
}