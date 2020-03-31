// import hotkeys from 'hotkeys-js'
export default {
  data () {
    let me = this
    return {
      actionMap: {
        'rect-重命名': {
          checkF: () => this.currRectId,
          doF: () => {
            me._commandRectDataPropUpdate(this.objects[this.currRectId], 'isNameEdit', true)
          }
        },
        'rect-全选': {
          doF: '_actionRectSelectAll',
          hotkey: 'command + a',
        },
        'rect-剪切': {
          checkF: '_actionCanRectCut',
          doF: '_actionRectCut',
          hotkey: 'command + x',
        },
        'rect-复制': {
          checkF: '_actionCanRectCopy',
          doF: '_actionRectCopy',
          hotkey: 'command + c'
        },
        'rect-粘贴': {
          checkF: '_actionCanRectPaste',
          doF: '_actionRectPaste',
          hotkey: 'command + v'
        },
        'rect-删除': {
          checkF: '_actionCanRectDelete',
          doF: '_actionRectDelete',
          hotkey: 'backspace'
        },
        'rect-锁定': {
          checkF: '_actionCanRectLock',
          doF: '_actionRectLock',
          hotkey: 'command + l'
        },
        'rect-解锁': {
          checkF: '_actionCanRectUnLock',
          doF: '_actionRectUnLock',
          hotkey: 'command + shift + l'
        },
        'rect-组合': {
          checkF: '_actionCanGroup',
          doF: '_actionGroup',
          hotkey: 'command + g'
        },
        'rect-打散': {
          checkF: '_actionCanUnGroup',
          doF: '_actionUnGroup',
          hotkey: 'command + shift + g'
        },
        'rect-上移': {
          checkF: () => this.currRectId,
          doF: '_actionRectMoveUp',
          hotkey: 'command + alt + up',
        },
        'rect-下移': {
          checkF: () => this.currRectId,
          doF: '_actionRectMoveDown',
          hotkey: 'command + alt + down',
        },
        'rect-置顶': {
          checkF: () => this.currRectId,
          doF: '_actionRectMoveTop',
          hotkey: 'command + shift + up',
        },
        'rect-置底': {
          checkF: () => this.currRectId,
          doF: '_actionRectMoveBottom',
          hotkey: 'command + shift + down',
        },
        'rect-keyupMove': {
          checkF: () => this.currRectId,
          doF: '_actionRectKeyupMove',
          hotkey: 'up',
        },
        'rect-keydownMove': {
          checkF: () => this.currRectId,
          doF: '_actionRectKeydownMove',
          hotkey: 'down',
        },
        'rect-keyleftMove': {
          checkF: () => this.currRectId,
          doF: '_actionRectKeyleftMove',
          hotkey: 'left',
        },
        'rect-keyrightMove': {
          checkF: () => this.currRectId,
          doF: '_actionRectKeyrightMove',
          hotkey: 'right',
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
          checkF: () => {
            return !me.mouse.ing && me._historyCanBack()
          },
          doF: '_historyBack',
          hotkey: 'command + z',
        },
        'sys-重做': {
          checkF: () => {
            return !me.mouse.ing && me._historyCanGo()
          },
          doF: '_historyGo',
          hotkey: 'command + shift + z',
        },
      }
    }
  },
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
    _actionRectKeyupMove () {
      this._updateRectTempData(this.currRectId)
      this._move(this.currRectId, 0, -1, false)
      this._historyPush()
    },
    _actionRectKeydownMove () {
      this._updateRectTempData(this.currRectId)
      this._move(this.currRectId, 0, 1, false)
      this._historyPush()
    },
    _actionRectKeyleftMove () {
      this._updateRectTempData(this.currRectId)
      this._move(this.currRectId, -1, 0, false)
      this._historyPush()
    },
    _actionRectKeyrightMove () {
      this._updateRectTempData(this.currRectId)
      this._move(this.currRectId, 1, 0, false)
      this._historyPush()
    },
    _actionRectSelectAll () {
      this._blurRect()
      this._walkCurrPageRects((rect) => {
        this._focusRect(rect, {shiftKey: true}, false)
      })
      this._updateCurrRectBySelected()
    },
    _actionCanGroup () {
      return this._actionGetInfo().isTempGroup
    },
    _actionGroup () {
      let currRect = this.objects[this.currRectId]
      let newGroup = this._createRect('group')
      let rects = this._getRectsByRectDeep(currRect)
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
      let rects = this._getRectsByRectDeep(currRect)
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
      this._getRectsByRectDeep(currRect).forEach(rect => {
        this._removeRectById(rect.id)
      })
      this._updateCurrRect()
      this._historyPush()
    },
    _actionCanRectCopy () {
      return this._actionGetInfo().rect
    },
    _actionRectCopy () {
      this._commandPropUpdate('clipboard.count', 0)
      this._commandPropUpdate('clipboard.data',
        this._getUnLockRectsBySelected().map(rect => this._cloneRectDeep(rect))
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
      return this.clipboard.data.length > 0
    },
    _actionRectPaste () {
      let pasteCount = ++ this.clipboard.count
      let moveDis = pasteCount * 20
      this._clearSelectedRects()
      // todo，粘贴的位置还得考虑
      this.clipboard.data.map(config => {
        let rect = this._createRectByConfig(config)
        this._addSelectedRect(rect)
        return rect
      })
      this._updateCurrRectBySelected()
      this._updateRectTempData(this.currRectId)
      this._move(this.currRectId, moveDis, moveDis)
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
      let action = this.actionMap[type]
      let checkF = action.checkF || (() => true)
      if (typeof checkF === 'string') {
        checkF = this[checkF]
      }
      let doF = action.doF || (() => {})
      if (typeof doF === 'string') {
        doF = this[doF]
      }
      let text = type.split('-')[1] || 'unknow'
      return {
        ...action,
        doF,
        checkF,
        text,
      }
    },
    _actionSetHotKey () {
      for (let type in this.actionMap) {
        let {checkF, doF, hotkey} = this._actionGet(type)
        if (hotkey) {
          this._hotkey(hotkey, (e) => {
            e.preventDefault()
            if (checkF.call(this)) {
              doF.call(this)
            }
          })
        }
      }
    }
  },
  mounted () {
    this._actionSetHotKey()
  }
}