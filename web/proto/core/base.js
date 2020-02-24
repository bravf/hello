import {
  sum,
  empty,
  getTextWidth,
  walkTree,
  checkRectOverlap,
  treeParentManager,
  getRotatePointByCenter,
  getCByABAndAngle,
  getABByPointsAndAngle,
  getAngle,
  tNumber,
  getAngleByTwoPoints,
  getEffectiveAngle,
  getRadian,
  deepClone,
  getUuid,
} from '../../base'

let getRectInfo = (rectData) => {
  let {left, top, width, height, angle} = rectData
  let center = {
    left: left + width / 2,
    top: top + height / 2,
  }
  let leftTop = {
    left,
    top,
  }
  let leftBottom = {
    left,
    top: top + height
  }
  let rightTop = {
    left: left + width,
    top,
  }
  let rightBottom = {
    left: left + width,
    top: top + height,
  }

  let rotateLeftTop = getRotatePointByCenter(center, leftTop, angle)
  let ra = rotateLeftTop

  let rotateLeftBottom = getRotatePointByCenter(center, leftBottom, angle)
  let rd = rotateLeftBottom

  let rotateRightTop = getRotatePointByCenter(center, rightTop, angle)
  let rb = rotateRightTop

  let rotateRightBottom = getRotatePointByCenter(center, rightBottom, angle)
  let rc = rotateRightBottom

  return {
    center,
    leftTop,
    leftBottom,
    rightTop,
    rightBottom,
    rotateRightTop,
    rotateLeftTop,
    rotateLeftBottom,
    rotateRightBottom,
    ra,
    rb,
    rc,
    rd,
    ...rectData,
  }
}
let getGroupSize = (rects, angle) => {
  // 得到所有矩形的点的真实坐标
  let points = []
  rects.forEach(rect => {
    let info = getRectInfo(rect.data)
    points = [
      ...points,

      info.rotateLeftTop,
      info.rotateRightTop,
      info.rotateLeftBottom,
      info.rotateRightBottom,
    ]
  })
  // 根据上面的点得到4个点
  let ab = getABByPointsAndAngle(points, angle)
  // 得到 group 左上角的点
  let rlt = getCByABAndAngle(
    ab.a,
    ab.b,
    angle
  )
  // 得到 group 右下角的点
  let rrb = getCByABAndAngle(
    ab.a2,
    ab.b2,
    angle,
  )
  // 计算中心点
  let center = {
    left: rlt.left + (rrb.left - rlt.left) / 2,
    top: rrb.top - (rrb.top - rlt.top) / 2,
  }
  // 根据角度判断 rlt,rrb 谁是 lt 的真实坐标
  // 得到 lt, lt是罗辑坐标点
  let lt = getRotatePointByCenter(
    center, 
    (angle > 90 && angle <= 270)
      ? rrb
      : rlt,
    angle,
    false,
  )
  let width = Math.abs(center.left - lt.left) * 2
  let height = Math.abs(center.top - lt.top) * 2

  return {
    left: tNumber(lt.left),
    top: tNumber(lt.top),
    width: tNumber(width),
    height: tNumber(height),
  }
}
// 已知a,b两点，a固定，b到a的距离放大 m 倍
// 求等比放大后 b 点的位置
let getScalePoint = (a, b, m) => {
  return {
    left: (b.left - a.left) * m + a.left,
    top: (b.top - a.top) * m + a.top,
  }
}
let getPointsCenter = (a, b) => {
  return {
    left: tNumber(a.left + (b.left - a.left) / 2),
    top: tNumber(a.top + (b.top - a.top) / 2),
  }
}
let getWH = (a, c) => {
  return {
    width: Math.abs(c.left - a.left) * 2,
    height: Math.abs(c.top - a.top) * 2,
  }
}
let getMousePoint = (e) => {
  let doc = document.documentElement
  return {
    left: e.clientX + doc.scrollLeft,
    top: e.clientY + doc.scrollTop,
  }
}

export  {
  getRectInfo,
  getGroupSize,
  getScalePoint,
  getPointsCenter,
  getWH,
  getMousePoint,
  // common base
  sum,
  empty,
  getTextWidth,
  walkTree,
  checkRectOverlap,
  treeParentManager,
  getRotatePointByCenter,
  getCByABAndAngle,
  getABByPointsAndAngle,
  getAngle,
  tNumber,
  getAngleByTwoPoints,
  getEffectiveAngle,
  getRadian,
  deepClone,
  getUuid,
}