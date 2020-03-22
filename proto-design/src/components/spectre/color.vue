<style lang="scss">
.sp-color{
  width: 18px!important;
  height: 18px!important;
  border: 1px solid #bcc3ce;
  position: relative;
  cursor: pointer;
}
.sp-color-alert{
  position: absolute;
  top: 0;
  left: 0;
}
</style>
<script>
import Vue from 'vue'
import jsx from 'vue-jsx'
import {Sketch} from 'vue-color'
import windowEventRegMixin from '@/mixin/window-event-reg'
let {
  div,
  a,
} = jsx
let SpColorAlert = {
  components: {
    'sketch-picker': Sketch,
  },
  mixins: [
    windowEventRegMixin,
  ],
  data () {
    return {
      value: '#ffffff',
      isOpen: false,
      left: 0,
      top: 0,
      onChange: () => {},
    }
  },
  methods: {
    open (value, size, onChange) {
      this.value = value
      this.onChange = onChange
      this.left = size.left
      this.top = size.top
      this.isOpen = true
    },
    close () {
      this.isOpen = false
    },
  },
  created () {
    this.windowEventAdd('click', () => {
      this.isOpen = false
    })
  },
  render (h) {
    jsx.h = h
    let me = this
    let jsxProps = {
      'class_sp-color-alert': true,
      'class_card': true,
      style_left: (this.left - 260) + 'px',
      style_top: this.top + 'px',
      'on_click' (e) {
        e.stopPropagation()
      },
      'on_mousedown' (e) {
        e.stopPropagation()
      }
    }
    if (!this.isOpen){
      jsxProps = {
        ...jsxProps,
        style_display: 'none',
      }
    }
    let alert = div(jsxProps,
      div('.card-header',
        a('.btn btn-clear float-right', {
          'attrs_aria-label':'Close',
          on_click (e) {
            me.close()
            e.stopPropagation()
          }
        }),
        div('.card-title', '颜色设置'),
      ),
      div({
        'class_card-body': true,
      },
        jsx.bind('sketch-picker')({
          props_value: this.value,
          on_input (value) {
            me.onChange(value)
          }
        })
      ),
    )
    return alert
  }
}
let globalColor
let openGlobalColor = (value, size, onChange) => {
  if (!globalColor){
    let Ctor = Vue.extend(SpColorAlert)
    globalColor = new Ctor
    globalColor.$mount(document.createElement('div'))
    document.body.appendChild(globalColor.$el)
  }
  globalColor.open(value, size, onChange)
}
let SpColor = {
  name: 'SpColor',
  props: {
    value: String,
  },
  render (h) {
    jsx.h = h
    let me = this
    return div({
      'class_sp-color': true,
      'style_background-color': this.value,
      'on_click' (e) {
        e.stopPropagation()        
        let rect = me.$el.getClientRects()[0]
        openGlobalColor(
          me.value, 
          {left: rect.x, top: rect.y},
          (color) => {
            me.$emit('change', color)
          }
        )
      }
    })
  }
}
export default SpColor
</script>