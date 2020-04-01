let globalData = {
  objects: {},
  currProjectId: '',
}
export default {
  data () {
    return globalData
  },
  methods: {
    _parseLongProp (
      prop, 
      data = this.$data
    ) {
      let me = this
      let props = prop.split('.')
      let object = data
      let lastProp = props.slice(-1)[0]
      props.slice(0, -1).forEach(p => {
        object = object[p]
      })
      return {
        get () {
          return object[lastProp]
        },
        set (value) {
          let isNull = (value === null) || (value === undefined) 
          if (isNull){
            delete object[lastProp]
          }
          else {
            me.$set(object, lastProp, value)
          }
        }
      }
    },
    _safeObject (rect) {
      if (typeof rect === 'string') {
        rect = this.objects[rect]
      }
      return rect
    },
  },
}