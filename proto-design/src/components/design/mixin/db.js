import localforage from 'localforage'
import { 
  merge,
  cloneDeep,
} from 'lodash'
import Deferred from 'vue-deferred'
let dbReady
export default {
  data () {
    return {
      dbTable: null,
    }
  },
  computed: {
  },
  methods: {
    async _dbInit () {
      if (dbReady) {
        return
      }
      let defer = Deferred()
      dbReady = defer.promise
      this.dbTable = localforage.createInstance({
        name: 'proto-design',
        storeName: 'object',
      })
      await this.dbTable.ready()
      let keys = await this.dbTable.keys()
      // 如果是项目首次，则进行数据初始化
      if (!keys.length) {
        console.log('database init')
        let project = this._createProjectBase()
        let page = this._createPageBase(project.id)
        project.pages.headId = page.id
        project.currPageId = page.id
        await this._dbSaveItem(project.id, project)
        await this._dbSaveItem(page.id, page)
        console.log('database init over')
      }
      defer.resolve()
    },
    async _dbSaveItem (id, value) {
      value = cloneDeep(value)
      if (value) {
        // 排除 tempGroup
        if (value.type === 'rect-tempGroup') {
          console.log('不存储临时组')
          return
        }
        // 保证数据完整性
        if (value['tempGroupId']) {
          value['tempGroupId'] = ''
        }
        if (value.data && value.data.isOpen) {
          value.data.isOpen = false
        }
      }
      await this.dbTable.ready()
      if (!value) {
        await this.dbTable.removeItem(id)
      }
      else {
        let oldValue = await this.dbTable.getItem(id) || {}
        let newValue = merge(oldValue, value)
        await this.dbTable.setItem(id, newValue)
      }
    },
    async _dbSave (objects) {
      console.log('dbSave', objects)
      for (let id in objects) {
        await this._dbSaveItem(id, objects[id])
      }
    },
    async _dbAll () {
      console.log('加载所有数据...')
      await dbReady
      await this.dbTable.iterate((value, key) => {
        this.objects[key] = value
        if (value.type === 'project') {
          this.currProjectId = value.id
        }
      })
      this.currPageId = this.currProject.currPageId
      console.log('加载所有数据完毕')
    },
  },
  created () {
    this._dbInit()
    this._dbAll()
  },
  async mounted () {
  }
}