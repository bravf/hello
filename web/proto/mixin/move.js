export default {
  methods: {
    _move (mx = 0, my = 0, isCheck = true) {
      let rect = this.currRects[0]
      if (isCheck){
        [mx, my] = this._checkGuideOnMove(rect, mx, my)
      }
      if (this._checkIsGroupLike(rect)){
        this._moveGroup(rect, mx, my)
      }
      else {
        this._moveRect(rect, mx, my)
      }
    },
    _moveTo (left = null, top = null) {
      let rect = this.currRects[0]
      let tempInfo = rect.tempData
      let mx = 0
      let my = 0
      if (left !== null){
        mx = left - tempInfo.left
      }
      if (top !== null){
        my = top - tempInfo.top
      }
      this._move(mx, my, false)
    },
    _moveLeftTo (left) {
      this._moveTo(left)
    },
    _moveTopTo (top) {
      this._moveTo(null, top)
    },
    _moveRect (rect, mx = 0, my = 0) {
      let tempInfo = rect.tempData
      let data = rect.data
      data.left = tempInfo.left + mx
      data.top = tempInfo.top + my
      if (rect.groupId){
        let group = this._getRectById(rect.groupId)
        this._updateGroupSize(group)
      }
    },
    _moveGroup (group, mx = 0, my = 0) {
      let groupData = group.data
      let groupTempInfo = group.tempData
      groupData.left = groupTempInfo.left + mx
      groupData.top = groupTempInfo.top + my

      let f = (id) => {
        let rect = this._getRectById(id)
        let data = rect.data
        let tempInfo = rect.tempData
        data.left = tempInfo.left + mx
        data.top = tempInfo.top + my
      }
      this._updateGroupState(group, f)
    },
  }
}