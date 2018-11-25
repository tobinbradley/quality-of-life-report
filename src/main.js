import Vue from 'vue'
import getURLParameter from './modules/geturlparams'
import siteConfig from '../data/config/site.json'
import App from './components/app.vue'
import './main.css'

Vue.config.productionTip = false

// Set up category components
new Vue({
  el: 'sc-app',
  render: h => h(App)
})

// Set selected data set
var selected = []
if (getURLParameter('s') !== null) {
  selected = getURLParameter('s').split(',')
}

// metric list
mapmetric.onchange = function() {
  document
    .querySelector('#map')
    .setAttribute(
      'src',
      `${siteConfig.qolembedURL}embed.html?m=${
        mapmetric.value
      }&s=${selected.join(',')}`
    )
}
