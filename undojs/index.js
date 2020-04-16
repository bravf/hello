import Vue from 'vue'
import jsx from 'vue-jsx'
import { undo } from './undo'

let { div, button } = jsx
let data = {
  y: [],
  x: 0,
  a: {
    b: 1,
    c: 2,
    d: 3,
    f: [1,3,2],
  },
  hook: 0,
}
data = undo.watch(data)
  .on('push', (updaters) => console.log('undo push', updaters))
  .on('go', (updaters) => console.log('undo go', updaters))
  .on('back', (updaters) => console.log('undo back', updaters))
  .getData()
console.log(data)
new Vue({
  el: '#app',
  data () {
    return {
      hook: 0,
    }
  },
  render (h) {
    jsx.h = h
    let me = data
    let that = this
    this.hook
    return div('.app',
      button({
        on_click () {
          // me.a.f.push(9)
          // me.a.f = [3]
          // me.a.f.push(4)
          // me.a.f = [5]
          me.a.b ++
          me.a.b = {c:1}
          me.a = {}

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
      div(JSON.stringify(data)),
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
    // this._data = undo.watch(this._data)
    //   .addRule(context => {
    //     if (context.props.join('.') === 'a.b.c.d.e') {
    //       return false
    //     }
    //   })
    //   .on('valueSet', () => {
    //     // this.hook ++
    //   })
    //   .on('history', updaters => {
    //     console.log('undo change', updaters)
    //   })
    //   .on('push', (updaters) => console.log('undo push', updaters))
    //   .on('go', (updaters) => console.log('undo go', updaters))
    //   .on('back', (updaters) => console.log('undo back', updaters))
    //   .getData()
  }
})
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