import Vue from 'vue'
import jsx from 'vue-jsx'
import mindmap from './index.vue'
import testData from './testData'
import {
  walkTree, 
  empty,
} from '../base/index'

window.data = [
  {
    name: '根节点',
    children: [
      {
        name: '节点1-1哈哈哈哈哈哈哈哈哈',
        children: [
          {
            name: '节点1-1-1',
          }
        ]
      },
      {
        name: '节点1-2',
        children: [
          {
            name: '节点1-2-1',
          },
          {
            name: '节点1-2-2',
          },
          {
            name: '节点1-2-3',
          }
        ]
      },
      {
        name: '节点1-3',
      }
    ]
  }
]
window.data = testData
//  var data = 
var {div, button} = jsx

setTimeout(() => {
  app.mindmapData = data[0]
})

var app = new Vue({
  el: '#app',
  components: {
    mindmap,
  },
  data () {
    return {
      mindmapData: null,//data[0],
      category: [
        {label:'城市', value:1},
        {label:'区域', value:2}, 
        {label:'商圈', value:3}, 
        {label:'门店', value:4}, 
        {label:'项目', value:5},
      ]
    }
  },
  render (h) {
    jsx.h = h
    var me = this

    return jsx.div({
      style_margin: '10px',
    },
      div(
        this.category.map(o => {
          return button({
            on_click () {
              var $mindmap = me.$refs.mindmap
              walkTree(
                me.mindmapData[0],
                (o2) => {
                  $mindmap.closeFolder(o2)
                },
                empty,
                false,
              )
              walkTree(
                me.mindmapData[0], 
                (o2) => {
                  $mindmap.openFolder(o2)
                },
                empty,
                false,
                o.value,
              )
            }
          }, o.label)
        })
      ),
      jsx.create('mindmap', {
        props_data: this.mindmapData,
        ref: 'mindmap',
        // props_editable: false,
      }),
    )
  }
})