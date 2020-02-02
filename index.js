import Vue from 'vue'
import jsx from 'vue-jsx'
import tree from './tree.vue'
import testData from './treeData'

var data = [
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
data = testData
//  var data = 

var app = new Vue({
  el: '#app',
  components: {
    tree,
  },
  render (h) {
    jsx.h = h
    return jsx.div({
      // style_margin: '100px',
    },
      jsx.create('tree', {
        props_data: data,
        // props_editable: false,
      })
    )
  }
})