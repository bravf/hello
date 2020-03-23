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
import {
  _renderContextMenu
} from './render/contextmenu'
import vars from '@/core/design-vars'
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
    _renderContextMenu,
    _renderMain (h) {
      jsx.h = h
      let me = this
      return div({
        class_proto: true,
      },
        this._renderContextMenu(),
        div({
          'class_proto-top': true,
          'style_height': vars.a + 'px',
          on_mousedown (e) {
            e.stopPropagation()
          }
        },
          this._renderTools()
        ),
        div({
          'class_proto-left': true,
          'style_top': vars.a + 'px',
          'style_width': vars.b + 'px',
          'style_height': `calc(100% - ${vars.a}px)`,
        },
          div({
            'class_proto-height-half': true,
          },
            this._renderRectNav(),
          ),
        ),
        div({
          'class_proto-middle': true,
          'style_top': vars.a + vars.c + 'px',
          'style_left': vars.b + vars.c + 'px',
          'style_right': vars.d + 'px',
          'style_height': `calc(100% - ${vars.a}px - ${vars.c}px)`,
          ref: 'middle',
          on_mousedown () {
            me._blurRect()
          }
        },
          this._renderRects(),
          this._renderGuideShow(),
          this._renderHandler(),
        ),
        div({
          'class_proto-right': true,
          'style_top': vars.a + 'px',
          'style_width': vars.d + 'px',
          'style_height': `calc(100% - ${vars.a}px)`,
        },
          div({
            'class_proto-height-half': true,
          },
            this._renderSetting(h),
          ),
          div({
            'class_proto-height-half': true,
          },
            this._renderRectList(),
          )
        ),
      )
    },
  },
  mounted () {
    this._renderRule()
  },
}