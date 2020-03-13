import Vue from 'vue'
import jsx from 'vue-jsx'
import Proto from './index.vue'
// import ViewUI from 'view-design'
// import 'view-design/dist/styles/iview.css'
// Vue.use(ViewUI, {
//   size: 'small',
// })
let app = new Vue({
  el: '#app',
  components: {
    Proto,
  },
  data () {
    return {
    }
  },
  render (h) {
    jsx.h = h
    var me = this

    return jsx.div({
      // style_margin: '10px',
    },
      jsx.create('Proto'),
    )
  }
})