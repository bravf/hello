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
    span.style.top = '-1000px'
    document.body.appendChild(span)
  }
  span.innerHTML = text
  return parseFloat(window.getComputedStyle(span).width)
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

export {
  sum,
  empty,
  getTextWidth,
  walkTree,
}