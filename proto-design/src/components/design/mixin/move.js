import { tNumber } from "@/core/base"
export default {
  methods: {
    _move (rect, mx = 0, my = 0, isCheck = true) {
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
    _moveTo (rect, left = null, top = null) {
      let tempInfo = rect.tempData
      let mx = 0
      let my = 0
      if (left !== null){
        mx = left - tempInfo.left
      }
      if (top !== null){
        my = top - tempInfo.top
      }
      this._move(rect, mx, my, false)
    },
    _moveLeftTo (rect, left) {
      this._moveTo(rect, left)
    },
    _moveTopTo (rect, top) {
      this._moveTo(rect, null, top)
    },
    _moveRect (rect, mx = 0, my = 0) {
      let tempInfo = rect.tempData
      this._commandRectDataPropUpdate(rect, 'left', tNumber(tempInfo.left + mx))
      this._commandRectDataPropUpdate(rect, 'top', tNumber(tempInfo.top + my))
      if (rect.groupId){
        let group = this._getRectById(rect.groupId)
        this._updateGroupSize(group)
      }
    },
    _moveGroup (group, mx = 0, my = 0) {
      let f = (id) => {
        let rect = this._getRectById(id)
        let tempInfo = rect.tempData
        this._commandRectDataPropUpdate(rect, 'left', tNumber(tempInfo.left + mx))
        this._commandRectDataPropUpdate(rect, 'top', tNumber(tempInfo.top + my))
      }
      this._updateGroupState(group, f)
    },
  }
}