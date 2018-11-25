<template>
  <div class="page page-front">
    <div>
        <div class="hero">
            <img class="logo-image" src="img/logo.png">
            <div class="subhero">
                <h1 class="text-center" id="reportTitle">Summary Report</h1>
            </div>
        </div>
    </div>
    <div class="blather">
        <p>
            The <a v-bind:href="site.qolreportURL">{{ site.title }}</a> is an interactive online tool to help neighborhoods, government leaders and staff, businesses, community organizations, new residents and others learn more about our county and the diverse neighborhoods within it.  The Explorer features over 80 variables that reflect you, the places you live and work, and collectively, our community.
        </p>
        <p>
            On these pages, you’ll find information about the selected area’s social, housing, economic and environmental conditions.  Check out the Explorer online to learn more about what’s happening, see trends over time, and connect to resources to take action on the issues that matter to you.
        </p>
        <p>
            Learn More.  Take Action.  Create Change.
        </p>
    </div>
    <table class="text-center metric-box" v-if="selected.length > 0">
      <tbody>
          <tr>
              <td>
                  <h2>Character</h2>
                  <h3 class="m47-selected-raw" v-html="getValue(config['m47'], selectArray('45', 'selected'))">&nbsp;</h3>
                  <h4>population</h4>
              </td>
              <td>
                  <h2>Education</h2>
                  <h3 class="m20-selected" v-html="getValue(config['m20'], selectArray('45', 'selected'))">&nbsp;</h3>
                  <h4>bachelor's degree</h4>
              </td>
              <td>
                  <h2>Economy</h2>
                  <h3 class="m37-selected" v-html="getValue(config['m37'], selectArray('45', 'selected'))">&nbsp;</h3>
                  <h4>household income</h4>
              </td>
          </tr>
          <tr>
              <td>
                  <h2>Engagement</h2>
                  <h3 class="m48-selected" v-html="getValue(config['m48'], selectArray('45', 'selected'))">&nbsp;</h3>
                  <h4>voter participation</h4>
              </td>
              <td>
                  <h2>Transportation</h2>
                  <h3 class="m70-selected" v-html="getValue(config['m70'], selectArray('45', 'selected'))">&nbsp;</h3>
                  <h4>streets with sidewalks</h4>
              </td>
              <td>
                  <h2>Housing</h2>
                  <h3 class="m5-selected-raw" v-html="getValue(config['m5'], selectArray('45', 'selected'))">&nbsp;</h3>
                  <h4>housing units</h4>
              </td>
          </tr>
          <tr>
              <td>
                  <h2>Safety</h2>
                  <h3 class="m59-selected" v-html="getValue(config['m59'], selectArray('45', 'selected'))">&nbsp;</h3>
                  <h4>property crime rate</h4>
              </td>
              <td>
                  <h2>Environment</h2>
                  <h3 class="m3-selected" v-html="getValue(config['m3'], selectArray('3', 'selected'))">&nbsp;</h3>
                  <h4>tree canopy</h4>
              </td>
              <td>
                  <h2>Health</h2>
                  <h3 class="m45-selected" v-html="getValue(config['m45'], selectArray('45', 'selected'))">&nbsp;</h3>
                  <h4>grocery store proximity</h4>
              </td>
          </tr>
      </tbody>
    </table>
    <Footer :site=site />
  </div>
</template>

<script>
import getURLParameter from '../modules/geturlparams'
import isNumeric from '../modules/isnumeric'
import {sum, mean, weighted} from '../modules/metric_calculations'
import {prettyNumber} from '../modules/number_format'
import valsToArray from '../modules/valstoarray'
import Footer from './footer'

export default {
  components: {
    Footer: Footer
  },  
  props: {    
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
    selected() {
      if (getURLParameter('s')) {
        return getURLParameter('s').split(',')
      } else {
        return []
      }      
    }
  },
  methods: {
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

