import {
  v4 as uuidv4,
} from  'uuid'

let empty = () => {}
let sum = (sum, n) => {return sum + n}
let bodyFont = window.getComputedStyle(document.body).font
let getTextWidth = (text, font = bodyFont) => {
  let span = getTextWidth.span
  if (!span) {
    span = getTextWidth.span = document.createElement('span')
    span.style.display = 'inline-block'
    span.style.position = 'absolute'
    span.style.top = '-10000px'
    document.body.appendChild(span)
  }
  span.style.font = font
  span.innerHTML = text
  return Math.ceil(praseFloat(window.getComputedStyle(span).width))
}
let getTextSize = (text, font = bodyFont) => {
  let span = getTextWidth.span
  if (!span) {
    span = getTextWidth.span = document.createElement('div')
    span.style.display = 'inline-block'
    let div = document.createElement('div')
    div.style.display = 'block'
    div.style.position = 'absolute'
    div.style.top = '-10000px'
    div.style.left = '200px'
    div.style.width = '100000px'
    div.appendChild(span)
    document.body.appendChild(div)
  }
  span.style.font = font
  span.innerHTML = text
  let style = window.getComputedStyle(span)
  return {
    width: Math.ceil(parseFloat(style.width)),
    height: Math.ceil(parseFloat(style.height)),
  }
}
let getType = (o) => {
  return Object.prototype.toString.call(o).slice(8, -1)
}
let isObject = (o) => {
  return getType(o) === 'Object'
}
let isFunction = (o) => {
  return getType(o) === 'Function'
}
let walkTree = (o, onBefore = () => {}, onAfter = () => {}, checkFolder = true, walkz = -1) => {
  let stop = false

  let go = (o, parent, x, z) => {
    // 当前所在 children 位置
    x = x || 0
    // 当前深度
    z = z || 0

    // 判断 walk 层级
    if (walkz !== -1 && walkz < z){
      return
    }

    // 儿子们计算完的结果集
    let childrenResult = []

    // 可以中断
    if (onBefore(o, parent, x, z) === false){
      stop = true
      return
    }

    let children = o.children
    let folder = !checkFolder || (checkFolder && (o['_f'] !== false))
    if (folder && children && children.length){
      for (let i = 0,l = children.length; i < l; i ++){
        if (stop) {
          break
        }
        childrenResult.push(go(o.children[i], o, i, z + 1))
      }
    }

    return onAfter(o, parent, childrenResult, x, z)
  }

  return go(o)
}
let _performanceHookCounter = -1
let _performanceHook = (func) => {
  let name = func.name
  // let isHook = func.toString().indexOf('// performace log') !== -1

  return function (...args) {
    _performanceHookCounter ++
    let space = new Array(_performanceHookCounter).fill('  ').join('')

    console.log(`${space}FPH: ${name} start`)
    let t0 = window.performance.now()
    let res = func.apply(this, args)
    let t1 = window.performance.now()
    console.log(`${space}FPH: ${name} end [${t1 - t0}]`)
    
    _performanceHookCounter --
    return res
  }
}
let performanceHook = (o, whiteList = []) => {
  if (isFunction(o)){
    return whiteList.includes(o.name) ? _performanceHook(o) : o
  }
  else if (Array.isArray(o)) {
    for (let i = 0; i < o.length; i ++){
      o[i] = performanceHook(o[i], whiteList)
    }
  }
  else if (isObject(o)){
    for (let j in o){
      o[j] = performanceHook(o[j], whiteList)
    }
  }

  return o
}
let checkRectOverlap = (r1, r2) => {
  // 两个矩形是否重叠
  // 求两个矩形外包围的长宽
  let width = Math.abs(Math.max(r1.right, r2.right) - Math.min(r1.left, r2.left))
  let height = Math.abs(Math.max(r1.bottom, r2.bottom) - Math.min(r1.top, r2.top))

  // 两个矩形长宽的和
  let rectMaxWidth = r1.width + r2.width
  let rectMaxHeight = r1.height + r2.height

  // 如果相交，必须满足外包围的长短必须同时小于两个矩形长宽的和
  return (width < rectMaxWidth) && (height < rectMaxHeight)
}
let treeParentManager = (data) => {
  let nodes = []
  let parents = []

  let get = (node) => {
    let i = nodes.indexOf(node)
    if (i === -1){
      _reset()
      return get(node)
    }
    else {
      return parents[i]
    }
  }
  let add = (node, parent) => {
    nodes.push(node)
    parents.push(parent)
  }
  let remove = (node) => {
    let i = nodes.indexOf(node)
    if (i !== -1){
      nodes.splice(i, 1)
      parents.splice(i, 1)
    }
  }
  let update = (node, parent) => {
    let i = nodes.indexOf(node)
    if (i !== -1){
      parents[i] = parent
    }
    else {
      add(node, parent)
    }
  }
  let _reset = () => {
    walkTree(data, (node, parent) => {
      add(node, parent)
    }, empty, false)
  }

  return {
    add,
    remove,
    update,
    get,
  }
}
let tNumber = (n, x = 0) => {
  let y = Math.pow(10, x)
  return Math.round(n * y) / y
}
let getRadian = (angle) => {
  return angle * (Math.PI / 180)
}
// getRadian 的反向操作
let getAngle = (radian) => {
  return radian / Math.PI * 180
}
// 参考：https://blog.csdn.net/sinat_33425327/article/details/78333946
// center: 旋转中心点
// point: 一个点
// angle: 角度
// type：顺时针 or 逆时针，true or false
let getRotatePointByCenter = (center, point, angle, type = true) => {
  angle = parseInt(angle)
  
  // 弧度
  if (!type){
    angle = 360 - angle
  }
  let radian = getRadian(angle)

  let px_0 = point.left - center.left
  let py_0 = center.top - point.top

  let px_1 = Math.cos(radian) * px_0 + Math.sin(radian) * py_0
  let py_1 = Math.cos(radian) * py_0 - Math.sin(radian) * px_0

  return {
    left: tNumber(px_1 + center.left),
    top: tNumber(center.top - py_1),
  }
}
// 已知a,b两点，以及穿过a的线al的角度为angle
// 那么假设一条穿过b的线bl与al垂直相交，交点为c，求c的坐标
let getCByABAndAngle = (a, b, angle) => {
  if (angle % 180 === 0){
    return {
      left: a.left,
      top: b.top,
    }
  }
  let radian = getRadian(angle)
  let radian2 = getRadian(90 - angle)
  let apx = a.left + Math.tan(radian) * a.top
  let bpx = b.left - Math.tan(radian2) * b.top
  let cx = bpx + Math.cos(radian) * Math.cos(radian) * (apx - bpx)
  let cy = Math.sin(radian) * Math.cos(radian) * (apx - bpx)
  return {
    left: tNumber(cx),
    top: tNumber(cy),
  }
}
// 一个点 point 和一个角度 angle
// 求以角度 angle 通过此点的线 L 在 x 轴的映射值
// 以及垂直于 L 并通过此点的线在 y 轴的映射值
let getMappingPoint = (point, angle) => {
  let radian = getRadian(angle)
  return {
    xp: point.left + Math.tan(radian) * point.top,
    yp: point.top - Math.tan(radian) * point.left,
  }
}
// 已知若干个点和一个角度 angle
// 求通过每个点的角度为 angle 的线 L 在 x 轴是最小映射值的点 a，以及最大值 a2
// 以及通过每个点的与 L 垂直相交的线在 y 轴是最小映射值的点 b，以及最大值 b2
let getABByPointsAndAngle = (points, angle) => {
  let a, b, a2, b2
  let x = Number.MAX_VALUE
  let y = x
  let x2 = -x
  let y2 = -y

  points.forEach(p => {
    let {xp, yp} = getMappingPoint(p, angle)

    if (xp < x){
      x = xp
      a = p
    }

    if (xp >= x2){
      x2 = xp
      a2 = p
    }

    if (yp < y){
      y = yp
      b = p
    }

    if (yp >= y2){
      y2 = yp
      b2 = p
    }
  })

  return {a, b, a2, b2}
}
// 已知两个点，求经过此两点的线的 rotate 角度
// 方向是先经过 a 点，后经过 b 点
let getAngleByTwoPoints = (a, b) => {
  let diffa = Math.abs(tNumber(a.left) - tNumber(b.left))
  let diffb = Math.abs(tNumber(b.top) - tNumber(a.top))

  let angle = getAngle(
    Math.atan(diffa / diffb)
  )

  let aleft = a.left
  let atop = a.top
  let bleft = b.left
  let btop = b.top

  if ( (aleft > bleft) && (atop <= btop) ){
  }
  else if ( (aleft >= bleft) && (atop > btop) ){
    angle = 180 - angle
  }
  else if ( (aleft < bleft) && (atop >= btop) ){
    angle += 180
  }
  else {
    angle = 360 - angle
  }

  return angle % 360
}
let getEffectiveAngle = (angle) => {
  return angle % 360
}
let deepClone = (o) => {
  return JSON.parse(JSON.stringify(o))
}
let getUuid = () => {
  return uuidv4()
}
let arrayRemove = (array, o, f = a => a) => {
  for (let i = 0; i < array.length; i ++){
    if (f(array[i]) === o){
      array.splice(i, 1)
      return i
    }
  }
  return -1
}
let selectText = (element) => {
  let selection = window.getSelection()
  let range = document.createRange()
  range.selectNodeContents(element)
  selection.removeAllRanges()
  selection.addRange(range)
}
export {
  sum,
  empty,
  getTextWidth,
  getTextSize,
  walkTree,
  performanceHook,
  checkRectOverlap,
  treeParentManager,
  getRotatePointByCenter,
  getCByABAndAngle,
  getABByPointsAndAngle,
  getAngle,
  tNumber,
  getAngleByTwoPoints,
  getEffectiveAngle,
  getRadian,
  deepClone,
  getUuid,
  arrayRemove,
  selectText,
}