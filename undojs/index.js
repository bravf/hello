import Vue from 'vue'
import jsx from 'vue-jsx'
import { undo } from './undo'

let { div, button } = jsx
new Vue({
  el: '#app',
  data () {
    return {
      x: 0,
      y: [],
      a: {
        b: 1,
        c: 2,
        d: 3,
        f: [1,3,2],
      },
      hook: 0,
    }
  },
  render (h) {
    jsx.h = h
    let me = this
    return div('.app',
      button({
        on_click () {
          // me.y.push(1)
          // me.y = [2]
          // me.x ++
          // me.a.b ++
          // me.a.b --
          // me.a.b = me.a.b
          // me.a.b = me.a.b
          // me.a.c --
          // me.a.c --
          // me.a.d = Math.random() * 10
          // me.a.e = {hehe: Math.random()}
          // me.a.f[0].hehe = Math.random()
          // me.a.f.pop()
          // me.a.f = 1
          // me.a.f.push(Math.random())
          // me.a.f.reverse()
          // me.a.f.push(0)
          // me.a.f.push(1)
          me.a.f = []
          // me.a.f.shift()
          // me.a.f = 5
          // me.a.f.splice(0 ,10)
          // let o = {x:1}
          // me.a.f.unshift(o)
          // me.a.f[0].x ++
          // me.a.f.reverse()
          // me.a.f.sort()

          // me.a.d ++
          // me.a.d ++
          // me.a.f[0] = Math.random()
          undo.push()
        }
      }, 'a.b 加1'),
      button({
        domProps_disabled: !undo.canBack(),
        on_click () {
          undo.back()
        }
      }, '撤销'),
      button({
        domProps_disabled: !undo.canGo(),
        on_click () {
          undo.go()
        }
      }, '重做'),
      div(JSON.stringify(this.$data)),
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
    undo.watch(this.$data)
      .addRule(context => {
        if (context.longProp === 'a.b.c.d.e') {
          return false
        }
      })
      .on('valueSet', () => {
        // this.hook ++
      })
      .on('history', updaters => {
        console.log('undo change', updaters)
      })
      .on('push', (updaters) => console.log('undo push', updaters))
      .on('go', (updaters) => console.log('undo go', updaters))
      .on('back', (updaters) => console.log('undo back', updaters))
      .getData()
  }
})
// app.a.b = 2
// app.a.x = 1
// UndoObject.push()
// UndoObject.back()
// UndoObject.go()
// console.log(UndoObject.history)
// let arr = undo.watch([])
//   .on('push', updaters => {
//     console.log('undo change', updaters)
//   })
//   .getData()
// arr[0] = 1
// arr.push(2)
// undo.push()
// console.log(arr)