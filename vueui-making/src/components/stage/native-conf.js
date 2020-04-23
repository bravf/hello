let elements = {
  'div': {
    visiabled: false,
  },
  'text': {
    text: {
      type: String,
    },
  }
}
for (let type in elements) {
  elements[type]['native'] = true
}

export default elements