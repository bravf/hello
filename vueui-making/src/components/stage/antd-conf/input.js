export default {
  'a-input': {
    props: {
      "addonAfter": {
        "desc": "带标签的 input，设置后置标签",
        "type": "string|slot",
        "default": ""
      },
      "addonBefore": {
        "desc": "带标签的 input，设置前置标签",
        "type": "string|slot",
        "default": ""
      },
      "defaultValue": {
        "desc": "输入框默认内容",
        "type": "string",
        "default": ""
      },
      "disabled": {
        "desc": "是否禁用状态，默认为 false",
        "type": "boolean",
        "default": "false"
      },
      "id": {
        "desc": "输入框的 id",
        "type": "string",
        "default": ""
      },
      "maxLength": {
        "desc": "最大长度",
        "type": "number",
        "default": ""
      },
      "prefix": {
        "desc": "带有前缀图标的 input",
        "type": "string|slot",
        "default": ""
      },
      "size": {
        "desc": "控件大小。注：标准表单内的输入框大小限制为 large。可选 large default small",
        "type": ['large', 'default', 'small'],
        "default": "default"
      },
      "suffix": {
        "desc": "带有后缀图标的 input",
        "type": "string|slot",
        "default": ""
      },
      "type": {
        "desc": "声明 input 类型，同原生 input 标签的 type 属性，见：MDN(请直接使用 Input.TextArea 代替 type=\"textarea\")。",
        "type": "string",
        "default": "text"
      },
      "value(v-model)": {
        "desc": "输入框内容",
        "type": "string",
        "default": ""
      },
      "allowClear": {
        "desc": "可以点击清除图标删除内容",
        "type": "boolean",
        "default": ""
      }
    }
  }
}