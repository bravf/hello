let _linkedListAppend = function (parentId, object) {
  let parent = this.objects[parentId]
  if (!parent.headId){
    // parent.headId = object.id
    this._commandObjectPropUpdate(parent, 'headId', object.id)
    return
  }
  if (!parent.tailId){
    // parent.tailId = object.id
    this._commandObjectPropUpdate(parent, 'tailId', object.id)
    let head = this.objects[parent.headId]
    let tail = this.objects[parent.tailId]
    // head.nextId = tail.id
    this._commandObjectPropUpdate(head, 'nextId', tail.id)
    // tail.prevId = head.id
    this._commandObjectPropUpdate(tail, 'prevId', head.id)
    return
  }
  let oldTail = this.objects[parent.tailId]
  // parent.tailId = object.id
  this._commandObjectPropUpdate(parent, 'tailId', object.id)
  // oldTail.nextId = object.id
  this._commandObjectPropUpdate(oldTail, 'nextId', object.id)
  // object.prevId = oldTail.id
  this._commandObjectPropUpdate(object, 'prevId', oldTail.id)
}
let _linkedListInsertBefore = function (parentId, target, insertObject) {
  let parent = this.objects[parentId]
  let prevId = target.prevId
  let prevObject = this.objects[prevId]

  if (prevId){
    // insertObject.prevId = prevId
    this._commandObjectPropUpdate(insertObject, 'prevId', prevId)
    // prevObject.nextId = insertObject.id
    this._commandObjectPropUpdate(prevObject, 'nextId', insertObject.id)
  }
  else {
    // parent.headId = insertObject.id
    this._commandObjectPropUpdate(parent, 'headId', insertObject.id)
  }

  // insertObject.nextId = target.id
  this._commandObjectPropUpdate(insertObject, 'nextId', target.id)
  // target.prevId = insertObject.id
  this._commandObjectPropUpdate(target, 'prevId', insertObject.id)

}
let _linkedListInsertAfter = function (parentId, target, insertObject) {
  let parent = this.objects[parentId]
  let nextId = target.nextId
  let nextObject = this.objects[nextId]

  if (nextId){
    // insertObject.nextId = nextId
    this._commandObjectPropUpdate(insertObject, 'nextId', nextId)
    // nextObject.prevId = insertObject.id
    this._commandObjectPropUpdate(nextObject, 'prevId',  insertObject.id)
  }
  else {
    // parent.tailId = insertObject.id
    this._commandObjectPropUpdate(parent, 'tailId', insertObject.id)
  }

  // insertObject.prevId = target.id
  this._commandObjectPropUpdate(insertObject, 'prevId', target.id)
  // target.nextId = insertObject.id
  this._commandObjectPropUpdate(target, 'nextId', insertObject.id)
}
let _linkedListRemove = function (parentId, object) {
  let parent = this.objects[parentId]
  let prevId = object.prevId
  let nextId = object.nextId

  // object.nextId = ''
  this._commandObjectPropUpdate(object, 'nextId', '')
  // object.prevId = ''
  this._commandObjectPropUpdate(object, 'prevId', '')

  if (prevId){
    let prevObject = this.objects[prevId]
    // prevObject.nextId = nextId
    this._commandObjectPropUpdate(prevObject, 'nextId', nextId)
  }
  else {
    // parent.headId = nextId
    this._commandObjectPropUpdate(parent, 'headId', nextId)
  }

  if (nextId){
    let nextObject = this.objects[nextId]
    // nextObject.prevId = prevId
    this._commandObjectPropUpdate(nextObject, 'prevId', prevId)
  }
  else {
    // parent.tailId = prevId
    this._commandObjectPropUpdate(parent, 'tailId', prevId)
  }

  if (parent.tailId === parent.headId){
    // parent.tailId = ''
    this._commandObjectPropUpdate(parent, 'tailId', '')
  }
}
let _linkedListGetObjects = function (parentId) {
  let objects = []
  let parent = this.objects[parentId]
  let start = this.objects[parent.headId]
  let index = 0
  while (start){
    start.tempIndex = index ++
    objects.push(start)
    start = this.objects[start.nextId]
  }
  return objects
}
export {
  _linkedListInsertBefore,
  _linkedListInsertAfter,
  _linkedListRemove,
  _linkedListAppend,
  _linkedListGetObjects,
}