export default {
  methods: {
    _move (mx = 0, my = 0) {
      let rect = this.currentRects[0]
      // let res = this._checkGuideOnMove(rect, mx, my)
      // mx = res.mx
      // my = res.my
      ;[mx, my] = this._checkGuideOnMove(rect, mx, my)
      if (rect.type === 'group'){
        this._moveGroup(rect, mx, my)
      }
      else {
        this._moveRect(rect, mx, my)
      }
    },
    _moveRect (rect, mx = 0, my = 0) {
      let tempInfo = rect.tempData
      let data = rect.data
      data.left = tempInfo.left + mx
      data.top = tempInfo.top + my
      if (rect.parent){
        let group = this._getRectById(rect.parent)
        let groupSize = this._updateGroupSize(group)
        group.data = {...group.data, ...groupSize}
      }
    },
    _moveGroup (group, mx = 0, my = 0) {
      let groupData = group.data
      let groupTempInfo = group.tempData
      groupData.left = groupTempInfo.left + mx
      groupData.top = groupTempInfo.top + my

      group.children.forEach(id => {
        let rect = this._getRectById(id)
        let data = rect.data
        let tempInfo = rect.tempData
        data.left = tempInfo.left + mx
        data.top = tempInfo.top + my
      })
    },
  }
}