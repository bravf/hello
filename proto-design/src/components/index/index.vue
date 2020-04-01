<script>
import globalDataMixin from '@/mixin/data'
import historyMixin from  '@/mixin/history'
import commandMixin from  '@/mixin/command'
import windowEventRegMixin from '@/mixin/window-event-reg'
import jsx from 'vue-jsx'
let { div } = jsx
export default {
  name: 'index',
  mixins: [
    globalDataMixin,
    historyMixin,
    commandMixin,
    windowEventRegMixin,
  ],
  methods: {
    _getAllProjects () {

    },
    _renderItem () {

    },
    _renderMain () {

    }
  },
  render (h) {
    jsx.h = h
    return div('hello, world')
  }
}
</script>