let elements = {
  'div': {
  },
  'text': {
    props: {
      value: {
        type: String,
        default: '文本',
      }
    }
  }
}
for (let type in elements) {
  elements[type]['native'] = true
}

export default elements