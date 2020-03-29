export default {
  methods: {
    _actionGetInfo () {
      let rect = this.objects[this.currRectId]
      let isTempGroup = rect && this._checkIsTempGroup(rect)
      let isGroup = rect && this._checkIsGroup(rect)
      return {
        rect,
        isTempGroup,
        isGroup,
      }
    },
    // page
    _actionPageCreate (parentId) {
      let page = this._createPage(parentId)
      this._commandObjectDataPropUpdate(page, 'isNameEdit', true)
      this._updateCurrPage(page)
      this._historyPush()
    },
    _actionPageDelete () {
      this._removePage()
      this._historyPush()
    },
    // rect
    _actionCanGroup () {
      return this._actionGetInfo().isTempGroup
    },
    _actionGroup () {
      let currRect = this.objects[this.currRectId]
      let newGroup = this._createRect('group')
      let rects = this._getDeepRectsByRect(currRect)
      this._bindGroup(newGroup, rects)
      // 处理 selected
      rects.forEach(rect => {
        this._removeSelectedRect(rect)
      })
      this._addSelectedRect(newGroup)
      this._updateCurrRectBySelected()
      this._historyPush()
    },
    _actionCanUnGroup () {
      return this._actionGetInfo().isGroup
    },
    _actionUnGroup () {
      let currRect = this.objects[this.currRectId]
      let rects = this._getDeepRectsByRect(currRect)
      this._unbindGroup(currRect)
      // 处理 selected
      rects.forEach(rect => {
        this._addSelectedRect(rect)
      })
      this._removeSelectedRect(currRect)
      this._updateCurrRectBySelected()
      this._historyPush()
    },
    _actionCanRectDelete () {
      return this._actionGetInfo().rect
    },
    _actionRectDelete () {
      let currRect = this.objects[this.currRectId]
      this._getDeepRectsByRect(currRect).forEach(rect => {
        if (rect.groupId && this.objects[rect.groupId].data.isLock) {
          return
        }
        if (!rect.groupId && rect.data.isLock) {
          return
        }
        this._removeRectById(rect.id)
      })

      let rect = null
      // 检查是否还有没删掉的
      if (this._checkIsTempGroup(currRect)) {
        let rects = this._getRectsByGroup(currRect)
        rect = this._tryBindNewTempGroup(rects)
      }
      else {
        if (!currRect.isDelete) {
          rect = currRect
        }
      }
      this._updateCurrRect(rect)
      this._historyPush()
    },
    _actionRectCopy () {
    this._commandPropUpdate('clipboard', 
      this._getUnLockRectsBySelected().map(rect => this._cloneRect(rect))
    )
    },
    _actionCanRectPaste () {
      return this.clipboard.length > 0
    },
    _actionRectPaste () {
      this._clearSelectedRects()
      // todo，粘贴的位置还得考虑
      this.clipboard.map(config => {
        let rect = this._createRectByConfig(config)
        this._addSelectedRect(rect)
        return rect
      })
      this._updateCurrRectBySelected()
      this._updateRectTempData(this.currRectId)
      this._move(this.currRectId, 20, 20)
      this._clearGuideShow()
      this._historyPush()
    },
    _actionRectMoveUp () {
      let rects = []
      if (this.tempGroupId){
        rects = this._getRectsByGroup(this.currRectId)
      }
      else {
        rects = [this.objects[this.currRectId]]
      }
      rects.forEach(rect => {
        let parent = this.objects[rect.groupId || this.currPageId]
        this._linkedListMoveUp(parent, rect)
      })
      this._historyPush()
    },
    _actionRectMoveDown () {
      let rects = []
      if (this.tempGroupId){
        rects = this._getRectsByGroup(this.currRectId)
      }
      else {
        rects = [this.objects[this.currRectId]]
      }
      rects.forEach(rect => {
        let parent = this.objects[rect.groupId || this.currPageId]
        this._linkedListMoveDown(parent, rect)
      })
      this._historyPush()
    },
    _actionRectMoveTop () {
      let rects = []
      if (this.tempGroupId){
        rects = this._getRectsByGroup(this.currRectId)
      }
      else {
        rects = [this.objects[this.currRectId]]
      }
      rects.forEach(rect => {
        let parent = this.objects[rect.groupId || this.currPageId]
        this._linkedListMoveTop(parent, rect)
      })
      this._historyPush()
    },
    _actionRectMoveBottom () {
      let rects = []
      if (this.tempGroupId){
        rects = this._getRectsByGroup(this.currRectId)
      }
      else {
        rects = [this.objects[this.currRectId]]
      }
      rects.forEach(rect => {
        let parent = this.objects[rect.groupId || this.currPageId]
        this._linkedListMoveBottom(parent, rect)
      })
      this._historyPush()
    },
    _actionCanRectLock () {
      return this._getUnLockRectsBySelected().length
    },
    _actionCanRectUnLock () {
      return this._getLockRectsBySelected().length
    },
    _actionRectLock () {
      for (let rect in this.selectedRects) {
        rect = this._safeObject(rect)
        this._commandRectDataPropUpdate(rect, 'isLock', true)
      }
      this._updateCurrRectBySelected()
      this._historyPush()
    },
    _actionRectUnLock () { 
      for (let rect in this.selectedRects) {
        rect = this._safeObject(rect)
        this._commandRectDataPropUpdate(rect, 'isLock', false)
      }
      this._updateCurrRectBySelected()
      this._historyPush()
    },
  }
}