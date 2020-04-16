* 无侵入的状态历史管理器
```javascript
import { undo } from './undo.js'
let data = {
  a: 1,
  b: [1,2,3],
}
data = undo.watch(data)
  .on('push', (updaters) => console.log('undo push', updaters))
  .on('go', (updaters) => console.log('undo go', updaters))
  .on('back', (updaters) => console.log('undo back', updaters))
  .getData()
data.a = 2
data.b.push({hello: 'world'})
undo.push() // 记录一个历史
undo.back() // 回退一个历史
undo.go()   // 前进一个历史
```
