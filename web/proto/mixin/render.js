import jsx from 'vue-jsx'
import {
  _renderSetting
} from './render/setting'
import {
  _renderHandler
} from './render/handler'
import {
  _renderGuideShow
} from './render/guide-show'
import {
  _renderTools
} from './render/tools'
import {
  _renderRectNav
} from './render/rect-nav'
import {
  _renderRects,
  _renderRect,
  _renderRectInner,
} from './render/rect'
import {
  _renderRule,
} from './render/rule'
import {
  _renderRectList,
} from './render/rect-list'
let {div} = jsx
export default {
  data () {
    return {
      topRule: null,
      leftRule: null,
    }
  },
  methods: {
    _renderSetting,
    _renderHandler,
    _renderGuideShow,
    _renderTools,
    _renderRects,
    _renderRect,
    _renderRectInner,
    _renderRectNav,
    _renderRule,
    _renderRectList,
    _renderMain (h) {
      jsx.h = h
      let me = this
      return div({
        class_proto: true,
      },
        div({
          'class_proto-top': true,
          on_mousedown (e) {
            e.stopPropagation()
          }
        },
          this._renderTools()
        ),
        div({'class_proto-left': true},
          this._renderRectNav(),
          this._renderRectList(),
        ),
        div({
          'class_proto-middle': true,
          ref: 'middle',
        },
          this._renderRects(),
          this._renderGuideShow(),
          this._renderHandler(),
        ),
        div({
          'class_proto-right': true,
          on_mousedown (e) {
            if (me.currRectId){
              me.objects[me.currRectId].data.isEdit = false
            }
            e.stopPropagation()
          }
        },
          this._renderSetting(h),
        ),
      )
    },
  },
  mounted () {
    this._renderRule()
  },
}