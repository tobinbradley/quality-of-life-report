<template>
  <div class="page page-map" v-if="config.qolembedURL">
      <div class="embed">
          <iframe id="map" width="100%" height="100%" title="map" v-bind:src="embedURL"></iframe>
      </div>
  </div>
</template>

<script>
import config from '../../data/config/site.json'
import getURLParameter from '../modules/geturlparams'

export default {
  data: function() {
    return {
      config: config
    }
  },
  computed: {
    selected() {
      if (getURLParameter('s')) {
        return getURLParameter('s').split(',')
      } else {
        return []
      }      
    },
    embedURL() {
      return `${this.config.qolembedURL}embed.html?m=2&s=${this.selected.join(',')}&tocp=true`     
    }
  }
}
</script>
