<style lang="scss">
@import './index.scss';
</style>
<script>
import delayMixin from './mixin/delay'
import historyMixin from  './mixin/history'
import commandMixin from  './mixin/command'
import lindedListMixin from './mixin/linked-list'
import windowEventRegMixin from './mixin/window-event-reg'
import dbMixin from './mixin/db'
import resizeMixin from './mixin/resize'
import rotateMixin from './mixin/rotate'
import moveMixin from './mixin/move'
import renderMixin from './mixin/render'
import dataMixin from  './mixin/data'
import guideMixin from './mixin/guide'
import actionMixin from './mixin/action'
import windowEventMixin from './mixin/window-event'
import hotkeyMixin from './mixin/hotkey'
import pageHookMixin from './mixin/pageHook'
export default {
  name: 'design',
  mixins: [
    dbMixin,
    resizeMixin,
    rotateMixin,
    moveMixin,
    renderMixin,
    dataMixin,
    guideMixin,
    historyMixin,
    commandMixin,
    actionMixin,
    lindedListMixin,
    windowEventRegMixin,
    windowEventMixin,
    hotkeyMixin,
    delayMixin,
    pageHookMixin,
  ],
  methods: {
  },
  render (h) {
    this.renderHook
    return this._renderMain(h)
  }
}
</script>