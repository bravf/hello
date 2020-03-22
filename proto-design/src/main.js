import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)
import Spectre from '@/components/spectre/index'
Vue.use(Spectre)

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