import Vue from 'vue'
import jsx from 'vue-jsx'
import Proto from './index.vue'
import {
  walkTree, 
  empty,
} from '../base/index'

var app = new Vue({
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