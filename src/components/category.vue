<template>
  <div class="page page-category">
    <h2>{{category}}</h2>
    <table class="table table-condensed">
      <thead>
        <tr>
          <th class="text-left">Variable</th>
          <th class="text-right report-column-selected">Selected</th>
          <th class="text-right report-column-county">County</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in configFilter" :key="item.metric">
            <td>
              <a v-bind:href="dashboardURL(item.metric)" target="_blank">{{item.title}}</a>
              (<span>{{metricYear(item.metric)}}</span>)<span class="description" v-html="item.subtitle"></span>
            </td>
            <td class="text-right">
              <!-- selected data values -->
              <span v-html="getValue(item, selectArray(item.metric, 'selected'))"></span>
              <span v-if="item.raw_label" v-html="rawValue(item, selectArray(item.metric, 'selected'))"></span>
            </td>
            <td class="text-right">
              <!-- county data values -->
              <span v-html="getValue(item, selectArray(item.metric, 'global'))"></span>                      
              <span v-if="item.raw_label" v-html="rawValue(item, selectArray(item.metric, 'global'))">--</span>
            </td>
            <td>
              <span v-if="item.label">{{item.label}}</span> 
              <span v-if="item.raw_label">{{item.raw_label}}</span>
            </td>
        </tr>
      </tbody>
    </table>
    <Footer :site=site />
  </div>
</template>

<script>
import filter from 'lodash.filter'
import isNumeric from '../modules/isnumeric'
import {sum, mean, weighted} from '../modules/metric_calculations'
import {prettyNumber} from '../modules/number_format'
import getURLParameter from '../modules/geturlparams'
import valsToArray from '../modules/valstoarray'
import Footer from './footer'


export default {
  components: {
    Footer: Footer
  },
  props: {
    category: {
      type: String
    },
    config: {
      type: Object
    },
    data: {
      type: Object
    },
    site: {
      type: Object
    }
  },  
  computed: {
    configFilter() {
      let _this = this
      return filter(_this.config, function(o) { return o.category === _this.category })
    },
    selected() {
      if (getURLParameter('s')) {
        return getURLParameter('s').split(',')
      } else {
        return []
      }    
    }
  },
  methods: {
    dashboardURL(m) {
      let _this = this
      //https://mcmap.org/qol/?m=m15&n=2
      let selected = getURLParameter('s') || '';
      return `${_this.site.qoldashboardURL}#m${m}/${selected}`
    },    
    metricYear(m) {
      let _this = this
      let pointer = Object.keys(_this.data[`r${m}`])[0];
      let keys = Object.keys(_this.data[`r${m}`][pointer]);
      let year =  keys[0];
      return year.replace("y_", "");
    },
    sumData(arr, prefix, suffix) {
      return prettyNumber(sum(arr), 0, prefix, suffix)
    },
    meanData(arr, decimals, prefix, suffix) {
      return prettyNumber(mean(arr), decimals, prefix, suffix)
    },
    weightedData(arr, arrw, decimals, prefix, suffix) {
      return prettyNumber(weighted(arr, arrw), decimals, prefix, suffix)
    },
    rawValue(d, selected) {
      let _this = this

      let arr = valsToArray(_this.data[`r${d.metric}`], `y_${_this.metricYear(d.metric)}`, selected);
      return _this.sumData(arr)
    },
    selectArray(m, scope) {
      let _this = this
      if (scope === "global") {
        return Object.keys(_this.data[`r${m}`])
      } else {
        return _this.selected
      }
    },
    getValue(d, selected) {
      let _this = this

      let arr = valsToArray(_this.data[`r${d.metric}`], `y_${_this.metricYear(d.metric)}`, selected);

      switch(d.type) {
        case 'sum':
          return _this.sumData(arr, d.prefix, d.suffix)
          break;
        case 'mean':
          return _this.meanData(arr, d.decimals, d.prefix, d.suffix)
          break;
        case 'weighted':
          let arrw = valsToArray(_this.data[`w${d.metric}`], `y_${_this.metricYear(d.metric)}`, selected);
          return _this.weightedData(arr, arrw, d.decimals, d.prefix, d.suffix)  
          break;
      }
    }
  }
}
</script>
