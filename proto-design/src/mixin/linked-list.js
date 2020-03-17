let _linkedListAppend = function (parent, object, childrenProp = 'rects') {
  let children = parent[childrenProp]
  if (!children.headId){
    this._commandObjectPropUpdate(parent, `${childrenProp}.headId`, object.id)
    return
  }
  if (!children.tailId){
    this._commandObjectPropUpdate(parent, `${childrenProp}.tailId`, object.id)
    let head = this.objects[children.headId]
    let tail = this.objects[children.tailId]
    this._commandObjectPropUpdate(head, 'nextId', tail.id)
    this._commandObjectPropUpdate(tail, 'prevId', head.id)
    return
  }
  let oldTail = this.objects[children.tailId]
  this._commandObjectPropUpdate(parent, `${childrenProp}.tailId`, object.id)
  this._commandObjectPropUpdate(oldTail, 'nextId', object.id)
  this._commandObjectPropUpdate(object, 'prevId', oldTail.id)
}
let _linkedListInsertBefore = function (parent, target, insertObject, childrenProp = 'rects') {
  let prevId = target.prevId
  let prevObject = this.objects[prevId]
  let children = parent[childrenProp]

  if (prevId){
    this._commandObjectPropUpdate(insertObject, 'prevId', prevId)
    this._commandObjectPropUpdate(prevObject, 'nextId', insertObject.id)
  }
  else {
    this._commandObjectPropUpdate(parent, `${childrenProp}.headId`, insertObject.id)
    if (!children.tailId){
      this._commandObjectPropUpdate(parent, `${childrenProp}.tailId`, target.id)
    }
  }

  this._commandObjectPropUpdate(insertObject, 'nextId', target.id)
  this._commandObjectPropUpdate(target, 'prevId', insertObject.id)
}
let _linkedListInsertAfter = function (parent, target, insertObject, childrenProp = 'rects') {
  let nextId = target.nextId
  let nextObject = this.objects[nextId]

  if (nextId){
    this._commandObjectPropUpdate(insertObject, 'nextId', nextId)
    this._commandObjectPropUpdate(nextObject, 'prevId',  insertObject.id)
  }
  else {
    this._commandObjectPropUpdate(parent, `${childrenProp}.tailId`, insertObject.id)
  }

  this._commandObjectPropUpdate(insertObject, 'prevId', target.id)
  this._commandObjectPropUpdate(target, 'nextId', insertObject.id)
}
let _linkedListRemove = function (parent, object, childrenProp = 'rects') {
  let children = parent[childrenProp]
  let prevId = object.prevId
  let nextId = object.nextId
  this._commandObjectPropUpdate(object, 'nextId', '')
  this._commandObjectPropUpdate(object, 'prevId', '')

  if (prevId){
    let prevObject = this.objects[prevId]
    this._commandObjectPropUpdate(prevObject, 'nextId', nextId)
  }
  else {
    this._commandObjectPropUpdate(parent, `${childrenProp}.headId`, nextId)
  }

  if (nextId){
    let nextObject = this.objects[nextId]
    this._commandObjectPropUpdate(nextObject, 'prevId', prevId)
  }
  else {
    this._commandObjectPropUpdate(parent, `${childrenProp}.tailId`, prevId)
  }

  if (children.tailId === children.headId){
    this._commandObjectPropUpdate(parent, `${childrenProp}.tailId`, '')
  }
}
let _linkedListMoveUp = function (parent, target, childrenProp = 'rects') {
  let nextId = target.nextId
  // 如果已经是最顶了
  if (!nextId){
    return
  }
  let nextObject = this.objects[nextId]
  this._linkedListRemove(parent, target, childrenProp)
  this._linkedListInsertAfter(parent, nextObject, target, childrenProp)
}
let _linkedListMoveDown = function (parent, target, childrenProp = 'rects') {
  let prevId = target.prevId
  // 如果已经是最顶了
  if (!prevId){
    return
  }
  let prevObject = this.objects[prevId]
  this._linkedListRemove(parent, target, childrenProp)
  this._linkedListInsertBefore(parent, prevObject, target, childrenProp)
}
let _linkedListMoveTop = function (parent, target, childrenProp = 'rects') {
  let children = parent[childrenProp]
  let tailId = children.tailId
  if (!tailId || (tailId === target.id)){
    return
  }
  let tailObject = this.objects[tailId]
  this._linkedListRemove(parent, target, childrenProp)
  this._linkedListInsertAfter(parent, tailObject, target, childrenProp)
}
let _linkedListMoveBottom = function (parent, target, childrenProp = 'rects') {
  let children = parent[childrenProp]
  let headId = children.headId
  if (headId === target.id){
    return
  }
  let headObject = this.objects[headId]
  this._linkedListRemove(parent, target, childrenProp)
  this._linkedListInsertBefore(parent, headObject, target, childrenProp)
}
let _linkedListGetObjects = function (parent, childrenProp = 'rects') {
  let objects = []
  let index = 0
  let f = (_parent) => {
    let start = this.objects[_parent[childrenProp].headId]
    while (start){
      start.tempIndex = index ++
      objects.push(start)
      if (start[childrenProp]){
        f(start)
      }
      start = this.objects[start.nextId]
    }
  }
  f(parent)
  return objects
}
export default {
  methods: {
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
}