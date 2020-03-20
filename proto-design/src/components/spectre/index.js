import SpColor from './color'
let components = [
  SpColor,
]
let install = (Vue) => {
  components.forEach(com => {
    Vue.component(com.name, com)
  })
}
export default {
  install,
}
