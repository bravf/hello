import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)
import Spectre from '@/components/spectre/index'
Vue.use(Spectre)
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'
Vue.component('v-icon', Icon)

Vue.config.productionTip = false

import Index from '@/components/index'
import Design from '@/components/design'
const routes = [
  {path: '/index', component: Index},
  {path: '/design', component: Design },
]
const router = new VueRouter({
  routes,
})
new Vue({
  router
}).$mount('#app')