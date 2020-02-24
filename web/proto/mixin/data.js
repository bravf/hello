import {
  getUuid,
  getGroupSize,
} from '../core/base'

export default {
  data () {
    return {
      rects: [],
      currRects: [],
      mouse: {
        ing: false,
        startLeft: 0,
        startTop: 0,
        currLeft: 0,
        currTop: 0,
        // move, resize, rotate, create
        eventType: '',
        resizerDir: '',
        createType: '',
      },
      // 辅助线
      guide: {
        line: {
          top: new Set(),
          left: new Set(),
        },
        show: {
          top: new Set(),
          left: new Set(),
        }
      },
    }
  },
  methods: {
    _warpRect (data, type) {
      let rectData = {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        angle: 0,
        color: 'black',
        zIndex: 0,
        ...data,
      }

      let rect = {
        id: getUuid(),
        parent: '',
        children: [],
        // 外部数据，主要包括 left,top,width,height,rotate
        data: rectData,
        // 临时数据，用来中间态计算
        tempData: null,
        // 内部数据，包括文本内容，颜色，边框等等
        innerData: {
          text: '',
          color: '#000',
          backgroundColor: '#fff',
        },
        // 类型
        type,
      }
      this.rects.push(rect)
      return rect
    },
    _createGroupRect (angle = 0) {
      let data = {
        color: 'red',
        angle,
      }
      return this._warpRect(data, 'group')
    },
    _createRect (left, top, width = 200, height = 100, angle = 0, color = 'black') {
      let data = {
        left,
        top,
        width,
        height,
        angle,
      }
      return this._warpRect(data, 'default')
    },
    // 绑定父子关系
    _bindParent (group, rects) {
      let groupZIndex = group.data.zIndex
      rects.forEach(rect => {
        rect.parent = group.id
        group.children.push(rect.id)
        rect.data.zIndex = groupZIndex + 1
      })
      let size = this._updateGroupSize(group)
      group.data = {...group.data, ...size}
    },
    _unBindParent (group) {
      group.children.forEach(id => {
        var rect = this._getRectById(id)
        rect.parent = ''
      })
      group.children = []
    },
    // 通过 id 从 rects 中找到 object
    _getRectById (id) {
      let rect = null
      this.rects.some(_rect => {
        if (_rect.id === id){
          rect = _rect
          return true
        }
      })
      return rect
    },
    // 更新 group size
    _updateGroupSize (group) {
      let rects = group.children.map(id => {
        return this._getRectById(id)
      })
      var size = getGroupSize(rects, group.data.angle)
      return size
    },
  }
}