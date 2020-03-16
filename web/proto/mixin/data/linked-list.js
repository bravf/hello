let _linkedListAppend = function (parentId, object) {
  let parent = this.objects[parentId]
  if (!parent.headId){
    this._commandObjectPropUpdate(parent, 'headId', object.id)
    return
  }
  if (!parent.tailId){
    this._commandObjectPropUpdate(parent, 'tailId', object.id)
    let head = this.objects[parent.headId]
    let tail = this.objects[parent.tailId]
    this._commandObjectPropUpdate(head, 'nextId', tail.id)
    this._commandObjectPropUpdate(tail, 'prevId', head.id)
    return
  }
  let oldTail = this.objects[parent.tailId]
  this._commandObjectPropUpdate(parent, 'tailId', object.id)
  this._commandObjectPropUpdate(oldTail, 'nextId', object.id)
  this._commandObjectPropUpdate(object, 'prevId', oldTail.id)
}
let _linkedListInsertBefore = function (parentId, target, insertObject) {
  let parent = this.objects[parentId]
  let prevId = target.prevId
  let prevObject = this.objects[prevId]

  if (prevId){
    this._commandObjectPropUpdate(insertObject, 'prevId', prevId)
    this._commandObjectPropUpdate(prevObject, 'nextId', insertObject.id)
  }
  else {
    this._commandObjectPropUpdate(parent, 'headId', insertObject.id)
    if (!parent.tailId){
      this._commandObjectPropUpdate(parent, 'tailId', target.id)
    }
  }

  this._commandObjectPropUpdate(insertObject, 'nextId', target.id)
  this._commandObjectPropUpdate(target, 'prevId', insertObject.id)
}
let _linkedListInsertAfter = function (parentId, target, insertObject) {
  let parent = this.objects[parentId]
  let nextId = target.nextId
  let nextObject = this.objects[nextId]

  if (nextId){
    this._commandObjectPropUpdate(insertObject, 'nextId', nextId)
    this._commandObjectPropUpdate(nextObject, 'prevId',  insertObject.id)
  }
  else {
    this._commandObjectPropUpdate(parent, 'tailId', insertObject.id)
  }

  this._commandObjectPropUpdate(insertObject, 'prevId', target.id)
  this._commandObjectPropUpdate(target, 'nextId', insertObject.id)
}
let _linkedListRemove = function (parentId, object) {
  let parent = this.objects[parentId]
  let prevId = object.prevId
  let nextId = object.nextId
  this._commandObjectPropUpdate(object, 'nextId', '')
  this._commandObjectPropUpdate(object, 'prevId', '')

  if (prevId){
    let prevObject = this.objects[prevId]
    this._commandObjectPropUpdate(prevObject, 'nextId', nextId)
  }
  else {
    this._commandObjectPropUpdate(parent, 'headId', nextId)
  }

  if (nextId){
    let nextObject = this.objects[nextId]
    this._commandObjectPropUpdate(nextObject, 'prevId', prevId)
  }
  else {
    this._commandObjectPropUpdate(parent, 'tailId', prevId)
  }

  if (parent.tailId === parent.headId){
    this._commandObjectPropUpdate(parent, 'tailId', '')
  }
}
let _linkedListMoveUp = function (parentId, target) {
  let nextId = target.nextId
  // 如果已经是最顶了
  if (!nextId){
    return
  }
  let nextObject = this.objects[nextId]
  this._linkedListRemove(parentId, target)
  this._linkedListInsertAfter(parentId, nextObject, target)
}
let _linkedListMoveDown = function (parentId, target) {
  let prevId = target.prevId
  // 如果已经是最顶了
  if (!prevId){
    return
  }
  let prevObject = this.objects[prevId]
  this._linkedListRemove(parentId, target)
  this._linkedListInsertBefore(parentId, prevObject, target)
}
let _linkedListMoveTop = function (parentId, target) {
  let parent = this.objects[parentId]
  let tailId = parent.tailId
  if (!tailId || (tailId === target.id)){
    return
  }
  let tailObject = this.objects[tailId]
  this._linkedListRemove(parentId, target)
  this._linkedListInsertAfter(parentId, tailObject, target)
}
let _linkedListMoveBottom = function (parentId, target) {
  let parent = this.objects[parentId]
  let headId = parent.headId
  if (headId === target.id){
    return
  }
  let headObject = this.objects[headId]
  this._linkedListRemove(parentId, target)
  this._linkedListInsertBefore(parentId, headObject, target)
}
let _linkedListGetObjects = function (parentId) {
  let objects = []
  let index = 0
  let f = (_parentId) => {
    let parent = this.objects[_parentId]
    let start = this.objects[parent.headId]
    while (start){
      start.tempIndex = index ++
      objects.push(start)
      if (start.headId){
        f(start.id)
      }
      start = this.objects[start.nextId]
    }
  }
  f(parentId)
  return objects
}
export {
  _linkedListInsertBefore,
  _linkedListInsertAfter,
  _linkedListRemove,
  _linkedListAppend,
  _linkedListGetObjects,
  _linkedListMoveUp,
  _linkedListMoveDown,
  _linkedListMoveTop,
  _linkedListMoveBottom,
}