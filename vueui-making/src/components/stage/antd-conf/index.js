import form from './form'
import formItem from './formItem'
import input from './input'
import button from './button'
import tabs from './tabs'
export default {
  'a-button-group': {},
  ...button,
  ...input,
  ...form,
  ...formItem,
  'a-icon': {},
  'a-layout': {},
  'a-layout-header': {},
  'a-layout-content': {},
  'a-layout-sider': {},
  
  'a-menu': {},
  'a-sub-menu': {},
  'a-menu-item-group': {},
  'a-menu-item': {},

  ...tabs,

  'a-row': {},
  'a-col': {},

  'a-tooltip': {},

  'a-radio-group': {},
  'a-radio-button': {},
  'a-radio': {},

  'a-modal': {},
}