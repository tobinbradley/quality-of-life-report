import Vue from 'vue';
import getURLParameter from './modules/geturlparams';
import isNumeric from './modules/isnumeric';
import {sum, mean, weighted} from './modules/metric_calculations';
import {prettyNumber} from './modules/number_format';
import dataConfig from '../data/config/data.json';
import siteConfig from '../data/config/site.json';
import valsToArray from './modules/valstoarray'
import data from './assets/data.json'
import App from './components/app.vue';
import Grid from './components/grid.vue';
import Map from './components/map.vue';
import './main.css'

Vue.config.productionTip = false;

// Set up category components
new Vue({
  el: 'sc-app',
  render: h => h(App)
});

// Set grid component
new Vue({
    el: 'sc-grid',
    render: h => h(Grid)
  });

// Set grid component
new Vue({
  el: 'sc-map',
  render: h => h(Map)
});

// Set selected data set
var selected = [];
if (getURLParameter('s') !== null) {
    selected = getURLParameter('s').split(',');
}

// metric list
let opts = document.querySelectorAll('#mapmetric option');
let optIndex = Math.floor(Math.random() * opts.length);
opts[optIndex].setAttribute('selected', true);
let mapmetric = document.querySelector('#mapmetric');
mapmetric.onchange = function() {
    document.querySelector('#map').setAttribute('src', `${siteConfig.qolembedURL}embed.html?m=${mapmetric.value}&s=${selected.join(',')}`);
};
