import {
  getUuid,
  getGroupSize,
  arrayRemove,
  getRectInfo,
  getMousePoint,
} from '../core/base'

export default {
  data () {
    return {
      rects: [],
      currRects: [],
      hoverRects: [],
      mouse: {
        ing: false,
        startLeft: 0,
        startTop: 0,
        currLeft: 0,
        currTop: 0,
        // eventType 解释
        // move 移动 rect
        // resize 放大 rect
        // rotate 旋转 rect
        // create 新建 rect
        eventType: '',
        resizerDir: '',
        createType: '',
        // shiftKey: false,
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
      setting: {
        prop: '',
        value: '',
      },
      zIndex: 0,
      renderHook: 0,
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
        zIndex: 0,
        ...data,
      }

      let rect = {
        id: getUuid(),
        groupId: '',
        tempGroupId: '',
        children: [],
        // 外部数据，主要包括 left,top,width,height,rotate
        data: rectData,
        // 临时数据，用来中间态计算
        tempData: null,
        // 内部数据，包括文本内容，颜色，边框等等
        innerData: {
          text: '#',
          color: '#000',
          backgroundColor: '#fff',
          borderRadius: 0,
        },
        // 类型
        type,
      }
      this.rects.push(rect)
      return rect
    },
    _createGroup (angle = 0) {
      let data = {
        angle,
        isOpen: false,
      }
      return this._warpRect(data, 'group')
    },
    _createTempGroup () {
      return this._warpRect({
        isOpen: false,
      }, 'tempGroup')
    },
    _createRect (left, top, width = 200, height = 100, angle = 0) {
      let data = {
        left,
        top,
        width,
        height,
        angle,
        isEdit: false,
      }
      return this._warpRect(data, 'default')
    },
    // 绑定父子关系
    // todo zindex
    _bindGroup (group, rects) {
      let groupZIndex = group.data.zIndex
      rects.forEach(rect => {
        rect.groupId = group.id
        group.children.push(rect.id)
        rect.data.zIndex = groupZIndex + 1
      })
      this._updateGroupSize(group)
      return group
    },
    // 解绑全部
    _unbindGroup (group) {
      group.children.forEach(id => {
        var rect = this._getRectById(id)
        rect.groupId = ''
      })
      group.children = []
      return group
    },
    // todo zindex
    _bindTempGroup (group, rects) {
      let groupZIndex = group.data.zIndex
      rects.forEach(rect => {
        rect.tempGroupId = group.id
        group.children.push(rect.id)
        rect.data.zIndex = groupZIndex + 1
      })
      this._updateGroupSize(group)
      return group
    },
    _unbindTempGroup (group) {
      group.children.forEach(id => {
        var rect = this._getRectById(id)
        rect.tempGroupId = ''
      })
      group.children = []
      return group
    },
    _unbindTempGroupSome (group, children) {
      children.forEach(rect => {
        let id = rect.id
        rect.tempGroupId = ''
        arrayRemove(group.children, id)
      })
      return group
    },
    // 通过 id 从 rects 中找到 object
    _getRectById (id) {
      let rect = null
      if (!id) {
        return rect
      }
      this.rects.some(_rect => {
        if (_rect.id === id){
          rect = _rect
          return true
        }
      })
      return rect
    },
    _removeRectById (id) {
      arrayRemove(this.rects, id, (a) => a.id)
    },
    // 更新 group size
    _updateGroupSize (group) {
      var size = this._getGroupSize(group)
      group.data = {...group.data, ...size}
      return size
    },
    _getGroupSize (group) {
      let rects = group.children.map(id => {
        return this._getRectById(id)
      })
      return getGroupSize(rects, group.data.angle)
    },
    _checkIsGroupLike (rect) {
      return rect.type === 'group' || rect.type === 'tempGroup'
    },
    _checkIsTempGroup (rect) {
      return rect.type === 'tempGroup'
    },
    _checkIsGroup (rect) {
      return rect.type === 'group'
    },
    _updateRectZIndex (rect) {
      let data = rect.data
      let isGroupLike = this._checkIsGroupLike(rect)
      let oldZIndex = rect.data.zIndex
      let newZIndex = rect.data.zIndex  = ++ this.zIndex

      if (isGroupLike){
        let diff = newZIndex - oldZIndex
        let f = (_rect) => {
          _rect.data.zIndex += diff
          this.zIndex = Math.max(this.zIndex, _rect.data.zIndex)
        }
        rect.children.forEach(id => {
          let rect2 = this._getRectById(id)
          f(rect2)

          if (this._checkIsGroup(rect2)){
            rect2.children.forEach(id => {
              let rect3 = this._getRectById(id)
              f(rect3)
            })
          }
        })
      }
    },
    _updateAllRectsTempData () {
      this.rects.forEach(rect => {
        rect.tempData = getRectInfo(rect.data)
      })
    },
    _updateRectTempData (rect) {
      this._getRects(rect).forEach(rect2 => {
        rect2.tempData = getRectInfo(rect2.data)
      })
    },
    _getRects (rect) {
      let isGroupLike = this._checkIsGroupLike(rect)
      if (isGroupLike){
        let rects = [rect]
        rect.children.forEach(rectId => {
          let rect2 = this._getRectById(rectId)
          rects.push(rect2)
          if (rect2.children.length){
            rect2.children.forEach(rectId2 => {
              rects.push(this._getRectById(rectId2))
            })
          }
        })
        return rects
      }
      else {
        return [rect]
      }
    },
    _updateRectData (rect, data) {
      rect.data = {...rect.data, ...data}
      if (rect.groupId){
        this._updateGroupSize(this._getRectById(rect.groupId))
      }
      if (rect.tempGroupId){
        this._updateGroupSize(this._getRectById(rect.tempGroupId))
      }
    },
    _updateGroupState (group, f) {
      let groupIds = []
      group.children.forEach(id => {
        let rect = this._getRectById(id)

        // 如果是 group 忽略，并且暂存起来，最后一起重置
        if (this._checkIsGroup(rect)){
          rect.children.forEach(id => f(id))
          groupIds.push(id)
        }
        else {
          f(id)
        }
      })
      groupIds.forEach(groupId => {
        this._updateGroupSize(this._getRectById(groupId))
      })
    },
    _getTempGroup (rect) {
      let tempGroupId = rect.tempGroupId

      if (!tempGroupId){
        let groupId = rect.groupId
        if (groupId){
          let group = this._getRectById(groupId)
          tempGroupId = group.tempGroupId
        }
      }

      if (tempGroupId){
        return this._getRectById(tempGroupId)
      }
      else {
        return null
      }
    },
    _focusRect (rect, e) {
      let isDblclick = e.type === 'dblclick'
      let isShiftkey = e.shiftKey
      let group = this._getRectById(rect.groupId)
      let tempGroup = this._getTempGroup(rect)
      let currRect = this.currRects[0]
      let mouse = this.mouse
      let mousePoint = getMousePoint(e)

      // 此方法处理 dblclick，shift，group，tempGroup 交杂的情况
      let f = () => {
        if ((rect === currRect) && !isDblclick){
          return
        }
        if (isShiftkey && isDblclick){
          return
        }
        if (isDblclick){
          this._blurRect()
          if (group && !group.data.isOpen){
            group.data.isOpen = true
          }
          if (!group || (group && group.isOpen)){
            rect.data.isEdit = true
          }
          // this.currRects = [rect]
          this._updateCurrRect(rect)
          return
        }
        if (!isShiftkey){
          if (!group && !tempGroup){
            this._blurRect()
            // this.currRects = [rect]
            this._updateCurrRect(rect)
            if (this._checkIsGroup(rect)){
              rect.data.isOpen = false
            }
            return
          }
          if (tempGroup){
            // this.currRects = [tempGroup]
            this._updateCurrRect(tempGroup)
            return
          }
          if (group){
            let groupIsOpen = group.data.isOpen
            this._blurRect()
            if (!groupIsOpen){
              // this.currRects = [group]
              this._updateCurrRect(group)
            }
            else {
              // this.currRects = [rect]
              this._updateCurrRect(rect)
              group.data.isOpen = true
            }
          }
          return
        }
        if (isShiftkey){
          if (group && !group.data.isOpen){
            rect = group
          }
          if (!currRect){
            // this.currRects = [rect]
            this._updateCurrRect(rect)
            return
          }
          if (this._checkIsTempGroup(currRect)){
            if (currRect.children.includes(rect.id)){
              this._unbindTempGroupSome(currRect, [rect])
              // 如果临时组就剩一个了，那么解散
              if (currRect.children.length === 1){
                let last = currRect.children[0]
                this._blurRect()
                // this.currRects = [this._getRectById(last)]
                this._updateCurrRect(this._getRectById(last))
              }
              else {
                this._updateGroupSize(currRect)
              }
            }
            else {
              this._bindTempGroup(currRect, [rect])
            }
          }
          else {
            let tempGroup = this._createTempGroup()
            this._bindTempGroup(tempGroup, [currRect, rect])
            this._blurRect(false)
            // this.currRects = [tempGroup]
            this._updateCurrRect(tempGroup)
          }
        }
      }
      f()

      // 记录鼠标坐标
      mouse.ing = true
      mouse.startLeft = mouse.currLeft = mousePoint.left
      mouse.startTop = mouse.currTop = mousePoint.top
      this._updateRectZIndex(this.currRects[0])
      this._updateAllRectsTempData()
      this._updateGuide()
    },
    _blurRect (closeGroup = true) {
      let rect = this.currRects[0]
      if (!rect) {
        return
      }
      this.currRects = []
      this._hoverOffRect()
      // 如果是 tempGroup
      if (this._checkIsTempGroup(rect)){
        // 解除关系
        this._unbindTempGroup(rect)
        // 删除
        this._removeRectById(rect.id)
      }
      else {
        rect.data.isEdit = false
      }
      
      if (closeGroup){
        // 如果 rect 父亲，则关闭父亲
        let group = this._getRectById(rect.groupId)
        if (group){
          group.data.isOpen = false
        }
      }
    },
    _hoverRect (rect) {
      if (this.mouse.ing){
        return
      }
      let target = rect
      let rectType = rect.type
      let group = this._getRectById(rect.groupId)
      if (group && !group.data.isOpen){
        target = group
      }
      if ( (rectType === 'group') && rect.data.isOpen){
        target = null
      }
      this.hoverRects = target ? [target] : []
    },
    _hoverOffRect () {
      this.hoverRects = []
    },
    _getRectBaseJsxProps (rect) {
      let data = rect.data
      return {
        style_left: data.left + 'px',
        style_top: data.top + 'px',
        style_width: data.width + 'px',
        style_height: data.height + 'px',
        'style_z-index': data.zIndex,
        style_transform: `rotate(${data.angle}deg)`,
      }
    },
    _updateCurrRect (rect) {
      this.currRects = [rect]
      this._updateSetting()
    },
    _updateSetting () {return
      let rect = this.currRects[0]
      this.setting = {...this.setting, ...rect.data}
    },
  }
}