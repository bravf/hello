<script>
import dataMixin from  '@/mixin/data'
import historyMixin from  '@/mixin/history'
import commandMixin from  '@/mixin/command'
import dbMixin from '@/mixin/db'
import lindedListMixin from '@/mixin/linked-list'
import index from './index'
export default {
  mixins: [
    dataMixin,
    historyMixin,
    commandMixin,
    dbMixin,
    lindedListMixin,
  ],
  components: {
    index,
  },
  render (h) {
    return this.currPageId ?
      h('index') :
      h('div', ['loading'])
  }
}
</script>