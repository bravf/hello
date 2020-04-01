<style lang="scss">
@import './index.scss';
</style>
<script>
import delayMixin from '@/mixin/delay'
import globalDataMixin from '@/mixin/data'
import historyMixin from  '@/mixin/history'
import commandMixin from  '@/mixin/command'
import lindedListMixin from '@/mixin/linked-list'
import windowEventRegMixin from '@/mixin/window-event-reg'
import resizeMixin from './mixin/resize'
import rotateMixin from './mixin/rotate'
import moveMixin from './mixin/move'
import renderMixin from './mixin/render'
import dataMixin from  './mixin/data'
import guideMixin from './mixin/guide'
import actionMixin from './mixin/action'
import windowEventMixin from './mixin/window-event'
import hotkeyMixin from './mixin/hotkey'
export default {
  name: 'design',
  mixins: [
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
    globalDataMixin,
  ],
  methods: {
    _ready () {
      let project = this._createProject()
      this.currProjectId = project.id
      
      let page = this._createPage()
      this.currPageId = page.id
      // ;(() => {
      //   Array(3).fill('').forEach( () => {
      //     this._createPage(this.currPageId)
      //     let page = this._createPage()
      //     Array(3).fill('').forEach( () => {
      //       let page2 = this._createPage(page.id)
      //       this._createPage(page2.id)
      //     })
      //   })
      // })()

      let a = this._createRect('rect')
      this._updateRectTempData(a)
      this._moveTo(a, 150, 100)
      
      let b = this._createRect('text')
      this._updateRectTempData(b)
      this._moveTo(b, 50, 400)

      let c = this._createRect('circle')
      this._updateRectTempData(c)
      this._moveTo(c, 300, 500)

      let d = this._createRect('circle')
      this._updateRectTempData(d)
      this._moveTo(d, 100, 500)

      // Array(300).fill('').forEach(a => {
      //   let x = this._createRect('text')
      //   let y = this._createRect('circle')
      //   let g = this._createRect('group')
      //   this._bindGroup(g, [x,y])
      // })

      let newGroup = this._createRect('group')
      this._bindGroup(newGroup, [a, c])
      this._historyPush()


      // a.data.left = 0
      // a.data.top = 120
      // let b = this._create('rect')
      // let c = this._create('rect')
      // b.data.left = 100
      // c.data.left = 200
      // c.data.top = 300
      // let g = this._create('group')
      // this._bindGroup(g, [b,c])
      // // let d = this._createRect('rect', {
      // //   left: 400,
      // //   top: 400,
      // //   width: 100,
      // //   height: 30,
      // //   angle: 30,
      // // })
      // let e = this._createRect('text', {
      //   left: 200,
      //   top: 10,
      //   angle: 0,
      // })
      // // let g = this._createRect('line', {
      // //   left: 100,
      // //   top: 50,
      // // })
      // let f = this._createGroup()
      // this._bindGroup(f, [a,b])
      // // this._updateCurrRect(e)
      // this._focusRect(c)
    },
  },
  created () {
    this._ready()
  },
  render (h) {
    return this._renderMain(h)
  }
}
</script>