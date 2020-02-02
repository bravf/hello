<style>
.tree{
  width: 100%;
}
.context-menu{
  position: absolute;
  border: 1px solid #d5d5d5;
  width: 60px;
  margin-top: 5px;
  z-index: 10000;
  background: #fff;
}
.context-menu div{
  line-height: 1.5;
  cursor: pointer;
  padding: 5px 10px;
}
.context-menu div:hover{
  background-color: #3c91f7;
  color: #fff;
}
.node{
  position: absolute;
  text-align: center;
  user-select: none;
  background: #eef3f6;
  outline: 1px solid #90a5ba;
}
.node-jump-area{
  position: absolute;
  background: #ddd;
}
.node-current{
  outline: 2px solid #000;
}
.node-overlap{
  outline: 2px solid red;
}
.circle{
  position: absolute;
  border: 1px solid #a2bac9;
  background-color: #f3f8fb;
}
.line{
  border: 1px solid #9ab6c8;
  height: 1px;
  position: absolute;
  z-index: 10;
}
</style>

<script>
import jsx from 'vue-jsx'

var {div, span, input} = jsx

var canvasHeight = 200
var nodeWidth = 100
var nodeHeight = 20
var nodeXPaddding = 50
var nodeYPadding = 50
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
var nodeRemove = (parent, node) => {
  var parentChildren = parent.children || (parent.children = [])
  parentChildren.splice(parentChildren.indexOf(node), 1)
}
var nodeAdd = (parent, node) => {
  var parentChildren = parent.children || (parent.children = [])
  parentChildren.push(node)
  node.parent = parent
}
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
// _z: zindex
export default {
  props: {
    data: {
      type: Array,
      default () {
        return []
      },
    },
    editable: {
      type: Boolean,
      default: true,
    },
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
      },
      // todo
      circle: {
        ready: false,
        ing: false,
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,    
      },
      currNode: [],
      // 拖动触发被重叠的node
      overlapNode: null,
      // 拖动触发被插队的node
      queueJumpNode: null,
      queueJumpDir: null,
      nodeZIndex: 100,
      // input keyup 时候记录自己的值，从而避免 blur 之后导致的值丢失
      inputValue: '',
      // 当组件销毁时候执行的清楚队列
      destroyClearQueue: [],
    }
  },
  methods: {
    _walkSelf (o, onBefore = emptyFn, onAfter = emptyFn, checkExpand = true) {
      var stop = false

      var go = (o, parent, z) => {
        // 当前深度
        z = z || 0
        // 儿子们计算完的结果集
        var childrenResult = []
    
        // 可以中断
        if (onBefore(o, parent, z) === false){
          stop = true
          return
        }

        var children = o.children
        var expand = !checkExpand || (checkExpand && (o['_e'] !== false))
        if (expand && children && children.length){
          for (var i = 0,l = children.length; i < l; i ++){
            if (stop) {
              break
            }
            childrenResult.push(go(o.children[i], o, z + 1))
          }
        }
    
        return onAfter(o, parent, childrenResult, z)
      }
    
      return go(o)
    },
    _initData () {
      this._walkSelf(this._rootData, (o, parent, z) => {
        o.parent = parent
        o['_e'] = false
      }, emptyFn, false)
    },
    _getTextWidth (label) {
      return getTextWidth(label) + textWidthPadding
    },
    _resetNodeWidth (o) {
      o['_w'] = this._getTextWidth(o.label)
    },
    _setPositions (node = this._rootData) {console.log('_setPositions')
      // 得出每个节点（包含子节点）真正的高
      // 得出每个节点自身的宽
      this._walkSelf(node, emptyFn, (o, parent, childrenResult) => {
        o['_h'] = ((o['_e'] !== false) && childrenResult.length) ? 
          childrenResult.reduce(sumFn) : this._realNodeHeight
        
          // 缓存一下
        if (!o['_w']){
          this._resetNodeWidth(o)
        }
        return o['_h']
      })

      this._walkSelf(node, (o) => {
        var parent = o.parent
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
      var width = node['_w']
      var height = nodeHeight
      var right = left + width
      var bottom = top + height
      return {left, top, right, bottom, width, height}
    },
    _isRectOverlap (r1, r2) {
      // 两个矩形是否重叠
      // 求两个矩形外包围的长宽
      var width = Math.abs(Math.max(r1.right, r2.right) - Math.min(r1.left, r2.left))
      var height = Math.abs(Math.max(r1.bottom, r2.bottom) - Math.min(r1.top, r2.top))

      // 两个矩形长宽的和
      var rectMaxWidth = r1.width + r2.width
      var rectMaxHeight = r1.height + r2.height

      // 如果相交，必须满足外包围的长短必须同时小于两个矩形长宽的和
      return (width < rectMaxWidth) && (height < rectMaxHeight)
    },
    _clearJumpNode () {
      this.queueJumpNode = null
      this.queueJumpDir = null
    },
    _clearOverlapNode () {
      this.overlapNode = null
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
    _calRelationship () {console.log('_calRelationship')
      this._clearOverlapNode()
      this._clearJumpNode()

      this._walkSelf(this._rootData, (o, parent) => {
        if (this.currNode.includes(o)){
          return
        }

        var oSize = this._getNodeSelfSize(o)

        // 判断 overlap
        var isOverlap = this.currNode.some(node => {
          var currNodeSize = this._getNodeSelfSize(node)
          return this._isRectOverlap(currNodeSize, oSize)
        })
        if (isOverlap){
          this.overlapNode = o
          return false
        }

        // 判断插队
        // this.currNode 必须都是兄弟节点才行
        if ( (o.parent === this.currNode[0].parent) && this._isCurrNodeSameParent){
          // 检查前向情况
          var oBeforeSize = {...oSize}
          oBeforeSize.top -= nodeHeight
          oBeforeSize.bottom -= nodeHeight

          var isBeforeJump = this.currNode.some(node => {
            var currNodeSize = this._getNodeSelfSize(node)
            return this._isRectOverlap(currNodeSize, oBeforeSize)
          })

          if (isBeforeJump){
            this.queueJumpNode = o
            this.queueJumpDir = 'before'
            return false
          }

          // 检查后项情况
          var oAfterSize = {...oSize}
          oAfterSize.top += nodeHeight
          oAfterSize.bottom += nodeHeight

          var isAfterJump = this.currNode.some(node => {
            var currNodeSize = this._getNodeSelfSize(node)
            return this._isRectOverlap(currNodeSize, oAfterSize)
          })

          if (isAfterJump){
            this.queueJumpNode = o
            this.queueJumpDir = 'after'
            return false
          }
        }
      })
    },
    _renderLine (x, y, width, angle) {
      return div({
        class_line: true,
        style_width: width + 'px',
        style_transform: `rotate(${angle}deg)`,
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
          e.stopPropagation()
        },
        on_click (e) {
          o['_e'] =  (o['_e'] === false) ? true : false
          me._setPositions()
          // e.stopPropagation()
          me.hook ++
        },
        on_dblclick (e) {
          e.stopPropagation()
        },
      }, o['_e'] === false ? '+' : '-')

      var isCurrent = this.currNode.includes(o)
      var {x, y} = this._getNodePosition(o)

      var jsxProps = {
        style_left: x + 'px',
        style_top: y + 'px',
        style_width: o['_w'] + 'px',
        style_height: nodeHeight + 'px',
        'style_line-height': nodeHeight + 'px',
        'style_z-index': o['_z'] || 10,
        class_node: true,
        'class_node-current': isCurrent,
        'class_node-overlap': o === this.overlapNode,
        attrs_type: 'node',
      }

      var children = [$expand, span(o.label)]

      if (this.editable){
        jsxProps['on_mousedown'] = (e) => {console.log('node mousedown', e)
          if (e.metaKey){
            if (!me.currNode.includes(o)){
              me.currNode.push(o)
            }
            else {
              me.currNode.splice(me.currNode.indexOf(o), 1)
            }
          }
          else {
            if (!me.currNode.includes(o)){
              me.currNode = [o]
            }
          }
          
          me.drag.ready = true
          me.drag.ing = false
          me.drag.startX = e.clientX
          me.drag.startY = e.clientY
          o['_z'] = me.nodeZIndex ++
          me.showContextMenu = false
          me.hook ++
          e.stopPropagation()
        }

        jsxProps['on_click'] = (e) => {console.log('node click')
          if (me.drag.ing) {
            return
          }
          if (!e.metaKey && !(me.currNode.length === 1 && me.currNode[0] === o)){
            me.currNode = [o]
            me.hook ++
          }
        }

        jsxProps['on_dblclick'] = () => {
          o['_i'] = true
          me.hook ++
        }

        var $input = input({
          vif: o['_i'] === true,
          style_position: 'absolute',
          style_top: 0,
          style_left: 0,
          style_width: o['_w'] + 'px',
          style_height: nodeHeight + 'px',
          'style_line-height': nodeHeight + 'px',
          'style_z-index': 10,
          domProps_value: o.label,
          ref: 'input',
          on_focus (e) {
            me.inputValue = o.label
          },
          on_blur (e) {console.log('blur')
            o['_i'] = false
            var newName = me.inputValue
            if (newName && (newName !== o.label)){
              o.label = newName
              me._resetNodeWidth(o)
            }
            me.hook ++
          },
          on_keyup (e) {
            var isEnter = e.keyCode == 13
            var input = e.target

            if (isEnter){
              input.blur()
            }
            else {
              me.inputValue = e.target.value
              input.style.width = Math.max(me._getTextWidth(input.value), o['_w']) + 'px'
            }
          }
        })

        var $jumpArea = div({
          vif: o === this.queueJumpNode,
          'class_node-jump-area': true,
          style_left: 0,
          style_top: (this.queueJumpDir === 'before') ? `-${nodeHeight}px` : `${nodeHeight}px`,
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

        children = [...children, $input, $jumpArea]
      }

      return div(jsxProps, ...children)
    },
    _renderNodes () {
      var nodes = []
      this._walkSelf(this._rootData, (o, parent) => {
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

      var {x, y} = this._getNodePosition(this.currNode[0])
      return div({
        'class_context-menu': true,
        style_left: x + 'px',
        style_top: y + nodeHeight + 'px',
      }, 
        div({
          on_mousedown (e) {
            e.stopPropagation()
            me._addNode()
            me._setPositions()
          }
        }, '新增'),
        div({
          on_mousedown (e) {
            e.stopPropagation()
            me._removeNode()
            me._setPositions()
          }
        }, '删除'),
      )
    },
    _getCircleSize () {
      var circle = this.circle
      var left = Math.min(circle.startX, circle.endX)
      var top = Math.min(circle.startY, circle.endY)
      var width = Math.abs(circle.startX - circle.endX)
      var height = Math.abs(circle.startY - circle.endY)
      var right = left + width
      var bottom = top + height

      return {left, right, top, bottom, width, height}
    },
    _calCircleNodes () {console.log('_calCircleNodes')
      var circle = this.circle
      var size = this._getCircleSize()
      this.currNode = []

      this._walkSelf(this._rootData, (o) => {
        var oSize = this._getNodeSelfSize(o)
        if (this._isRectOverlap(oSize, size)){
          this.currNode.push(o)
        }
      })
    },
    _renderCircle () {
      var circle = this.circle
      var size = this._getCircleSize()

      return div({
        vif: circle.ready && circle.ing,
        'class_circle': true,
        style_left: size.left + 'px',
        style_top: size.top + 'px',
        style_width: size.width + 'px',
        style_height: size.height + 'px',
      })
    },
    _getMousePosition (e) {
      var $tree = this.$refs.tree
      var rect = $tree.getBoundingClientRect()
      var x = e.clientX
      var y = e.clientY

      // 减去容器的偏移
      x -= rect.x
      y -= rect.y

      // 加上容器的滚动
      x += $tree.scrollLeft
      y += $tree.scrollTop

      return {x, y}
    },
    _renderMain () {
      var me = this

      var jsxProps = {
        class_tree: true,
        style_height: Math.max(canvasHeight, this._rootData['_h']) + 'px',
        style_border: '1px solid red',
        style_position: 'relative',
        style_overflow: 'auto',
        ref: 'tree',
      }

      var children = [...this._renderNodes()]

      if (this.editable){
        jsxProps['on_mousedown'] = (e) => {
          me.currNode = []
          me.showContextMenu = false

          var circle = me.circle
          circle.ready = true
          circle.ing = false
          var xy = me._getMousePosition(e)
          circle.startX = xy.x
          circle.startY = xy.y
        }
        children = [...children, this._renderContextMenu(), this._renderCircle()]
      }
      
      return div(jsxProps, ...children)
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
        label: '新节点',
        _i: true,
      }
      var parent = this.currNode[0]
      if (!parent.children){
        parent.children = []
      }
      parent.children.push(newNode)
      newNode.parent = parent
      parent['_e'] = true

      this.showContextMenu = false
    },
    _removeNode () {
      this.currNode.forEach(node => {
        nodeRemove(node.parent, node)
      })
      this.currNode = []
      this.showContextMenu = false
    },
    _moveNode () {
      var nodes = this._getCurrNodeParentNode
      nodes.forEach(node => {
        // 清楚偏移
        this._resetDiff(node)
        // 从父亲中删除 this.currNode
        nodeRemove(node.parent, node)
        // 添加到 this.overlapNode 中
        nodeAdd(this.overlapNode, node)
      })
      this.overlapNode['_e'] = true
      this.hook ++
    },
    _jumpNode () {
      this.currNode.forEach(node => {
        nodeRemove(node.parent, node)
        this._resetDiff(node)
      })
      var parentChildren = this.queueJumpNode.parent.children
      var t = parentChildren.indexOf(this.queueJumpNode)
      if (this.queueJumpDir === 'after'){
        t ++
      }
      parentChildren.splice(t, 0, ...this.currNode)
      this._resetDiff(this.queueJumpNode)
    },
    _contextMenuEvent () {
      var me = this

      var contextmenu = (e) => {
        var target = e.target
        if (this._isNode(target)){
          me.showContextMenu = true
        }
        
        e.preventDefault()
      }

      
      window.addEventListener('contextmenu', contextmenu)
      this.destroyClearQueue.push( () => {
        window.removeEventListener('contextmenu', contextmenu)
      })
    },
    _windowMouseEvent () {
      var me = this

      var mousemove = (e) => {
        var drag = me.drag
        var circle = me.circle

        var x = e.clientX
        var y = e.clientY

        var diffx = x - drag.startX
        var diffy = y - drag.startY

        // 防抖误差 10
        var isRealMove = Math.abs(diffx) > 10 || Math.abs(diffy) > 10

        // 如果已经准备了拖动
        if (drag.ready && (drag.ing || isRealMove) ){
          drag.ing = true
          me._getCurrNodeParentNode.forEach(node => {
            node['_dx'] = (node['_dxx'] || 0) + diffx
            node['_dy'] = (node['_dyy'] || 0) + diffy
            me._setPositions(node)
          })

          me._calRelationship()
          me.hook ++
        }

        // 圈选
        if (circle.ready && (circle.ing || isRealMove) ){
          circle.ing = true
          var xy = me._getMousePosition(e)
          circle.endX = xy.x
          circle.endY = xy.y

          me._calCircleNodes()
          me.hook ++
        }
      }

      var mosueup = () => {
         console.log('main mouseup')

        // 如果是在拖动中
        if (me.drag.ready && me.drag.ing){
          me._getCurrNodeParentNode.forEach(node => {
            node['_dxx'] = node['_dx']
            node['_dyy'] = node['_dy']
          })
          
          // 查看是否有 this.overlapNode
          if (me.overlapNode){
            me._moveNode()
            me._clearOverlapNode()
            me._setPositions()
          }

          // 查看 this.queueJumpNode
          if (me.queueJumpNode){
            me._jumpNode()
            me._clearJumpNode()
            me._setPositions()
          }
        }

        me.drag.ready = false
        me.circle.ready = false
        me.hook ++
      }

      window.addEventListener('mousemove', mousemove)
      window.addEventListener('mouseup', mosueup)

      this.destroyClearQueue.push(() => {
        window.removeEventListener('mousemove', mousemove)
        window.removeEventListener('mouseup', mosueup)
      })
    }
  },
  computed: {
    _rootData () {
      return this.data[0]
    },
    _realNodeHeight () {
      return nodeHeight + nodeYPadding
    },
    _isCurrNodeSameParent () {console.log('_isCurrNodeSameParent')
      if (!this.currNode.length) {
        return false
      }
      var parent = this.currNode[0].parent
      return this.currNode.every(node => {
        return node.parent === parent
      })
    },
    _getCurrNodeParentNode () {console.log('_getCurrNodeParentNode')
      // 从currNode中筛选，如果某个子节点的祖先节点也在，那么排除掉这个节点
      return this.currNode.filter(node => {
        return this.currNode.every(i => {
          return !this._isDeepParent(i, node)
        })
      })
    },
  },
  created () {
    this._initData()
    this._setPositions()

    if (this.editable){
      this._contextMenuEvent()
      this._windowMouseEvent()
    }
  },
  beforeDestroy () {
    this.destroyClearQueue.forEach(call => call())
  },
  render (h) {console.log('render', this.hook, '-------------')
    jsx.h = h
    this.hook

    return this._renderMain()
  }
}
</script>