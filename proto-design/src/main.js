import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)
Vue.config.productionTip = false

import Design from './components/design'
const routes = [
  {path: '/design', component: Design },
]
const router = new VueRouter({
  routes,
})

new Vue({
  router
}).$mount('#app')