* 无侵入的状态历史管理器
```
let undo = new Undo()
let data = {
  a: 1,
  b: [1,2,3],
}
let undoData = undo.watch(data).data
undoData.a = 2
undoData.b.push({hello: 'world'})
undo.push()
undo.back()
undo.go()
```