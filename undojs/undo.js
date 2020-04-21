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
    let cache = {
      __proto: null,
    }
    return new Proxy(object, {
      get (object, prop) {//console.log(prop, 'get')
        if (Array.isArray(object) && arrayFStrs.includes(prop)) {
          me._arrayFlag = true
          return cache[prop] || 
            (cache[prop] = me._getArrayF(cache, object, parentProps, prop))
        }
        return Reflect.get(object, prop)
      },
      set (object, prop, value) {//console.log(prop, parentProps, 'value_update....')
        let props = [...parentProps, prop]
        // 如果是数组方法调用触发的，则不记录
        if (me._arrayFlag) {
          // length 是数组调用出发的最后一个 value_update
          if (prop === 'length') {
            me._arrayFlag = false
          }
        }
        else {
          let oldValue = object[prop]
          me._addChange(props, 'value_update', { oldValue, newValue: value })
        }
        me.emit('value_update', {
          object,
          props,
          value,
        })
        return Reflect.set(object, prop, me._proxy(value, props))
      },
      deleteProperty (target, prop) {
        let props = [...parentProps, prop]
        let value = target[prop]
        me._addChange(props, 'prop_delete', { value })
        return Reflect.deleteProperty(target, prop)
      }
    })
  }
  _getArrayF (cache, object, parentProps, fstr) {//console.log('getArrayF')
    let me = this
    let orignFs = cache.__proto || (
      cache.__proto = Object.create(Object.getPrototypeOf(object))
    )
    return function () {
      let args = [...arguments]
        if (fstr === 'push') {
          me._addChange(parentProps, 'array_push', { value: args[0] })
        }
        else if (fstr === 'pop') {
          if (this.length) {
            me._addChange(parentProps, 'array_pop', { value: this[this.length - 1] })
          }
        }
        else if (fstr === 'unshift') {
          me._addChange(parentProps, 'array_unshift', { value: args[0] })
        }
        else if (fstr === 'shift') {
          if (this.length) {
            me._addChange(parentProps, 'array_shift', { value: this[0] })
          }
        }
        else if (fstr === 'splice') {
          let start = args[0]
          let length = args[1]
          let deleteds = this.slice(start, start + length)
          let addeds = args.slice(2)
          if (deleteds.length || addeds.length) {
            me._addChange(parentProps, 'array_splice', {
              start,
              deleteds,
              addeds,
            })
          }
        }
        else if (fstr === 'reverse') {
          me._addChange(parentProps, 'array_reverse', {})
        }
        orignFs[fstr].apply(this ,args)
    }
  }
  _addChange (props, operation, data) {//console.log('addChange', ...arguments)
    if (!this._checkAddChange(props, operation, data)) {
      return false
    }
    let longProp = props.join('.')
    data = cloneDeep(data)
    if (operation === 'value_update') {
      let indexs = []
      // 如果 changes 里已经有一次相同 longProp 的 value_update
      // 那么这中间所有子链条的操作都作废
      let hasSameSet = false
      this._changes.forEach((change, idx) => {
        if (!hasSameSet) {
          hasSameSet = (change.operation === 'value_update') && (change.longProp === longProp)
          if (hasSameSet) {
            data.oldValue = change.data.oldValue
          }
        }
        if (hasSameSet) {
          let isContain = ('.' + change.longProp + '.').indexOf('.' + longProp + '.') === 0
          if (isContain) {
            indexs.push(idx)
          }
        }
      })
      let count = 0
      indexs.forEach(idx => {
        this._changes.splice(idx - count ++, 1)
      })
    }
    if (!this._checkSameValue(data, operation)) {
      this._changes.push({
        longProp,
        operation,
        data,
      })
    }
  }
  _checkSameValue (data, operation) {
    return (operation === 'value_update') && 
      (JSON.stringify(data.newValue) === JSON.stringify(data.oldValue))
  }
  // 检测是否可以加入到 change 里
  _checkAddChange (props, operation, data) {
    if (this._historyFlag) {
      return false
    }
    if (this._checkSameValue(data, operation)) {
      return false
    }
    if (props.slice(-1)[0] === '__proto__') {
      return false
    }
    let ret = true
    let context = {
      props,
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
    if (operation === 'value_update') {
      object[lastProp] = data.value
    }
    else if (operation === 'prop_delete') {
      delete object[lastProp]
    }
    else if (operation === 'prop_add') {
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
      if (operation === 'value_update') {
        updater.data = {
          value: isBack ? data.oldValue : data.newValue
        }
      }
      else if (operation === 'prop_delete') {
        if (isBack) {
          updater.operation = 'prop_add'
        }
      }
      else if (operation === 'array_push') {
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
    })
    return updaters
  }
}
let undo = new Undo()
export {
  undo,
  Undo,
}