import color from '../../core/color'
let configContext = (context) => {
  context.strokeStyle = color.black
}
let n = 10000
let n2 = 16
let _renderTopRule = function () {
  let rule = this.topRule
  if (!rule) {
    this.topRule = rule = document.createElement('canvas')
    rule.className = 'proto-rule proto-rule-top'
    this.$refs.middle.appendChild(rule)
    rule.width = n
    rule.height = n2
  }
  let scale = this.scale
  let context = rule.getContext('2d')
  context.clearRect(0, 0, n, n2)
  configContext(context)
  context.beginPath()
  for (let i = 1; i < 2000; i ++){
    let isText = i % 10 === 0
    let left = i * 10
    let text = left
    left = left * scale
    let height = isText ? 10 : 4
    context.moveTo(left, 0)
    context.lineTo(left, height)
    if (isText){
      context.fillText(text, left + 2, 14)
    }
  }
  context.stroke()
}
let _renderLeftRule = function () {
  let rule = this.leftRule
  if (!rule) {
    this.leftRule = rule = document.createElement('canvas')
    rule.className = 'proto-rule proto-rule-left'
    this.$refs.middle.appendChild(rule)
    rule.width = n2
    rule.height = n
  }
  let scale = this.scale
  let context = rule.getContext('2d')
  context.clearRect(0, 0, n2, n)
  configContext(context)
  context.beginPath()
  for (let i = 1; i < 2000; i ++){
    let isText = i % 10 === 0
    let top = i * 10
    let text = top
    top *= scale
    let width = isText ? 10 : 4
    context.moveTo(0, top)
    context.lineTo(width, top)
    if (isText){
      context.save()
      context.textAlign = "center"
      context.textBaseline = "middle"
      context.translate(6, top - 14)
      context.rotate((-90 * Math.PI) / 180)
      context.fillText(text, 0, 4);
      context.restore()
    }
  }
  context.stroke()
}
let _renderRule = function () {
  _renderLeftRule.call(this)
  _renderTopRule.call(this)
}
export {
  _renderRule,
}
