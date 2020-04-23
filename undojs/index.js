import Vue from 'vue'
import jsx from 'vue-jsx'
import { undo } from './undo'

let { div, button, input, select } = jsx
let data = {
  y: [],
  x: 1,
  a: {
    b: 1,
    c: 2,
    d: 3,
    f: [1,3,2],
    e: [],
  },
  hook: 0,
}
for (let i = 0; i< 1000000; i++) {
  data.a.e.push({
    title: 'hello' + i,
  })
}
console.time('undo time')
data = undo.watch(data)
  .on('push', (updaters) => console.log('undo push', updaters))
  .on('go', (updaters) => console.log('undo go', updaters))
  .on('back', (updaters) => console.log('undo back', updaters))
  .getData()
console.timeEnd('undo time')
window.addEventListener('change', () => {
  undo.push()
})

new Vue({
  el: '#app',
  data () {
    return data
  },
  render (h) {
    jsx.h = h
    let me = data
    let that = this
    this.hook
    return div('.app',
      input({
        domProps_type: 'number',
        domProps_value: this.x,
        on_input (e) {
          me.x = e.target.value
        }
      }),
      button({
        on_click () {
          // delete data['x']
          // me.a.f = [3]
          me.a.f.splice(0, 1, 100)
          // me.a.f.push(4)
          // me.a.f = [5]
          // me.a.f.push(6)
          // me.a.f = [7]
          // me.a.e.push(8)
          // me.a.b ++
          // me.a.b = {c:1}
          // me.a = {}

          that.hook ++
          undo.push()
        }
      }, 'a.b 加1'),
      button({
        domProps_disabled: !undo.canBack(),
        on_click () {
          undo.back()
          that.hook ++
        }
      }, '撤销'),
      button({
        domProps_disabled: !undo.canGo(),
        on_click () {
          undo.go()
          that.hook ++
        }
      }, '重做'),
      // div(JSON.stringify(data)),
      div(
        div('历史记录'),
        div('.historys',
          ...undo.getHistorys().map((history, i) => {
            return div({
              'class_history': true,
              'class_currentHistory': i === undo.getCursor(),
              key: i,
            },
              div('#' + i),
              div(
                ...history.map(change => {
                  return div(JSON.stringify(change))
                })
              )
            )
          })
        )
      ),
    )
  },
  created () {
    
  }
})
// window.addEventListener('change', (e) => {
//   console.log(e, 'change')
// })
// window.addEventListener('focus', (e) => {
//   console.log(e, 'focus')
// })
// window.addEventListener('blur', (e) => {
//   console.log(e, 'blur')
// })
// window.addEventListener('mouseup', (e) => {
//   console.log(e, 'mouseup')
// })
// app.a.b = 2
// app.a.x = 1
// UndoObject.push()
// UndoObject.back()
// UndoObject.go()
// console.log(UndoObject.history)
// let obj = undo.watch({a:[]})
//   .on('push', updaters => {
//     console.log('undo change', updaters)
//   })
//   .on('back', updaters => {
//     console.log('undo back', updaters)
//   })
//   .getData()
// obj.a.push(1)
// obj.a = [2]
// obj.a.push(3)
// obj.a = [4]
// undo.push()
// undo.back()

// let obj = {}
// obj = new Proxy(obj, {
//   get (object, prop) {
//     console.log('proxy get 1')
//     return object[prop]
//   },
//   set (object, prop, value) {
//     console.log('proxy set 1')
//     object[prop] = value
//     return true
//   }
// })
// obj = new Proxy(obj, {
//   get (object, prop) {
//     console.log('proxy get 2')
//     return object[prop]
//   },
//   set (object, prop, value) {
//     console.log('proxy set 2')
//     object[prop] = value
//     return true
//   }
// })
// obj.x = 1
// obj.x