import color from './color'
let base = {
  top: 0,
  left: 0,
  width: 200,
  height: 100,
  angle: 0,
  zIndex: 0,
  text: '',
  color: color.black,
  fontSize: 12,
  fontFamily: 'SourceHanSansSC',
  backgroundColor: color.white,
  borderRadius: 0,
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: color.black,
  // 是否编辑
  isEdit: false,
  // 是否打开，group 专用
  isOpen: false,
}

// 默认矩形
let rect = {
  ...base,
}
let circle = {
  ...base,
  borderRadius: '100%',
  width: 100,
}
let group = {
  ...base,
}
let tempGroup = {
  ...base,
}
let text = {
  ...base,
  border: null,
  text: '双击编辑文本',
  width: 72,
  height: 17,
  isAutoSize: true,
  borderWidth: 0,
}
let line = {
  ...base,
  backgroundColor: color.gray,
  borderWidth: 1,
  height: 1,
  isAngleLock: false,
}
export {
  rect,
  circle,
  text,
  group,
  tempGroup,
  line,
}