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
  _renderRects,
  _renderRect,
  _renderRectInner,
} from './render/rect'
let {div, span,  input} = jsx
export default {
  methods: {
    _renderSetting,
    _renderHandler,
    _renderGuideShow,
    _renderTools,
    _renderRects,
    _renderRect,
    _renderRectInner,
    // 左侧 tag
    _renderRectTags () {
      let me = this
      let retTags = ['rect', 'circle', 'text', 'line'].map(type => {
        return span({
          'class_proto-button': true,
          on_mousedown () {
            me.mouse.eventType = 'create'
            me.mouse.createType = type
            me.mouse.ing = true
          },
        },type)
      })
      return div({
        'class_proto-tags': true,
      },
      ...retTags,
      )
    },
    _renderMain (h) {
      jsx.h = h
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
          this._renderRectTags()
        ),
        div({'class_proto-middle': true},
          this._renderRects(),
          this._renderGuideShow(),
          this._renderHandler(),
        ),
        div({
          'class_proto-right': true,
          on_mousedown (e) {
            e.stopPropagation()
          }
        },
          this._renderSetting(),
        ),
      )
    },
  }
}