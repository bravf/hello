import jsx from 'vue-jsx'

var {div, span} = jsx

var canvasWidth = 800
var canvasHeight = 800
var nodeWidth = 100
var nodeHeight = 26
var nodePaddding = 50
var emptyFn = () => {}
var sumFn = (sum, n) => {return sum + n}

export default {
  props: {
    data: {
      type: Array,
      default () {
        return []
      },
    }
  },
  methods: {
    _walkSelf (o, onBefore = emptyFn, onAfter = emptyFn) {
      var go = (o, parent, z) => {
        // 当前深度
        z = z || 0
        // 儿子们计算完的结果集
        let childrenResult = []
    
        onBefore(o, parent, z)

        if (o.children && o.children.length){
          childrenResult = o.children.map(i => go(i, o, z + 1))
        }
    
        return onAfter(o, parent, childrenResult, z)
      }
    
      return go(o)
    },
    _initData () {
      this._walkSelf(this.rootData, (o, parent) => {
        o.parent = parent
      })
      this._getPositions()
    },
    _getPositions () {
      // 先得出每个节点真正的高
      this._walkSelf(this.rootData, emptyFn, (o, parent, childrenResult) => {
        o['_h'] = childrenResult.length ? 
          childrenResult.reduce(sumFn) : this.realNodeHeight
        return o['_h']
      })

      this._walkSelf(this.rootData, (o) => {
        var parent = o.parent

        // root 节点
        if (!parent){
          o['_x'] = 0
          o['_y'] = o['_h'] / 2 - nodeHeight / 2
        }
        else {
          var parentX = parent._x
          var parentY = parent._y
          var children = parent.children
          var i = children.indexOf(o)

          o['_x'] = parentX + this.realNodeWidth
          o['_y'] = parentY - parent['_h'] / 2 + o['_h'] / 2
          if (i > 0){
            o['_y'] += children.slice(0, i).map(a => a['_h']).reduce(sumFn)
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
    _renderNode (o) {
      return div({
        style_left: o['_x'] + 'px',
        style_top: o['_y'] + 'px',
        style_width: nodeWidth + 'px',
        style_height: nodeHeight + 'px',
        'style_line-height': nodeHeight + 'px',
        style_border: '1px solid #73a1bf',
        style_position: 'absolute',
        'style_border-radius': '5px',
        'style_text-align': 'center',
        style_cursor: 'pointer',
      }, o.name)
    },
    _renderNodes () {
      var nodes = []
      this._walkSelf(this.rootData, (o) => {
        nodes.push(this._renderNode(o))
        if (o.children){
          nodes.push(...o.children.map(child => {
            var w = nodePaddding
            var h = child['_y'] - o['_y'] 
            var length = Math.sqrt(w * w + h * h)
            var centerX = o['_x'] + nodeWidth + w / 2
            var centerY = o['_y'] + nodeHeight / 2 + h / 2
            var x = centerX - length / 2  
            var angle = Math.atan(h / w) / Math.PI * 180
            return this._renderLine(x, centerY, length, angle)
          }))
        }
      })
      return nodes
    },
    _renderMain () {
      return div({
        class_tree: true,
        style_width: canvasWidth + 'px',
        style_height: canvasHeight + 'px',
        style_border: '1px solid red',
        style_position: 'relative',
      }, ...this._renderNodes())
    },
  },
  computed: {
    rootData () {
      return this.data[0]
    },
    realNodeWidth () {
      return nodeWidth + nodePaddding
    },
    realNodeHeight () {
      return nodeHeight + nodePaddding
    }
  },
  created () {
    this._initData()
  },
  render (h) {
    jsx.h = h

    return this._renderMain()
  }
}