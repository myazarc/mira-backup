import Vue from 'vue';
import installVuePhotonkit from 'vue-photonkit'
import 'photonkit/dist/css/photon.css'

import App from './App'
import router from './router'
import store from './store'

import utils from './libs/utils';

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false;
Vue.use(installVuePhotonkit);
utils.init();
Vue.prototype.$utils=utils;

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
