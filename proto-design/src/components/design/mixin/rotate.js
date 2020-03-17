import {
  getRotatePointByCenter,
  getAngleByTwoPoints,
  getEffectiveAngle,
  getRectInfo,
  tNumber,
} from '@/core/base'

export default {
  methods: {
    _rotate (mousePoint) {
      let rect = this.objects[this.currRectId]
      let info = getRectInfo(rect.data)
      let tempInfo = rect.tempData
      let oldAngle = tempInfo.angle
      let nowAngle = info.angle
      let newAngle =  parseInt(getAngleByTwoPoints(mousePoint, info.center))
      let angleDiff = newAngle - oldAngle
      angleDiff = this._checkGuideOnRotate(oldAngle, nowAngle, newAngle, angleDiff)

      if (this._checkIsGroupLike(rect)){
        this._rotateGroup(rect, angleDiff)
      }
      else {
        this._rotateRect(rect, angleDiff)
      }
    },
    _rotateTo (rect, angle) {
      let tempInfo = rect.tempData
      let angleDiff = angle - tempInfo.angle

      if (this._checkIsGroupLike(rect)){
        this._rotateGroup(rect, angleDiff)
      }
      else {
        this._rotateRect(rect, angleDiff)
      }
    },
    _rotateRect (rect, angleDiff) {
      this._commandRectDataPropUpdate(rect, 'angle', getEffectiveAngle(rect.tempData.angle + angleDiff))
      // rect.data.angle = getEffectiveAngle(rect.tempData.angle + angleDiff)
      // 同步 group
      if (rect.groupId){
        let group = this._getRectById(rect.groupId)
        this._updateGroupSize(group)
      }
    },
    _rotateGroup (group, angleDiff) {
      let groupTempInfo = group.tempData
      let groupCenter = groupTempInfo.center
      this._commandRectDataPropUpdate(group, 'angle', getEffectiveAngle(groupTempInfo.angle + angleDiff))
      let f = (id) => {
        let rect = this._getRectById(id)
        let tempInfo = rect.tempData
        let center = getRotatePointByCenter(groupCenter, tempInfo.center, angleDiff)
        let left = center.left - tempInfo.width / 2
        let top = center.top - tempInfo.height / 2

        this._commandRectDataPropUpdate(rect, 'left', tNumber(left))
        this._commandRectDataPropUpdate(rect, 'top', tNumber(top))
        this._commandRectDataPropUpdate(rect, 'angle', getEffectiveAngle(tempInfo.angle + angleDiff))
      }
      this._updateGroupState(group, f, true)
    },
  }
}