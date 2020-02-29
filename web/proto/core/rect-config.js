let color = {
  blue: '#2486ff',
  red: '#f4615c',
  gray: '#ddd',
  white: '#fff',
}
let base = {
  top: 0,
  left: 0,
  width: 200,
  height: 100,
  angle: 0,
  zIndex: 0,
  text: '',
  color: '#000',
  backgroundColor: '#fff',
  borderRadius: 0,
  border: `1px solid ${color.gray}`,
  // 是否编辑
  isEdit: false,
  // 是否打开，group 专用
  isOpen: false,
  // 是否内容自适应，一般 text 专用
  isAutoSize: false,
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
  backgroundColor: '',
  border: null,
  text: '双击编辑文本',
  width: 84,
  height: 20,
  isAutoSize: true,
}

export {
  rect,
  circle,
  text,
  group,
  tempGroup,
}