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
      this._bindGroup(newGroup, this._getDeepRectsByRect(currRect))
      this._unbindTempGroup()
      this._updateCurrRect(newGroup)
      this._historyPush()
    },
    _actionCanUnGroup () {
      return this._actionGetInfo().isGroup
    },
    _actionUnGroup () {
      let currRect = this.objects[this.currRectId]
      this._unbindGroup(currRect)
      this._updateCurrRect()
      this._historyPush()
    },
    _actionCanRectDelete () {
      return this._actionGetInfo().rect
    },
    _actionRectDelete () {
      let currRect = this.objects[this.currRectId]
      this._getDeepRectsByRect(currRect).forEach(rect => {
        this._removeRectById(rect.id)
      })
      this._commandPropUpdate('tempGroupId', '')
      this._updateCurrRect()
      this._historyPush()
    },
    _actionRectCopy () {
      let currRect = this.objects[this.currRectId]
      if (this._checkIsTempGroup(currRect)) {
        this._commandPropUpdate('clipboard', 
          this._getRectsByGroup(currRect).map(rect => {
            return this._cloneRect(rect)
          })
        )
      }
      else {
        this._commandPropUpdate('clipboard', [this._cloneRect(currRect)])
      }
    },
    _actionCanRectPaste () {
      return this.clipboard.length > 0
    },
    _actionRectPaste () {
      // todo，粘贴的位置还得考虑
      let rects = this.clipboard.map(config => {
        let rect = this._createRectByConfig(config)
        this._updateRectTempData(rect)
        this._move(rect, 20, 20)
        return rect
      })
      let currRect = rects[0]
      if (rects.length > 1){
        this._unbindTempGroup()
        currRect = this._bindTempGroup(rects)
      }
      this._updateCurrRect(currRect)
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
  }
}