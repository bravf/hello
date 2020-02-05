<style>
.mindmap-tree{
  width: 100%;
}
.mindmap-context-menu{
  position: absolute;
  border: 1px solid #d5d5d5;
  width: 60px;
  margin-top: 5px;
  z-index: 10000;
  background: #fff;
}
.mindmap-context-menu div{
  line-height: 1.5;
  cursor: pointer;
  padding: 5px 10px;
}
.mindmap-context-menu div:hover{
  background-color: #3c91f7;
  color: #fff;
}
.mindmap-node{
  position: absolute;
  text-align: center;
  user-select: none;
  background: #eef3f6;
  outline: 1px solid #90a5ba;
}
.mindmap-node-jump-area{
  position: absolute;
  background: #ddd;
}
.mindmap-node-current{
  outline: 2px solid #000;
}
.mindmap-node-overlap{
  outline: 2px solid red;
}
.mindmap-circle{
  position: absolute;
  border: 1px solid #a2bac9;
  background-color: #f3f8fb;
}
.mindmap-line{
  border: 1px solid #9ab6c8;
  height: 1px;
  position: absolute;
  z-index: 10;
}
</style>

<script>
import jsx from 'vue-jsx'
import { 
  empty,
  sum, 
  getTextWidth, 
  walkTree, 
  checkRectOverlap,
  treeParentManager, 
  performanceHook,
} from '../base/index'

var {div, span, input} = jsx
var nodeWidth = 100
var nodeHeight = 20
var nodeXPaddding = 50
var nodeYPadding = 26
var textWidthPadding = 20

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
// _f: 是否展开
// _d: 是否被拖动过，如果 true 则 _x, _y 不再参与自动计算
// _z: zindex
var com = {
  props: {
    data: {
      type: Object,
      default () {
        return {
          label: '根节点',
        }
      },
    },
    editable: {
      type: Boolean,
      default: true,
    },
    minHeight: {
      type: Number,
      default: 500,
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
      // 缓存数据对 parent 的引用
      parentManager: null,
    }
  },
  methods: {
    openFolder (o) {console.log(o)
      o['_f'] = true
      this._setPositions()
      this.hook ++
    },
    closeFolder (o) {console.log(o)
      o['_f'] = false
      this._setPositions()
      this.hook ++
    },

    _ready () {
      this.parentManager = treeParentManager(this._rootData)
      walkTree(this._rootData, (o, parent) => {
        o['_f'] = false
      }, empty, false)
      this._setPositions()
    },
    _getTextWidth (label) {
      return getTextWidth(label) + textWidthPadding
    },
    _resetNodeWidth (o) {
      o['_w'] = this._getTextWidth(o.label)
    },
    _setPositions (node = this._rootData) {
      // 得出每个节点（包含子节点）真正的高
      // 得出每个节点自身的宽
      walkTree(node, empty, (o, parent, childrenResult) => {
        o['_h'] = 
          ((o['_f'] !== false) && childrenResult.length)
            ? childrenResult.reduce(sum)
            : this._realNodeHeight
        
          // 缓存一下
        if (!o['_w']){
          this._resetNodeWidth(o)
        }
        return o['_h']
      })

      walkTree(node, (o) => {
        var parent = this.parentManager.get(o)
        // root 节点
        if (!parent){
          o['_x'] = 10
          o['_y'] = (this._getCanvasHeight() - nodeHeight) / 2
        }
        else {
          var parentP = this._getNodePosition(parent)
          var parentX = parentP.x
          var parentY = parentP.y
          var children = parent.children
          var i = children.indexOf(o)

          o['_x'] = parentX + nodeXPaddding + parent['_w']
          o['_y'] = parentY - parent['_h'] / 2 + o['_h'] / 2 + [0].concat(children.slice(0, i).map(a => a['_h'])).reduce(sum)
        }
      })
    },
    _getCanvasHeight () {
      return Math.max(this.minHeight, this._rootData['_h'])
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
    _clearJumpNode () {
      this.queueJumpNode = null
      this.queueJumpDir = null
    },
    _clearOverlapNode () {
      this.overlapNode = null
    },
    _isDeepParent (a ,b) {
      // a是否是b的祖先类
      var bParent = this.parentManager.get(b)
      while(bParent){
        if (bParent === a){
          return true
        }
        bParent = this.parentManager.get(bParent)
      }
      return false
    },
    _calRelationship () {
      this._clearOverlapNode()
      this._clearJumpNode()

      walkTree(this._rootData, (o, parent, x) => {
        if (this.currNode.includes(o)){
          return
        }

        var oSize = this._getNodeSelfSize(o)

        // 判断 overlap
        var isOverlap = this.currNode.some(node => {
          var currNodeSize = this._getNodeSelfSize(node)
          return checkRectOverlap(currNodeSize, oSize)
        })
        if (isOverlap){
          this.overlapNode = o
          return false
        }

        // 判断插队
        // 所有目标节点都有前插判断，最后一个节点有后插判断
        // this.currNode 必须都是兄弟节点才行
        if ( (this.parentManager.get(o) === this.parentManager.get(this.currNode[0])) && this._isCurrNodeSameParent ) {
          // 检查前向情况
          var oBeforeSize = {...oSize}
          oBeforeSize.top -= nodeHeight
          oBeforeSize.bottom -= nodeHeight

          var isBeforeJump = this.currNode.some(node => {
            var currNodeSize = this._getNodeSelfSize(node)
            return checkRectOverlap(currNodeSize, oBeforeSize)
          })

          if (isBeforeJump){
            this.queueJumpNode = o
            this.queueJumpDir = 'before'
            return false
          }

          if (x === (this.parentManager.get(o).children.length - 1)){
            // 检查后项情况
            var oAfterSize = {...oSize}
            oAfterSize.top += nodeHeight
            oAfterSize.bottom += nodeHeight

            var isAfterJump = this.currNode.some(node => {
              var currNodeSize = this._getNodeSelfSize(node)
              return checkRectOverlap(currNodeSize, oAfterSize)
            })

            if (isAfterJump){
              this.queueJumpNode = o
              this.queueJumpDir = 'after'
              return false
            }
          }
        }
      })
    },
    _renderLine (x, y, width, angle) {
      return div({
        'class_mindmap-line': true,
        style_width: width + 'px',
        style_transform: `rotate(${angle}deg)`,
        style_left: x + 'px',
        style_top: y + 'px',
      })
    },
    _renderNode (o) {
      var me = this

      var $folder = span({
        vif: !!(o.children && o.children.length),
        'style_padding-right': '4px',
        style_cursor: 'pointer',
        on_click () {
          if (o['_f'] === false){
            me.openFolder(o)
          }
          else {
            me.closeFolder(o)
          }
        },
        on_dblclick (e) {
          e.stopPropagation()
        },
      }, o['_f'] === false ? '+' : '-')

      var isCurrent = this.currNode.includes(o)
      var {x, y} = this._getNodePosition(o)

      var jsxProps = {
        style_left: x + 'px',
        style_top: y + 'px',
        style_width: o['_w'] + 'px',
        style_height: nodeHeight + 'px',
        'style_line-height': nodeHeight + 'px',
        'style_z-index': o['_z'] || 10,
        'class_mindmap-node': true,
        'class_mindmap-node-current': isCurrent,
        'class_mindmap-node-overlap': o === this.overlapNode,
        attrs_type: 'node',
      }

      var children = [$folder, span(o.label)]

      if (this.editable){
        jsxProps['on_mousedown'] = (e) => {
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

        jsxProps['on_click'] = (e) => {
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
          on_blur (e) {
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
          'class_mindmap-node-jump-area': true,
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
      walkTree(this._rootData, (o) => {
        var op = this._getNodePosition(o)
        nodes.push(this._renderNode(o))

        if ((o['_f'] !== false) && o.children){
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
        'class_mindmap-context-menu': true,
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
          vif: this.currNode[0] !== this._rootData,
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
    _calCircleNodes () {
      var circle = this.circle
      var size = this._getCircleSize()
      this.currNode = []

      walkTree(this._rootData, (o) => {
        var oSize = this._getNodeSelfSize(o)
        if (checkRectOverlap(oSize, size)){
          this.currNode.push(o)
        }
      })
    },
    _renderCircle () {
      var circle = this.circle
      var size = this._getCircleSize()

      return div({
        vif: circle.ready && circle.ing,
        'class_mindmap-circle': true,
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
        'class_mindmap-tree': true,
        style_height: this._getCanvasHeight() + 'px',
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
      this.parentManager.add(newNode, parent)
      parent['_f'] = true

      this.showContextMenu = false
    },
    _removeNode () {
      this.currNode.forEach(node => {
        nodeRemove(this.parentManager.get(node), node)
        this.parentManager.remove(node)
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
        nodeRemove(this.parentManager.get(node), node)
        // 添加到 this.overlapNode 中
        nodeAdd(this.overlapNode, node)
        this.parentManager.update(node, this.overlapNode)
      })
      this.overlapNode['_f'] = true
      this.hook ++
    },
    _jumpNode () {
      this.currNode.forEach(node => {
        nodeRemove(this.parentManager.get(node), node)
        this._resetDiff(node)
      })
      var parentChildren = this.parentManager.get(this.queueJumpNode).children
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
      return this.data
    },
    _realNodeHeight () {
      return nodeHeight + nodeYPadding
    },
    _isCurrNodeSameParent () {
      if (!this.currNode.length) {
        return false
      }
      var parent = this.parentManager.get(this.currNode[0])
      return this.currNode.every(node => {
        return this.parentManager.get(node) === parent
      })
    },
    _getCurrNodeParentNode () {
      // 从currNode中筛选，如果某个子节点的祖先节点也在，那么排除掉这个节点
      return this.currNode.filter(node => {
        return this.currNode.every(i => {
          return !this._isDeepParent(i, node)
        })
      })
    },
  },
  watch: {
    data () {
      this._ready()
    }
  },
  created () {
    this._ready()

    if (this.editable){
      this._contextMenuEvent()
      this._windowMouseEvent()
    }
  },
  beforeDestroy () {
    this.destroyClearQueue.forEach(call => call())
  },
  render (h) {
    jsx.h = h
    this.hook

    return this._renderMain()
  }
}

// 开启性能统计监控
performanceHook(com, ['render'])

export default com
</script>