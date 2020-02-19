var empty = () => {}
var sum = (sum, n) => {return sum + n}
var bodyFont = window.getComputedStyle(document.body).font
var getTextWidth = (text, font = bodyFont) => {
  var span = getTextWidth.span
  if (!span) {
    span = getTextWidth.span = document.createElement('span')
    span.style.font = font
    span.style.display = 'inline-block'
    span.style.position = 'absolute'
    span.style.top = '-10000px'
    document.body.appendChild(span)
  }
  span.innerHTML = text
  return parseFloat(window.getComputedStyle(span).width)
}
var getType = (o) => {
  return Object.prototype.toString.call(o).slice(8, -1)
}
var isObject = (o) => {
  return getType(o) === 'Object'
}
var isFunction = (o) => {
  return getType(o) === 'Function'
}
var walkTree = (o, onBefore = () => {}, onAfter = () => {}, checkFolder = true, walkz = -1) => {
  var stop = false

  var go = (o, parent, x, z) => {
    // 当前所在 children 位置
    x = x || 0
    // 当前深度
    z = z || 0

    // 判断 walk 层级
    if (walkz !== -1 && walkz < z){
      return
    }

    // 儿子们计算完的结果集
    var childrenResult = []

    // 可以中断
    if (onBefore(o, parent, x, z) === false){
      stop = true
      return
    }

    var children = o.children
    var folder = !checkFolder || (checkFolder && (o['_f'] !== false))
    if (folder && children && children.length){
      for (var i = 0,l = children.length; i < l; i ++){
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
var _performanceHookCounter = -1
var _performanceHook = (func) => {
  var name = func.name
  // var isHook = func.toString().indexOf('// performace log') !== -1

  return function (...args) {
    _performanceHookCounter ++
    var space = new Array(_performanceHookCounter).fill('  ').join('')

    console.log(`${space}FPH: ${name} start`)
    var t0 = window.performance.now()
    var res = func.apply(this, args)
    var t1 = window.performance.now()
    console.log(`${space}FPH: ${name} end [${t1 - t0}]`)
    
    _performanceHookCounter --
    return res
  }
}
var performanceHook = (o, whiteList = []) => {
  if (isFunction(o)){
    return whiteList.includes(o.name) ? _performanceHook(o) : o
  }
  else if (Array.isArray(o)) {
    for (var i = 0; i < o.length; i ++){
      o[i] = performanceHook(o[i], whiteList)
    }
  }
  else if (isObject(o)){
    for (var j in o){
      o[j] = performanceHook(o[j], whiteList)
    }
  }

  return o
}
var checkRectOverlap = (r1, r2) => {
  // 两个矩形是否重叠
  // 求两个矩形外包围的长宽
  var width = Math.abs(Math.max(r1.right, r2.right) - Math.min(r1.left, r2.left))
  var height = Math.abs(Math.max(r1.bottom, r2.bottom) - Math.min(r1.top, r2.top))

  // 两个矩形长宽的和
  var rectMaxWidth = r1.width + r2.width
  var rectMaxHeight = r1.height + r2.height

  // 如果相交，必须满足外包围的长短必须同时小于两个矩形长宽的和
  return (width < rectMaxWidth) && (height < rectMaxHeight)
}
var treeParentManager = (data) => {
  var nodes = []
  var parents = []

  var get = (node) => {
    var i = nodes.indexOf(node)
    if (i === -1){
      _reset()
      return get(node)
    }
    else {
      return parents[i]
    }
  }
  var add = (node, parent) => {
    nodes.push(node)
    parents.push(parent)
  }
  var remove = (node) => {
    var i = nodes.indexOf(node)
    if (i !== -1){
      nodes.splice(i, 1)
      parents.splice(i, 1)
    }
  }
  var update = (node, parent) => {
    var i = nodes.indexOf(node)
    if (i !== -1){
      parents[i] = parent
    }
    else {
      add(node, parent)
    }
  }
  var _reset = () => {
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
var tNumber = (n, x = 2) => {
  var y = Math.pow(10, x)
  return Math.round(n * y) / y
}
var getRadian = (angle) => {
  return angle * (Math.PI / 180)
}
// getRadian 的反向操作
var getAngle = (radian) => {
  return radian / Math.PI * 180
}
// 参考：https://blog.csdn.net/sinat_33425327/article/details/78333946
// center: 旋转中心点
// point: 一个点
// angle: 角度
// type：顺时针 or 逆时针，true or false
var getRotatePointByCenter = (center, point, angle, type = true) => {
  angle = parseInt(angle)
  
  // 弧度
  if (!type){
    angle = 360 - angle
  }
  var radian = getRadian(angle)

  var px_0 = point.left - center.left
  var py_0 = center.top - point.top

  var px_1 = Math.cos(radian) * px_0 + Math.sin(radian) * py_0
  var py_1 = Math.cos(radian) * py_0 - Math.sin(radian) * px_0

  return {
    left: px_1 + center.left,
    top: center.top - py_1,
  }
}
// 已知a,b两点，以及穿过a的线al的角度为angle
// 那么假设一条穿过b的线bl与al垂直相交，交点为c，求c的坐标
var getCByABAndAngle = (a, b, angle) => {
  if (angle % 180 === 0){
    return {
      left: a.left,
      top: b.top,
    }
  }
  var radian = getRadian(angle)
  var radian2 = getRadian(90 - angle)
  var apx = a.left + Math.tan(radian) * a.top
  var bpx = b.left - Math.tan(radian2) * b.top
  var cx = bpx + Math.cos(radian) * Math.cos(radian) * (apx - bpx)
  var cy = Math.sin(radian) * Math.cos(radian) * (apx - bpx)
  return {
    left: cx,
    top: cy,
  }
}
// 已知若干个点和一个角度 angle
// 求通过每个点的角度为angle的线在x轴是最小映射值的点a，以及最大值a2
// 以及通过每个点的角度为-(90-angle)的线在y轴是最小映射值的点b，以及最大值b2
var getABByPointsAndAngle = (points, angle) => {
  var radian = getRadian(angle)
  var a, b, a2, b2
  var x = Number.MAX_VALUE
  var y = x
  var x2 = -x
  var y2 = -y

  points.forEach(p => {
    var xp = p.left + Math.tan(radian) * p.top
    var yp = p.top - Math.tan(radian) * p.left

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
var getAngleByTwoPoints = (a, b) => {
  var diffa = Math.abs(tNumber(a.left) - tNumber(b.left))
  var diffb = Math.abs(tNumber(b.top) - tNumber(a.top))

  var angle = getAngle(
    Math.atan(diffa / diffb)
  )

  var aleft = a.left
  var atop = a.top
  var bleft = b.left
  var btop = b.top

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
var getEffectiveAngle = (angle) => {
  return angle % 360
}
var deepClone = (o) => {
  return JSON.parse(JSON.stringify(o))
}
export {
  sum,
  empty,
  getTextWidth,
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
}