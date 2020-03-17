import jsx from 'vue-jsx'
let iview = {}
let names = [
  'iButton', 
  'ButtonGroup', 
  'Card', 
  'iInput', 
  'ColorPicker',
  'iSelect',
  'iOption',
  'checkbox',
  'tag',
  'iForm',
  'row',
  'iCol',
]
names.forEach(name => {
  let bindName = name.slice(0,1).toLowerCase() + name.slice(1).replace(/([A-Z])/g, (a) => '-' + a.toLowerCase())
  iview[name] = jsx.bind(bindName)
})

export default iview