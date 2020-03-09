import color from '../../core/color'
let configContext = (context) => {
  context.strokeStyle = color.black
  context.font = '20px SourceHanSansSC'
}
let n = 10000
let n2 = 16 * 2
let getMiddleData = function () {
  let $middle = this.$refs.middle
  let style = window.getComputedStyle($middle)
  return {
    dom: $middle,
    scrollTop: $middle.scrollTop,
    scrollLeft: $middle.scrollLeft,
    width: parseInt(style.width),
    height: parseInt(style.height),
  }
}
let _renderTopRule = function () {
  let rule = this.topRule
  let middleData = getMiddleData.call(this)
  if (!rule) {
    this.topRule = rule = document.createElement('canvas')
    rule.className = 'proto-rule proto-rule-top'
    middleData.dom.appendChild(rule)
    // rule.addEventListener('mousedown', () => {
    //   console.log(1)
    // })
  }
  rule.width = middleData.width * 2
  rule.height = n2
  rule.style.width = middleData.width + 'px'
  rule.style.height = n2 / 2 + 'px'

  // canvas 画布放大 2倍，然后 css 缩小，来适配高分屏
  let scale = this.scale * 2
  let context = rule.getContext('2d')
  context.clearRect(0, 0, n, n2)
  configContext(context)
  context.beginPath()
  let scrollLeft = middleData.scrollLeft
  for (let i = 10; i < n; i += 10){
    let isText = i % 100 === 0
    let left = i * scale - scrollLeft * 2
    let text = i
    let height = (isText ? 10 : 2) * 2
    context.moveTo(left, 0)
    context.lineTo(left, height)
    if (isText){
      context.fillText(text, left + 2, 10 * 2)
    }
  }
  context.stroke()
}
let _renderLeftRule = function () {
  let middleData = getMiddleData.call(this)
  let rule = this.leftRule
  if (!rule) {
    this.leftRule = rule = document.createElement('canvas')
    rule.className = 'proto-rule proto-rule-left'
    this.$refs.middle.appendChild(rule)
  }
  
  rule.width = n2
  rule.height = middleData.height * 2
  rule.style.width = n2 / 2 + 'px'  
  rule.style.height = middleData.height + 'px'

  let scale = this.scale * 2
  let context = rule.getContext('2d')
  context.clearRect(0, 0, n2, n)
  configContext(context)
  context.beginPath()
  let scrollTop = middleData.scrollTop
  for (let i = 10; i < n; i += 10){
    let isText = i % 100 === 0
    let top = i * scale - scrollTop * 2
    let text = i
    let width = (isText ? 10 : 2) * 2
    context.moveTo(0, top)
    context.lineTo(width, top)
    if (isText){
      context.save()
      context.textAlign = "center"
      context.textBaseline = "middle"
      context.translate(12, top - 20)
      context.rotate((-90 * Math.PI) / 180)
      context.fillText(text, 0, 0);
      context.restore()
    }
  }
  context.stroke()
}
let _renderRule = function () {
  _renderTopRule.call(this)
  _renderLeftRule.call(this)
}
export {
  _renderRule,
}
