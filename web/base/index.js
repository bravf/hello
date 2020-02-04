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
var walkTree = (o, onBefore = () => {}, onAfter = () => {}, checkExpand = true) => {
  var stop = false

  var go = (o, parent, z) => {
    // 当前深度
    z = z || 0
    // 儿子们计算完的结果集
    var childrenResult = []

    // 可以中断
    if (onBefore(o, parent, z) === false){
      stop = true
      return
    }

    var children = o.children
    var expand = !checkExpand || (checkExpand && (o['_e'] !== false))
    if (expand && children && children.length){
      for (var i = 0,l = children.length; i < l; i ++){
        if (stop) {
          break
        }
        childrenResult.push(go(o.children[i], o, z + 1))
      }
    }

    return onAfter(o, parent, childrenResult, z)
  }

  return go(o)
}
var _funcPerformanceHookCounter = -1
var _funcPerformanceHook = (func) => {
  var name = func.name
  var isHook = func.toString().indexOf('// performace log') !== -1

  return isHook ? function (...args) {
    _funcPerformanceHookCounter ++
    var space = new Array(_funcPerformanceHookCounter).fill('  ').join('')

    console.log(`${space}FPH: ${name} start`)
    var t0 = window.performance.now()
    var res = func.apply(this, args)
    var t1 = window.performance.now()
    console.log(`${space}FPH: ${name} end [${t1 - t0}]`)
    
    _funcPerformanceHookCounter --
    return res
  }
  :
  func
}
var funcPerformanceHook = (o) => {
  if (isFunction(o)){
    return _funcPerformanceHook(o)
  }
  else if (Array.isArray(o)) {
    for (var i = 0; i < o.length; i ++){
      o[i] = funcPerformanceHook(o[i])
    }
  }
  else if (isObject(o)){
    for (var j in o){
      o[j] = funcPerformanceHook(o[j])
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
  funcPerformanceHook,
  checkRectOverlap,
}