import { 
  getRadian,
  getRotatePointByCenter,
} from '../../base'

import {
  getPointsCenter,
  getScalePoint,
  getWH,
} from './base'

let minLen = 10
let getWidthScale = (newWidth, width) => {
  return newWidth / width
}
// 获取辅助数据
let getResizeData = (rect) => {
  let data = rect.data
  let tempInfo = rect.tempData
  let angle = tempInfo.angle
  let radian = getRadian(angle)
  let tempWidth = tempInfo.width
  let tempHeight = tempInfo.height

  return {
    data,
    tempInfo,
    angle,
    radian,
    tempWidth,
    tempHeight,
  }
}

// 等比 resize
// mx 鼠标 x 方向移动的值
// my 鼠标 y 方向移动的值 
let resizeAR = (rect, mx = 0, my = 0) => {
  let {
    data,
    tempInfo,
    angle,
    tempWidth,
    radian,
  } = getResizeData(rect)
  let widthDiff =  - Math.cos(radian) * mx - Math.sin(radian) * my
  let newWidth = Math.max(widthDiff + tempWidth, minLen)
  let scale = getWidthScale(newWidth, tempWidth) 
  
  let rlt = tempInfo.rotateLeftTop
  let rrb = tempInfo.rotateRightBottom
  let newRlt = getScalePoint(rrb, rlt, scale)
  // 新的中心点
  let newCenter = getPointsCenter(newRlt, rrb)
  // 求新的left, top
  let newLt = getRotatePointByCenter(newCenter, newRlt, angle, false)
  let wh = getWH(newLt, newCenter)

  data.left = newLt.left
  data.top = newLt.top
  data.width = wh.width
  data.height = wh.height
  // 返回放大倍数和不动点
  return {
    scale,
    fixedPoint: rrb,
  }
}
let resizeBR = (rect, mx = 0, my = 0) => {
  let {
    data,
    tempInfo,
    angle,
    tempWidth,
    radian,
  } = getResizeData(rect, mx, my)
  let widthDiff = Math.cos(radian) * mx + Math.sin(radian) * my
  let newWidth = Math.max(widthDiff + tempWidth, minLen)
  let scale = getWidthScale(newWidth, tempWidth)

  let rrt = tempInfo.rotateRightTop
  let rlb = tempInfo.rotateLeftBottom
  let newRrt = getScalePoint(rlb, rrt, scale)
  // 新的中心点
  let newCenter = getPointsCenter(rlb, newRrt)
  // 求新的right, top
  let newRt = getRotatePointByCenter(newCenter, newRrt, angle, false)
  let wh = getWH(newRt, newCenter)
  let newLt = {
    left: newRt.left - wh.width,
    top: newRt.top
  }

  data.left = newLt.left
  data.top = newLt.top
  data.width = wh.width
  data.height = wh.height
  return {
    scale,
    fixedPoint: rlb,
  }
}
let resizeCR = (rect, mx = 0, my = 0) => {
  let {
    data,
    tempInfo,
    angle,
    tempWidth,
    radian,
  } = getResizeData(rect, mx, my)
  let widthDiff = Math.cos(radian) * mx + Math.sin(radian) * my
  let newWidth = Math.max(widthDiff + tempWidth, minLen)
  let scale = getWidthScale(newWidth, tempWidth)

  let rlt = tempInfo.rotateLeftTop
  let rrb = tempInfo.rotateRightBottom
  let newRrb = getScalePoint(rlt, rrb, scale)
  // 新的中心点
  let newCenter = getPointsCenter(rlt, newRrb)
  // 求新的left, top
  let newLt = getRotatePointByCenter(newCenter, rlt, angle, false)
  let wh = getWH(newLt, newCenter)

  data.left = newLt.left
  data.top = newLt.top
  data.width = wh.width
  data.height = wh.height
  return {
    scale,
    fixedPoint: rlt,
  }
}
let resizeDR = (rect, mx = 0, my = 0) => {
  let {
    data,
    tempInfo,
    angle,
    tempWidth,
    radian,
  } = getResizeData(rect, mx, my)
  let widthDiff = -Math.cos(radian) * mx - Math.sin(radian) * my
  let newWidth = Math.max(widthDiff + tempWidth, minLen)
  let scale = getWidthScale(newWidth, tempWidth)

  let rrt = tempInfo.rotateRightTop
  let rlb = tempInfo.rotateLeftBottom
  let newRlb = getScalePoint(rrt, rlb, scale)
  // 新的中心点
  let newCenter = getPointsCenter(rrt, newRlb)
  // 求新的right, top
  let newRt = getRotatePointByCenter(newCenter, rrt, angle, false)
  let wh = getWH(newRt, newCenter)
  let newLt = {
    left: newRt.left - wh.width,
    top: newRt.top
  }

  data.left = newLt.left
  data.top = newLt.top
  data.width = wh.width
  data.height = wh.height
  return {
    scale,
    fixedPoint: rrt,
  }
}
let resizeA = (rect, mx = 0, my = 0) => {
  let {
    data,
    tempInfo,
    angle,
    tempWidth,
    tempHeight,
    radian,
  } = getResizeData(rect, mx, my)
  let rrb = tempInfo.rotateRightBottom
  // 先算 width, height，然后对 wh 进行最小值保护，然后用 wh 求其他的值
  let widthDiff = - Math.cos(radian) * mx - Math.sin(radian) * my
  let heightDiff = Math.sin(radian) * mx - Math.cos(radian) * my
  let width = Math.max(widthDiff + tempWidth, minLen)
  let height = Math.max(heightDiff + tempHeight, minLen)
  // 根据 width, height, angle，rrb 算 rlt 的位置
  let newRlt = {
    left: 0,
    top: 0,
  }
  if (angle === 0){
    newRlt = {
      left: rrb.left - width,
      top: rrb.top - height,
    }
  }
  else if (angle === 90){
    newRlt = {
      left: rrb.left + height,
      top: rrb.top - width,
    }
  }
  else if (angle === 180) {
    newRlt = {
      left: rrb.left + width,
      top: rrb.top + height,
    }
  }
  else if (angle === 270){
    newRlt = {
      left: rrb.left - height,
      top: rrb.top + width,
    }
  }
  else {
    // 其他角度均用下面公式，特殊角度需要简化算法，因为特殊角度会使算法无效
    newRlt = {
      left: rrb.left - Math.cos(radian) * (width - Math.tan(radian) * height),
      top: rrb.top - (height / Math.cos(radian) + Math.sin(radian) * (width - Math.tan(radian) * height)),
    }
  }
  let newCenter = getPointsCenter(newRlt, rrb)
  // 求新的left, top
  let newLt = getRotatePointByCenter(newCenter, newRlt, angle, false)

  data.left = newLt.left
  data.top = newLt.top
  data.width = width
  data.height = height
  return {
    fixedPoint: rrb,
  }
}
let resizeAB = (rect, mx = 0, my = 0) => {
  let {
    data,
    tempInfo,
    angle,
    tempHeight,
    radian,
  } = getResizeData(rect, mx, my)
  // 求变化的高度
  let heightDiff = Math.sin(radian) * mx - Math.cos(radian) * my
  let newHeight = Math.max(tempHeight + heightDiff, minLen)
  heightDiff = newHeight - tempHeight

  // 求新的 rlt 坐标
  let rlt = tempInfo.rotateLeftTop
  let rrb = tempInfo.rotateRightBottom
  let newRlt = {
    left: rlt.left + Math.sin(radian) * heightDiff,
    top: rlt.top - Math.cos(radian) * heightDiff,
  }
  // 新的中心点
  let newCenter = getPointsCenter(newRlt, rrb)
  // 求新的left, top
  let newLt = getRotatePointByCenter(newCenter, newRlt, angle, false)

  data.left = newLt.left
  data.top = newLt.top
  data.height = newHeight
  return {
    fixedPoint: rrb,
  }
}
let resizeB = (rect, mx = 0, my = 0) => {
  let {
    data,
    tempInfo,
    angle,
    tempWidth,
    tempHeight,
    radian,
  } = getResizeData(rect, mx, my)
  let rlb = tempInfo.rotateLeftBottom
  // 先算 width, height，然后对 wh 进行最小值保护，然后用 wh 求其他的值
  let widthDiff = Math.cos(radian) * mx + Math.sin(radian) * my
  let heightDiff = Math.sin(radian) * mx - Math.cos(radian) * my
  let width = Math.max(widthDiff + tempWidth, minLen)
  let height = Math.max(heightDiff + tempHeight, minLen)
  // 根据 width, height, angle，rrb 算 rrt 的位置
  let newRrt = {
    left: 0,
    top: 0,
  }
  if (angle === 0){
    newRrt = {
      left: rlb.left + width,
      top: rlb.top - height,
    }
  }
  else if (angle === 90){
    newRrt = {
      left: rlb.left + height,
      top: rlb.top + width,
    }
  }
  else if (angle === 180) {
    newRrt = {
      left: rlb.left - width,
      top: rlb.top + height,
    }
  }
  else if (angle === 270){
    newRrt = {
      left: rlb.left - height,
      top: rlb.top - width,
    }
  }
  else {
    // 其他角度均用下面公式，特殊角度需要简化算法，因为特殊角度会使算法无效
    newRrt = {
      left: rlb.left + width / Math.cos(radian) + Math.sin(radian) * (height - Math.tan(radian) * width),
      top: rlb.top - Math.cos(radian) * (height - Math.tan(radian) * width)
    }
  }
  let newCenter = getPointsCenter(newRrt, rlb)
  // 求新的 rt
  let newRt = getRotatePointByCenter(newCenter, newRrt, angle, false)

  data.left = newRt.left - width
  data.top = newRt.top
  data.width = width
  data.height = height
  return {
    fixedPoint: rlb,
  }
}
let resizeBC = (rect, mx = 0, my = 0) => {
  let {
    data,
    tempInfo,
    angle,
    tempWidth,
    radian,
  } = getResizeData(rect, mx, my)
  // 求变化的宽度
  let widthDiff = Math.cos(radian) * mx + Math.sin(radian) * my
  let newWidth = Math.max(tempWidth + widthDiff, minLen)
  widthDiff = newWidth - tempWidth

  // 求新的 rrb 坐标
  let rlt = tempInfo.rotateLeftTop
  let rrb = tempInfo.rotateRightBottom
  let newRrb = {
    left: rrb.left + Math.cos(radian) * widthDiff,
    top: rrb.top + Math.sin(radian) * widthDiff,
  }
  // 新的中心点
  let newCenter = getPointsCenter(rlt, newRrb)
  // 求新的left, top
  let newLt = getRotatePointByCenter(newCenter, rlt, angle, false)

  data.left = newLt.left
  data.top = newLt.top
  data.width = newWidth
  return {
    fixedPoint: rlt,
  }
}
let resizeC = (rect, mx = 0, my = 0) => {
  let {
    data,
    tempInfo,
    angle,
    tempWidth,
    tempHeight,
    radian,
  } = getResizeData(rect, mx, my)
  let rlt = tempInfo.rotateLeftTop
  // 先算 width, height，然后对 wh 进行最小值保护，然后用 wh 求其他的值
  let widthDiff = Math.cos(radian) * mx + Math.sin(radian) * my
  let heightDiff = -Math.sin(radian) * mx + Math.cos(radian) * my
  let width = Math.max(widthDiff + tempWidth, minLen)
  let height = Math.max(heightDiff + tempHeight, minLen)
  let newRrb = {
    left: 0,
    top: 0,
  }
  if (angle === 0){
    newRrb = {
      left: rlt.left + width,
      top: rlt.top + height,
    }
  }
  else if (angle === 90){
    newRrb = {
      left: rlt.left - height,
      top: rlt.top + width,
    }
  }
  else if (angle === 180) {
    newRrb = {
      left: rlt.left - width,
      top: rlt.top - height,
    }
  }
  else if (angle === 270){
    newRrb = {
      left: rlt.left + height,
      top: rlt.top - width,
    }
  }
  else {
    // 其他角度均用下面公式，特殊角度需要简化算法，因为特殊角度会使算法无效
    newRrb = {
      left: rlt.left  + Math.cos(radian) * (width - Math.tan(radian) * height),
      top: rlt.top + height / Math.cos(radian) + Math.sin(radian) * (width - Math.tan(radian) * height),
    }
  }
  let newCenter = getPointsCenter(newRrb, rlt)
  let newLt = getRotatePointByCenter(newCenter, rlt, angle, false)

  data.left = newLt.left
  data.top = newLt.top
  data.width = width
  data.height = height
  return {
    fixedPoint: rlt,
  }
}
let resizeCD = (rect, mx = 0, my = 0) => {
  let {
    data,
    tempInfo,
    angle,
    tempWidth,
    tempHeight,
    radian,
  } = getResizeData(rect, mx, my)
  // 求变化的高度
  let heightDiff = -Math.sin(radian) * mx + Math.cos(radian) * my
  let newHeight = Math.max(tempHeight + heightDiff, minLen)
  heightDiff = newHeight - tempHeight

  // 求新的 rlt 坐标
  let rrt = tempInfo.rotateRightTop
  let rlb = tempInfo.rotateLeftBottom
  let newRlb = {
    left: rlb.left - Math.sin(radian) * heightDiff,
    top: rlb.top + Math.cos(radian) * heightDiff,
  }
  // 新的中心点
  let newCenter = getPointsCenter(newRlb, rrt)
  // 求新的left, top
  let newRt = getRotatePointByCenter(newCenter, rrt, angle, false)

  data.left = newRt.left - tempWidth
  data.top = newRt.top
  data.height = newHeight
  return {
    fixedPoint: rrt,
  }
}
let resizeD = (rect, mx = 0, my = 0) => {
  let {
    data,
    tempInfo,
    angle,
    tempWidth,
    tempHeight,
    radian,
  } = getResizeData(rect, mx, my)
  let rrt = tempInfo.rotateRightTop
  // 先算 width, height，然后对 wh 进行最小值保护，然后用 wh 求其他的值
  let widthDiff = -Math.cos(radian) * mx - Math.sin(radian) * my
  let heightDiff = -Math.sin(radian) * mx + Math.cos(radian) * my
  let width = Math.max(widthDiff + tempWidth, minLen)
  let height = Math.max(heightDiff + tempHeight, minLen)
  let newRlb = {
    left: 0,
    top: 0,
  }
  if (angle === 0){
    newRlb = {
      left: rrt.left - width,
      top: rrt.top + height,
    }
  }
  else if (angle === 90){
    newRlb = {
      left: rrt.left - height,
      top: rrt.top - width,
    }
  }
  else if (angle === 180) {
    newRlb = {
      left: rrt.left + width,
      top: rrt.top - height,
    }
  }
  else if (angle === 270){
    newRlb = {
      left: rrt.left + height,
      top: rrt.top + width,
    }
  }
  else {
    // 其他角度均用下面公式，特殊角度需要简化算法，因为特殊角度会使算法无效
    newRlb = {
      left: rrt.left - (width / Math.cos(radian) + Math.sin(radian) * (height - Math.tan(radian) * width)),
      top: rrt.top + Math.cos(radian) * (height - Math.tan(radian) * width)
    }
  }
  let newCenter = getPointsCenter(newRlb, rrt)
  // 求新的 rt
  let newRt = getRotatePointByCenter(newCenter, rrt, angle, false)

  data.left = newRt.left - width
  data.top = newRt.top
  data.width = width
  data.height = height
  return {
    fixedPoint: rrt,
  }
}
let resizeAD = (rect, mx = 0, my = 0) => {
  let {
    data,
    tempInfo,
    angle,
    tempWidth,
    radian,
  } = getResizeData(rect, mx, my)
  // 求变化的宽度
  let widthDiff = -Math.cos(radian) * mx - Math.sin(radian) * my
  let newWidth = Math.max(tempWidth + widthDiff, minLen)
  widthDiff = newWidth - tempWidth

  // 求新的 rrb 坐标
  let rlt = tempInfo.rotateLeftTop
  let rrb = tempInfo.rotateRightBottom
  let newRlt = {
    left: rlt.left - Math.cos(radian) * widthDiff,
    top: rlt.top - Math.sin(radian) * widthDiff,
  }
  // 新的中心点
  let newCenter = getPointsCenter(rrb, newRlt)
  // 求新的left, top
  let newLt = getRotatePointByCenter(newCenter, newRlt, angle, false)

  data.left = newLt.left
  data.top = newLt.top
  data.width = newWidth
  return {
    fixedPoint: rrb,
  }
}
export {
  resizeAR,
  resizeBR,
  resizeCR,
  resizeDR,
  resizeA,
  resizeAB,
  resizeB,
  resizeBC,
  resizeC,
  resizeCD,
  resizeD,
  resizeAD,
}