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
    _actionPageCreate (parentId = this.currProjectId) {
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
        this._removeRectById(rect.id)
      })
      this._updateCurrRect()
      this._historyPush()
    },
    _actionCanRectCopy () {
      return this._actionGetInfo().rect
    },
    _actionRectCopy () {
      this._commandPropUpdate('clipboard', 
        this._getUnLockRectsBySelected().map(rect => this._cloneRect(rect))
      )
    },
    _actionCanRectCut () {
      return this._actionGetInfo().rect
    },
    _actionRectCut () {
      this._actionRectCopy()
      this._actionRectDelete()
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
    _actionGet (type) {
      let rectInfo = this._actionGetInfo()
      let me = this
      let fMap = {
        'rect-重命名': {
          checkF: '',
          doF: () => {
            me._commandRectDataPropUpdate(rectInfo.rect, 'isNameEdit', true)
          }
        },
        'rect-剪切': {
          checkF: '_actionCanRectCut',
          doF: '_actionRectCut',
        },
        'rect-复制': {
          checkF: '_actionCanRectCopy',
          doF: '_actionRectCopy',
        },
        'rect-粘贴': {
          checkF: '_actionCanRectPaste',
          doF: '_actionRectPaste',
        },
        'rect-删除': {
          checkF: '_actionCanRectDelete',
          doF: '_actionRectDelete',
        },
        'rect-锁定': {
          checkF: '_actionCanRectLock',
          doF: '_actionRectLock',
        },
        'rect-解锁': {
          checkF: '_actionCanRectUnLock',
          doF: '_actionRectUnLock',
        },
        'rect-组合': {
          checkF: '_actionCanGroup',
          doF: '_actionGroup',
        },
        'rect-打散': {
          checkF: '_actionCanUnGroup',
          doF: '_actionUnGroup',
        },
        'rect-上移': {
          checkF: '',
          doF: '_actionRectMoveUp',
        },
        'rect-下移': {
          checkF: '',
          doF: '_actionRectMoveDown',
        },
        'rect-置顶': {
          checkF: '',
          doF: '_actionRectMoveTop',
        },
        'rect-置底': {
          checkF: '',
          doF: '_actionRectMoveBottom',
        },
        // page
        'page-重命名': {
          checkF: '',
          doF: () => {
            me._commandObjectDataPropUpdate(me.objects[me.currPageId], 'isNameEdit', true) 
          },
        },
        'page-新建子页面': {
          checkF: '',
          doF: () => {
            me._actionPageCreate(me.currPageId)
          },
        },
        'page-删除': {
          checkF: '',
          doF: '_actionPageDelete',
        },
        // sys
        'sys-撤销': {
          checkF: '_historyCanBack',
          doF: '_historyBack',
        },
        'sys-重做': {
          checkF: '_historyCanGo',
          doF: '_historyGo',
        },
      }
      let f = f || fMap[type]
      let checkF = f.checkF || (() => true)
      if (typeof checkF === 'string') {
        checkF = this[checkF]
      }
      let doF = f.doF || (() => {})
      if (typeof doF === 'string') {
        doF = this[doF]
      }
      let text = type.split('-')[1] || 'unknow'
      return {
        doF,
        checkF,
        text,
      }
    },
  }
}