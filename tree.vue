<style>
.context-menu{
  position: absolute;
  border: 1px solid #999;
  width: 60px;
  padding: 5px;
  margin-top: 5px;
  z-index: 10000;
  background: #fff;
}
.context-menu div{
  line-height: 1.5;
  cursor: pointer;
}
.context-menu div:hover{
  color:red;
}
.node{
  position: absolute;
  text-align: center;
  user-select: none;
  background: #fff;
}
.node-jump-area{
  position: absolute;
  background: #ddd;
}
.node-current{
  outline: 1px solid #000;
}
.node-overlap{
  outline: 1px solid red;
}
</style>

<script>
import jsx from 'vue-jsx'

var {div, span, input} = jsx

var canvasWidth = 1200
var canvasHeight = 1200
var nodeWidth = 100
var nodeHeight = 26
var nodeXPaddding = 50
var nodeYPadding = 100
var textWidthPadding = 20
var emptyFn = () => {}
var sumFn = (sum, n) => {return sum + n}
var bodyFont = window.getComputedStyle(document.body).font
var getTextWidth = (text, font = bodyFont) => {
  var span = getTextWidth.span
  if (!span) {
    span = getTextWidth.span = document.createElement('span')
    span.style.font = font
    span.style.display = 'inline-block'
    span.style.position = 'absolute'
    span.style.top = '-1000px'
    document.body.appendChild(span)
  }
  span.innerHTML = text
  return parseFloat(window.getComputedStyle(span).width)
}
var cached = (fn) => {
  // return (...args) => {
  //   return fn(...args)
  // }
  var cache = null
  var useCache = false

  return {
    get () {
      if (useCache){
        return cache
      }
      // cache = 
    }
  }
}
var nodeRemove = (parent, node) => {
  var parentChildren = parent.children || (parent.children = [])
  parentChildren.splice(parentChildren.indexOf(node), 1)
}
var nodeAdd = (parent, node) => {
  var parentChildren = parent.children || (parent.children = [])
  parentChildren.push(node)
  node.parent = parent
}
var nodeMove = (children, f, t) => {
  var node = children.splice(f, 1)[0]
  children.splice(t > f ? t - 1 : t, 0, node)
}
var nodeZIndex = 100
var currNode = []
// 拖动触发被重叠的node
var overlapNode = null
// 拖动触发被插队的node
var queueJumpNode = null
var queueJumpDir = null
// _x: left
// _y: top
// _dx: x 偏移量
// _dy: y 偏移量
// _dxx: _dx 的临时量，拖动用
// _dyy: _dy 的临时量，拖动用
// _w: width 只算自身
// _h: height 包含子节点
// _i: 是否显示 input
// _e: 是否展开
// _d: 是否被拖动过，如果 true 则 _x, _y 不再参与自动计算
// _o: 是否和当前拖动的节点重叠
// _j: 是否被触发被插队
// _z: zindex
export default {
  props: {
    data: {
      type: Array,
      default () {
        return []
      },
    }
  },
  data () {
    return {
      hook: 0,
      showContextMenu: false,
      drag: {
        // mousedown 时候 ready
        ready: false,
        // 超过防抖时候才真正进入拖动状态
        ing: false,
        startX: 0,
        startY: 0,
      }
    }
  },
  methods: {
    _walkSelf (o, onBefore = emptyFn, onAfter = emptyFn) {
      var go = (o, parent, z) => {
        // 当前深度
        z = z || 0
        // 儿子们计算完的结果集
        var childrenResult = []
    
        onBefore(o, parent, z)

        if ( (o['_e'] !== false) && o.children && o.children.length){
          childrenResult = o.children.map(i => go(i, o, z + 1))
        }
    
        return onAfter(o, parent, childrenResult, z)
      }
    
      return go(o)
    },
    _initData () {
      this._walkSelf(this.rootData, (o, parent, z) => {
        o.parent = parent
      })
    },
    _getTextWidth (name) {
      return getTextWidth(name) + textWidthPadding
    },
    _resetNodeWidth (o) {
      o['_w'] = this._getTextWidth(o.name)
    },
    _setPositions () {
      // 得出每个节点（包含子节点）真正的高
      // 得出每个节点自身的宽
      this._walkSelf(this.rootData, emptyFn, (o, parent, childrenResult) => {
        o['_h'] = ((o['_e'] !== false) && childrenResult.length) ? 
          childrenResult.reduce(sumFn) : this.realNodeHeight
        
          // 缓存一下
        if (!o['_w']){
          this._resetNodeWidth(o)
        }
        return o['_h']
      })

      this._walkSelf(this.rootData, (o, parent) => {
        // root 节点
        if (!parent){
          o['_x'] = 10
          o['_y'] = (Math.max(o['_h'], canvasHeight) - nodeHeight) / 2
        }
        else {
          var parentP = this._getNodePosition(parent)
          var parentX = parentP.x
          var parentY = parentP.y
          var children = parent.children
          var i = children.indexOf(o)

          o['_x'] = parentX + nodeXPaddding + parent['_w']
          o['_y'] = parentY - parent['_h'] / 2 + o['_h'] / 2 + [0].concat(children.slice(0, i).map(a => a['_h'])).reduce(sumFn)
        }
      })
    },
    _getNodePosition (node) {
      // 得到 node 真正的位置，加上了拖动的偏移量
      var x = node['_x'] + (node['_dx'] || 0)
      var y = node['_y'] + (node['_dy'] || 0)
      return {x, y}
    },
    _getNodeSelfSize (node) {
      var xy = this._getNodePosition(node)
      var left = xy.x
      var top = xy.y
      var w = node['_w']
      var h = nodeHeight
      var right = left + w
      var bottom = top + h
      return {left, top, right, bottom, w, h}
    },
    _isRectOverlap (r1, r2) {
      // 两个矩形是否重叠
      // 求两个矩形外包围的长宽
      var width = Math.abs(Math.max(r1.right, r2.right) - Math.min(r1.left, r2.left))
      var height = Math.abs(Math.max(r1.bottom, r2.bottom) - Math.min(r1.top, r2.top))

      // 两个矩形长宽的和
      var rectMaxWidth = r1.w + r2.w
      var rectMaxHeight = r1.h + r2.h

      // 如果相交，必须满足外包围的长短必须同时小于两个矩形长宽的和
      return (width < rectMaxWidth) && (height < rectMaxHeight)
    },
    _clearJumpNode () {
      if (queueJumpNode){
        queueJumpNode['_j'] = false
        queueJumpNode = null
        queueJumpDir = null
      }
    },
    _clearOverlapNode () {
      if (overlapNode){
        overlapNode['_o'] = false
        overlapNode = null
      }
    },
    _isDeepParent (a ,b) {
      // a是否是b的祖先类
      var bParent = b.parent
      while(bParent){
        if (bParent === a){
          return true
        }
        bParent = bParent.parent
      }
      return false
    },
    _isCurrNodeSameParent () {console.log('_isCurrNodeSameParent')
      if (!currNode.length) {
        return false
      }
      var parent = currNode[0].parent
      return currNode.every(node => {
        return node.parent === parent
      })
    },
    _getCurrNodeParentNode () {console.log('_getCurrNodeParentNode')
      // 从currNode中筛选，如果某个子节点的祖先节点也在，那么排除掉这个节点
      return currNode.filter(node => {
        return currNode.every(i => {
          return !this._isDeepParent(i, node)
        })
      })
    },
    _calRelationship () {console.log('_calRelationship')
      this._walkSelf(this.rootData, (o, parent) => {
        if (currNode.includes(o)){
          return
        }

        var oSize = this._getNodeSelfSize(o)

        // 判断 overlap
        var isOverlap = currNode.some(node => {
          var currNodeSize = this._getNodeSelfSize(node)
          return this._isRectOverlap(currNodeSize, oSize)
        })
        if (isOverlap){
          overlapNode = o
          o['_o'] = true
        }
        else {
          o['_o'] = false
        }

        if (overlapNode && overlapNode['_o']){
          // 如果有 overlap 则清空 jump，并且不再进行 jump 判断
          this._clearJumpNode()
          return
        }

        // 判断插队
        // currNode 必须都是兄弟节点才行
        if ( (o.parent === currNode[0].parent) && this._isCurrNodeSameParent()){
          // 检查前向情况
          var oBeforeSize = {...oSize}
          oBeforeSize.top -= nodeHeight
          oBeforeSize.bottom -= nodeHeight

          var isBeforeJump = currNode.some(node => {
            var currNodeSize = this._getNodeSelfSize(node)
            return this._isRectOverlap(currNodeSize, oBeforeSize)
          })

          if (isBeforeJump){
            queueJumpNode = o
            queueJumpDir = 'before'
            o['_j'] = true
            return
          }
          else {
            o['_j'] = false
          }

          // 检查后项情况
          var oAfterSize = {...oSize}
          oAfterSize.top += nodeHeight
          oAfterSize.bottom += nodeHeight

          var isAfterJump = currNode.some(node => {
            var currNodeSize = this._getNodeSelfSize(node)
            return this._isRectOverlap(currNodeSize, oAfterSize)
          })

          if (isAfterJump){
            queueJumpNode = o
            queueJumpDir = 'after'
            o['_j'] = true
          }
          else {
            o['_j'] = false
          }
        }
      })
    },
    _renderLine (x, y, width, angle) {
      return div({
        style_height: '1px',
        style_width: width + 'px',
        style_transform: `rotate(${angle}deg)`,
        style_border: '1px solid #73a1bf',
        style_position: 'absolute',
        style_left: x + 'px',
        style_top: y + 'px',
      })
    },
    _renderNode (o, parent) {
      var me = this
      var $expand = span({
        vif: !!(o.children && o.children.length),
        'style_padding-right': '4px',
        style_cursor: 'pointer',
        on_mousedown (e) {
          o['_e'] =  (o['_e'] === false) ? true : false
          e.stopPropagation()
          me.hook ++
        },
        on_dblclick (e) {
          e.stopPropagation()
        },
      }, o['_e'] === false ? '+' : '-')

      var $input = input({
        vif: o['_i'] === true,
        style_position: 'absolute',
        style_top: 0,
        style_left: 0,
        style_width: o['_w'] + 'px',
        style_height: nodeHeight + 'px',
        'style_line-height': nodeHeight + 'px',
        'style_z-index': 10,
        domProps_value: o.name,
        ref: 'input',
        on_blur (e) {
          o['_i'] = false
          var newName = e.target.value.trim()
          if (newName && (newName !== o.name)){
            o.name = newName
            me._resetNodeWidth(o)
          }
          me.hook ++
        },
        on_keydown (e) {
          var isEnter = e.keyCode == 13
          var input = e.target

          if (isEnter){
            input.blur()
          }
          else {
            input.style.width = Math.max(me._getTextWidth(input.value), o['_w']) + 'px'
          }
        }
      })

      var $jumpArea = div({
        vif: (o === queueJumpNode) && (o['_j'] === true),
        'class_node-jump-area': true,
        style_left: 0,
        style_top: (queueJumpDir === 'before') ? `-${nodeHeight}px` : `${nodeHeight}px`,
        style_width: o['_w'] + 'px',
        style_height: nodeHeight + 'px',
      })

      if (o['_i']){
        setTimeout(() => {
          var input = this.$refs.input
          if (input){
            input.select()
          }
        })
      }

      var isCurrent = currNode.includes(o)
      var {x, y} = this._getNodePosition(o)

      return div({
        style_left: x + 'px',
        style_top: y + 'px',
        style_width: o['_w'] + 'px',
        style_height: nodeHeight + 'px',
        'style_line-height': nodeHeight + 'px',
        'style_z-index': o['_z'] || 0,
        class_node: true,
        'class_node-current': isCurrent,
        'class_node-overlap': (o === overlapNode) && (o['_o'] === true),
        attrs_type: 'node',
        on_mousedown (e) {console.log('node mousedown', e)
          if (e.metaKey){
            if (!currNode.includes(o)){
              currNode.push(o)
            }
            else {
              currNode.splice(currNode.indexOf(o), 1)
            }
          }
          else {
            if (!currNode.includes(o)){
              currNode = [o]
            }
          }
          
          me.drag.ready = true
          me.drag.ing = false
          me.drag.startX = e.clientX
          me.drag.startY = e.clientY
          o['_z'] = nodeZIndex ++
          me.showContextMenu = false
          me.hook ++
          e.stopPropagation()
        },
        on_click (e) {console.log('node click')
          if (me.drag.ing) {
            return
          }
          if (!e.metaKey && !(currNode.length === 1 && currNode[0] === o)){
            currNode = [o]
            me.hook ++
          }
        },
        on_dblclick () {
          o['_i'] = true
          me.hook ++
        }
      }, $expand, span(o.name), $input, $jumpArea)
    },
    _renderNodes () {
      var nodes = []
      this._walkSelf(this.rootData, (o, parent) => {
        var op = this._getNodePosition(o)
        nodes.push(this._renderNode(o, parent))

        if ((o['_e'] !== false) && o.children){
          nodes.push(...o.children.map(child => {
            var childP = this._getNodePosition(child)
            var w = childP.x - op.x - o['_w']
            var h = childP.y - op.y 
            var length = Math.sqrt(w * w + h * h)
            var centerX = op.x + o['_w'] + w / 2
            var centerY = op.y + nodeHeight / 2 + h / 2
            var x = centerX - length / 2  
            var angle = Math.atan(h / w) / Math.PI * 180
            return this._renderLine(x, centerY, length, angle)
          }))
        }
      })
      return nodes
    },
    _renderContextMenu () {
      var me = this
      if (!this.showContextMenu) return null

      var {x, y} = this._getNodePosition(currNode[0])
      return div({
        'class_context-menu': true,
        style_left: x + 'px',
        style_top: y + nodeHeight + 'px',
      }, 
        div({
          on_mousedown (e) {
            e.stopPropagation()
            me._addNode()
          }
        }, '新增'),
        div({
          on_mousedown (e) {
            e.stopPropagation()
            me._removeNode()
          }
        }, '删除'),
      )
    },
    _renderMain () {
      var me = this
      this._setPositions()
      return div({
        class_tree: true,
        style_width: canvasWidth + 'px',
        style_height: canvasHeight + 'px',
        style_border: '1px solid red',
        style_position: 'relative',
        style_overflow: 'auto',
        on_mousedown (e) {
          currNode = []
          me.showContextMenu = false
          setTimeout(() => {
            me.hook ++
          })
        },
        on_mousemove (e) {
          var drag = me.drag
          if (!drag.ready){
            return false
          }

          var x = e.clientX
          var y = e.clientY

          var diffx = x - drag.startX
          var diffy = y - drag.startY

          // 误差超过 10px 表示真的要拖动，防抖
          if (Math.abs(diffx) > 10 || Math.abs(diffy) > 10){
            drag.ing = true
            me._getCurrNodeParentNode().forEach(node => {
              node['_dx'] = (node['_dxx'] || 0) + diffx
              node['_dy'] = (node['_dyy'] || 0) + diffy
            })

            me._calRelationship()
            me.hook ++
          }
        },
        on_mouseup () {
          console.log('main mouseup')
          if (me.drag.ing){
            me._getCurrNodeParentNode().forEach(node => {
              node['_dxx'] = node['_dx']
              node['_dyy'] = node['_dy']
            })
            
            // 查看是否有 overlapNode
            if (overlapNode){
              if (overlapNode['_o']){
                me._moveNode()
              }
              me._clearOverlapNode()
            }

            // 查看 queueJumpNode
            if (queueJumpNode){
              if (queueJumpNode['_j']){
                me._jumpNode()
              }
              me._clearJumpNode()
            }

            me.hook ++
          }
          me.drag.ready = false
        },
      }, ...this._renderNodes(), this._renderContextMenu())
    },
    _resetDiff (o) {
      // 重置节点的偏移
      o['_dx'] = o['_dxx'] = 0
      o['_dy'] = o['_dyy'] = 0
    },
    _isNode (target) {
      var ret = false
      var root = document.body

      while (target !== root){
        if (target.getAttribute('type') === 'node'){
          ret = true
          break
        }
        target = target.parentElement
      }
      return ret
    },
    _addNode () {
      var newNode = {
        name: '新节点',
        _i: true,
      }
      var parent = currNode[0]
      if (!parent.children){
        parent.children = []
      }
      parent.children.push(newNode)
      newNode.parent = parent

      this.showContextMenu = false
    },
    _removeNode () {
      currNode.forEach(node => {
        nodeRemove(node.parent, node)
      })
      currNode = []
      this.showContextMenu = false
    },
    _moveNode () {
      var nodes = this._getCurrNodeParentNode()
      nodes.forEach(node => {
        // 清楚偏移
        this._resetDiff(node)
        // 从父亲中删除 currNode
        nodeRemove(node.parent, node)
        // 添加到 overlapNode 中
        nodeAdd(overlapNode, node)
      })
      this.hook ++
    },
    _jumpNode () {
      currNode.forEach(node => {
        nodeRemove(node.parent, node)
        this._resetDiff(node)
      })
      var parentChildren = queueJumpNode.parent.children
      var t = parentChildren.indexOf(queueJumpNode)
      if (queueJumpDir === 'after'){
        t ++
      }
      parentChildren.splice(t, 0, ...currNode)
      this._resetDiff(queueJumpNode)
    },
    _initEvent () {
      this._contextMenuEvent()
    },
    _contextMenuEvent () {
      var me = this
      window.oncontextmenu = (e) => {
        var target = e.target
        if (this._isNode(target)){
          me.showContextMenu = true
        }
        
        e.preventDefault()
      } 
    },
  },
  computed: {
    rootData () {
      return this.data[0]
    },
    realNodeWidth () {
      return nodeWidth + nodeXPaddding
    },
    realNodeHeight () {
      return nodeHeight + nodeYPadding
    }
  },
  created () {
    var me = this
    this._initData()
    this._initEvent()
  },
  render (h) {console.log('render', this.hook, '-------------')
    jsx.h = h
    this.hook
    return this._renderMain()
  }
}
</script>