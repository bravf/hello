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

export {
  sum,
  empty,
  getTextWidth,
  walkTree,
  performanceHook,
  checkRectOverlap,
}