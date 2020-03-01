import jsx from 'vue-jsx'
let {div} = jsx
let _renderGuideShow = function () {
  return [
    ...Array.from(this.guide.show.top).map(top => {
      return div({
        'class_proto-guide': true,
        'class_proto-guide-top': true,
        style_top: top + 'px',
      })
    }),
    ...Array.from(this.guide.show.left).map(left => {
      return div({
        'class_proto-guide': true,
        'class_proto-guide-left': true,
        style_left: left + 'px',
      })
    }),
  ]
}
export {
  _renderGuideShow,
}