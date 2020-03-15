import {
  getUuid,
  getGroupSize,
  getRectInfo,
  middleLeft,
  middleTop,
} from '../core/base'
import {
  _linkedListAppend,
  _linkedListInsertBefore,
  _linkedListRemove,
  _linkedListGetObjects,
} from './data/linked-list'
import * as rectConfig from '../core/rect-config'
export default {
  data () {
    return {
      objects: {},
      currPageId: '',
      currRectId: '',
      hoverRectId: '',
      tempGroupId: '',
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
        // 鼠标对象
        e: null,
      },
      setting: {
        prop: '',
        value: '',
      },
      handler: {
        // 用来闪烁
        show: true,
      },
      rectConfig: {
        ...rectConfig,
      },
      clipboard: [],
      zIndex: 0,
      renderHook: 0,
      scale: 1,
    }
  },
  methods: {
    _linkedListAppend,
    _linkedListInsertBefore,
    _linkedListRemove,
    _linkedListGetObjects,
    _parseLongProp (prop, data = this.$data) {
      let props = prop.split('.')
      let object = data
      let lastProp = props.slice(-1)[0]
      props.slice(0, -1).forEach(p => {
        object = object[p]
      })
      return {
        get () {
          return object[lastProp]
        },
        set (value) {
          let isNull = (value === null) || (value === undefined) 
          if (isNull){
            delete object[lastProp]
          }
          else {
            object[lastProp] = value
          }
        }
      }
    },
    _createPage () {
      let page = {
        id: getUuid(),
        name: '',
        type: 'page',
        count: 1,
        // 记录 rects 的头位
        headId: '',
        tailId: ''
      }
      this._commandPageAdd(page)
      return page
    },
    _createRect (type = 'rect') {
      let data = this.rectConfig[type]
      if (!data) {
        return
      }
      type = 'rect-' + type
      return this._createRectByConfig({type, data})
    },
    _createRectByConfig (config) {
      let data = config.data
      // 类型是数组，说明要创建一个 group 组件
      // 并且数组第一个是 group 信息
      if (Array.isArray(data)){
        let group = this._createRectBase(data[0].type, data[0].data)
        data.slice(1).map(o => {
          let rect = this._createRectBase(o.type, o.data)
          this._commandRectPropUpdate(rect, 'groupId', group.id)

        })
        return group
      }
      else {
        return this._createRectBase(config.type, data)
      }
    },
    _createRectBase (type = 'rect', data) {
      data = {...data}
      let index = this.objects[this.currPageId].count ++
      let rect = {
        id: getUuid(),
        pageId: this.currPageId,
        groupId: '',
        tempGroupId: '',
        data,
        // 临时数据，用来中间态计算
        tempData: null,
        // 类型
        type,
        name: type + index,
        prevId: '',
        nextId: '',
      }
      this._commandRectAdd(rect)
      if (!this._checkIsTempGroup(rect)){
        this._linkedListAppend(this.currPageId, rect)
      }
      return rect
    },
    _cloneRect (rect) {
      let f = (rect2) => {
        return {
          type: rect2.type,
          data: {...rect2.data},
        }
      }
      if (this._checkIsGroup(rect)){
        let rects = [f(rect)]
        this._getRectsByGroup(rect).forEach(rect2 => {
          rects.push(f(rect2))
        })
        return {
          type: 'rect-group',
          data: rects,
        }
      }
      else {
        return f(rect)
      }
    },
    _getObjectsByParentId (groupId, prop = 'groupId') {
      let objects = []
      for (let key in this.objects){
        let value = this.objects[key]
        if (value[prop] === groupId){
          objects.push(value)
        }
      }
      return objects
    },
    // 获得当前 page 下的所有 rects
    _getRectsByPage (pageId = this.currPageId) {
      let rects = this._linkedListGetObjects(pageId)
      if (this.tempGroupId){
        rects.push(this.objects[this.tempGroupId])
      }
      return rects
    },
    _getRectsByGroup (group) {
      if (typeof group !== 'object'){
        group = this.objects[group]
      }
      if (this._checkIsTempGroup(group)){
        return this._getObjectsByParentId(group.id, 'tempGroupId')
      }
      else {
        return this._getObjectsByParentId(group.id)
        // let rects = []
        // let start = this.objects[group.nextId]
        // while (start && (start.groupId === group.id)) {
        //   rects.push(start)
        //   start = this.objects[start.nextId]
        // }
        // return rects
      }
    },
    _getGroupByRect (rect) {
      if (typeof rect !== 'object'){
        rect = this.objects[rect]
      }
      return this.objects[rect.groupId]
    },
    _getTempGroupByRect (rect) {
      if (typeof rect !== 'object'){
        rect = this.objects[rect]
      }
      if (rect.tempGroupId){
        return this.objects[rect.tempGroupId]
      }
      let group = this._getGroupByRect(rect)
      if (group && group.tempGroupId){
        return this.objects[group.tempGroupId]
      }
      return null
    },
    // 绑定父子关系
    _bindGroup (group, rects) {
      let realRects = []
      let f = (rect) => {
        realRects.push(rect)
        this._commandRectPropUpdate(rect, 'tempGroupId', '')
        this._commandRectPropUpdate(rect, 'groupId', group.id)
      }
      rects.forEach(rect => {
        if (this._checkIsGroup(rect)){
          this._getRectsByGroup(rect).forEach(rect2 => f(rect2))
          this._removeRectById(rect.id)
        }
        else {
          f(rect)
        }
      })
      // 进行排序，排序规则为：
      // 1、得到 realRects 中 index 最大的（o）为基础
      // 2、realRects 中其他降序依次 排到 o 前边
      // 3、group 排最前边
      let sortRects = realRects.sort((a, b) => a.tempIndex - b.tempIndex)
      let lastRect = sortRects.slice(-1)[0]
      ;[group, ...sortRects.slice(0, -1)].forEach(rect => {
        this._linkedListRemove(this.currPageId, rect)
        this._linkedListInsertBefore(this.currPageId, lastRect, rect)
      })
      this._updateGroupSize(group)
    },
    _unbindGroup (group) {
      this._getRectsByGroup(group).forEach(rect => {
        this._commandRectPropUpdate(rect, 'groupId', '')
      })
      this._removeRectById(group.id)
    },
    _bindTempGroup (rects) {
      if (!this.tempGroupId){
        this._commandPropUpdate('tempGroupId', this._createRect('tempGroup').id)
      }
      let group = this.objects[this.tempGroupId]
      rects.forEach(rect => {
        this._commandRectPropUpdate(rect, 'tempGroupId', group.id)
      })
      this._updateRectTempData(group)
      this._updateGroupSize(group)
      return group
    },
    _unbindTempGroup () {
      if (!this.tempGroupId){
        return
      }
      this._getRectsByGroup(this.tempGroupId).forEach(rect => {
        this._commandRectPropUpdate(rect, 'tempGroupId', '')
      })
      this._commandRectDelete(this.tempGroupId)
      this._commandPropUpdate('tempGroupId', '')
    },
    _unbindTempGroupSome (children) {
      if (!this.tempGroupId){
        return
      }
      children.forEach(rect => {
        this._commandRectPropUpdate(rect, 'tempGroupId', '')
      })
    },
    // 通过 id 从 rects 中找到 object
    _getRectById (id) {
      return this.objects[id]
    },
    _getTempGroup () {
      return this.objects[this.tempGroupId]
    },
    _removeRectById (id) {
      let group = this._getGroupByRect(id)
      this._linkedListRemove(this.currPageId, this.objects[id])
      this._commandRectDelete(id)
      if (group){
        let children = this._getRectsByGroup(group)
        if (children.length === 1){
          this._commandRectPropUpdate(children[0], 'groupId', '')
          this._removeRectById(group.id)
        }
        else {
          this._updateGroupSize(group)
        }
      }
    },
    // 更新 group size
    _updateGroupSize (group) {
      if (typeof group === 'string'){
        group = this.objects[group]
      }
      var size = this._getGroupSize(group)
      for (let k in size){
        this._commandRectDataPropUpdate(group, k, size[k])
      }
      return size
    },
    _getGroupSize (group) {
      return getGroupSize(this._getRectsByGroup(group), group.data.angle)
    },
    _checkIsPage (object) {
      return object.type === 'page'
    },
    _checkIsRectLike (rect) {
      return rect.type.indexOf('rect-') === 0
    },
    _checkIsGroupLike (rect) {
      return rect.type === 'rect-group' || rect.type === 'rect-tempGroup'
    },
    _checkIsTempGroup (rect) {
      return rect.type === 'rect-tempGroup'
    },
    _checkIsGroup (rect) {
      return rect.type === 'rect-group'
    },
    _updateAllRectsTempData () {
      this._getRectsByPage().forEach(rect => {
        rect.tempData = getRectInfo(rect.data)
      })
    },
    _updateRectTempData (rect) {
      this._getDeepRectsByRect(rect).forEach(rect2 => {
        rect2.tempData = getRectInfo(rect2.data)
      })
    },
    _getDeepRectsByRect (rect) {
      if (!this._checkIsGroupLike(rect)){
        return [rect]
      }
      if (this._checkIsGroup(rect)){
        return [rect, ...this._getRectsByGroup(rect)]
      }
      if (this._checkIsTempGroup(rect)){
        let rects = [rect]
        this._getRectsByGroup(rect).forEach(rect2 => {
          rects.push(rect2)
          if (this._checkIsGroup(rect2)){
            rects = [...rects, ...this._getRectsByGroup(rect2)]
          }
        })
        return rects
      }
    },
    _updateRectData (rect, data) {
      for (let k in data){
        this._commandRectDataPropUpdate(rect, k, data[k])
      }
      let group = this._getGroupByRect(rect)
      if (group){
        this._updateGroupSize(group)
      }
      let tempGroup = this._getTempGroupByRect(rect)
      if (tempGroup){
        this._updateGroupSize(tempGroup)
      }
    },
    _updateGroupState (group, f, isRotate = false) {
      let groupIds = []
      this._getDeepRectsByRect(group).forEach(rect => {
        let id = rect.id
        if (this._checkIsGroup(rect)){
          groupIds.push(id)
        }
        else {
          f(id)
        }
      })
      groupIds.forEach(groupId => {
        // 如果是旋转，那么还是要执行以下
        if (isRotate) {
          f(groupId)
        }
        // 不是旋转就得同步
        else {
          this._updateGroupSize(this._getRectById(groupId))
        }
      })
    },
    _focusRect (rect, e = {}) {
      let isDblclick = e.type === 'dblclick'
      let isShiftkey = e.shiftKey
      let group = this._getGroupByRect(rect)
      let tempGroup = this._getTempGroupByRect(rect)
      let currRect = this.objects[this.currRectId]
      let mouse = this.mouse
      let mousePoint = this._getMousePoint(e)
      mouse.e = e

      // 此方法处理 dblclick，shift，group，tempGroup 交杂的情况
      let f = () => {
        if ((rect === currRect)){
          if (isDblclick){
            this._commandRectDataPropUpdate(rect, 'isEdit', true)
          }
          return
        }
        if (isShiftkey && isDblclick){
          return
        }
        if (isDblclick){
          this._blurRect()
          if (group && !group.data.isOpen){
            this._commandRectDataPropUpdate(group, 'isOpen', true)
          }
          if (!group || (group && group.isOpen)){
            this._commandRectDataPropUpdate(rect, 'isEdit', true)
          }
          this._updateCurrRect(rect)
          return
        }
        if (!isShiftkey){
          if (!group && !tempGroup){
            this._blurRect()
            this._updateCurrRect(rect)
            if (this._checkIsGroup(rect)){
              this._commandRectDataPropUpdate(rect, 'isOpen', false)
            }
            return
          }
          if (tempGroup){
            this._updateCurrRect(tempGroup)
            return
          }
          if (group){
            let groupIsOpen = group.data.isOpen
            this._blurRect()
            if (!groupIsOpen){
              this._updateCurrRect(group)
            }
            else {
              this._updateCurrRect(rect)
              this._commandRectDataPropUpdate(group, 'isOpen', true)
            }
          }
          return
        }
        if (isShiftkey){
          if (group && !group.data.isOpen){
            rect = group
          }
          if (!currRect){
            this._updateCurrRect(rect)
            return
          }
          if (this._checkIsTempGroup(currRect)){
            if (this._getRectsByGroup(currRect).includes(rect)){
              this._unbindTempGroupSome([rect])
              // 如果临时组就剩一个了，那么解散
              let tempGroupChildren = this._getRectsByGroup(currRect)
              if (tempGroupChildren.length === 1){
                let last = tempGroupChildren[0]
                this._blurRect()
                this._updateCurrRect(last)
              }
              else {
                this._updateGroupSize(currRect)
              }
            }
            else {
              this._bindTempGroup([rect])
            }
          }
          else {
            if (currRect !== rect){
              this._bindTempGroup([currRect, rect])
              this._blurRect(false)
              this._updateCurrRect(this._getTempGroup())
            }
          }
        }
      }
      f()
      // 记录鼠标坐标
      mouse.ing = true
      mouse.startLeft = mouse.currLeft = mousePoint.left
      mouse.startTop = mouse.currTop = mousePoint.top
      this._updateAllRectsTempData()
      this._updateGuide()
      this._clearSetting()
    },
    _blurRect (closeGroup = true) {
      let rect = this.objects[this.currRectId]
      if (!rect) {
        return
      }
      this._commandPropUpdate('currRectId', '')
      this._hoverOffRect()
      if (this._checkIsTempGroup(rect)){
        this._unbindTempGroup(rect)
      }
      else {
        this._commandRectDataPropUpdate(rect, 'isEdit', false)
      }
      if (closeGroup){
        // 如果 rect 父亲，则关闭父亲
        let group = this._getGroupByRect(rect)
        if (group){
          this._commandRectDataPropUpdate(group, 'isOpen', false)
        }
      }
    },
    _hoverRect (rect) {
      if (this.mouse.ing){
        return
      }
      let target = rect
      let group = this._getGroupByRect(rect)
      if (group && !group.data.isOpen){
        target = group
      }
      if (this._checkIsGroup(rect) && rect.data.isOpen){
        target = null
      }
      this._commandPropUpdate('hoverRectId', target ? target.id : '')
    },
    _hoverOffRect () {
      this._commandPropUpdate('hoverRectId', '')
    },
    _getMousePoint (e) {
      let $middle = this.$refs.middle
      let scale = this.scale
      return {
        left: (e.clientX + $middle.scrollLeft - middleLeft) / scale,
        top: (e.clientY + $middle.scrollTop - middleTop) / scale,
      }
    },
    _getRectBaseJsxProps (rect, scale = 1) {
      let data = rect.data
      return {
        style_left: data.left * scale + 'px',
        style_top: data.top * scale + 'px',
        style_width: data.width * scale + 'px',
        style_height: data.height * scale + 'px',
        'style_z-index': data.zIndex,
        style_transform: `rotate(${data.angle}deg)`,
      }
    },
    _updateCurrRect (rect) {
      this._commandPropUpdate('currRectId', rect ? rect.id : '')
    },
    _updateHoverRect (rect) {
      this._commandPropUpdate('hoverRectId', rect ? rect.id : '')
    },
    _clearSetting () {
      this._commandPropUpdate('setting.prop', '')
      this._commandPropUpdate('setting.value', '')
    },
    _flashHandler () {
      this._commandPropUpdate('handler.show', false)
      setTimeout(() => {
        this._commandPropUpdate('handler.show', true)
      }, 1000)
    }
  }
}