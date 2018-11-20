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
                      (<span><!-- metric year --></span>)<span class="description">{{{desc metric}}}.</span>
                    </td>
                    <td class="text-right">
                      <!-- selected data values -->
                      <span>--</span>
                      <span>--</span> <!-- optional raw -->
                    </td>
                    <td class="text-right">
                      <!-- county data values -->
                      <span>--</span>                      
                      <span>--</span> <!-- optional raw -->
                    </td>
                    <td>
                      <span v-if="item.label">{{item.label}}</span> 
                      <span v-if="item.raw_label">{{item.raw_label}}</span>
                    </td>
                </tr>
            </tbody>
          </table>
          <div class="printfooter"><span class="attribution">{{../siteConfig.title}}{{#if ../siteConfig.qoldashboardURL}} &bull; <a href="{{siteConfig.qoldashboardURL}}" target="_blank">{{fancyURL ../siteConfig.qoldashboardURL}}</a>{{/if}}</span></div>
        </div>
</template>

<script>
import jsonQ from 'jsonq'

export default {
  props: {
    category: {
      type: String
    },
    config: {
      type: Object
    },
    data: {
      type: Object
    }
  },
  computed: {
    // a computed getter
    configFilter: () => {
      // `this` points to the vm instance
      return jsonQ(this.config).filter({"category": this.category})
    },
    dashboardURL: (metric) => {
      return `hi?m=${metric}`
    }
  }
}
</script>
