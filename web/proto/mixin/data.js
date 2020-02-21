import {
  getUuid,
  getGroupSize,
} from '../core/base'

export default {
  data () {
    return {
      rects: [],
      mouse: {
        ing: false,
        startLeft: 0,
        startTop: 0,
        currLeft: 0,
        currTop: 0,
        // move, resize, rotate
        eventType: '',
        resizerDir: '',
      },
      currentRects: [],
    }
  },
  methods: {
    _createGroupRect (angle = 0) {
      let data = {
        color: 'red',
        angle,
      }
      return this._warpRect(data, 'group')
    },
    _createRect (left, top, width, height, angle = 0, color = 'black') {
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
      this._updateGroupSize(group)
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
        // 当前数据
        data: rectData,
        // 类型
        type,
        // 临时数据，用来中间态计算
        tempData: null,
      }
      this.rects.push(rect)
      return rect
    },
    // 更新 group size
    _updateGroupSize (group) {
      let rects = group.children.map(id => {
        return this._getRectById(id)
      })
      var sizeData = getGroupSize(rects, group.data.angle)
      group.data = Object.assign(group.data, sizeData)
    },
  }
}