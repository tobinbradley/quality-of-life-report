<template>
  <div class="page page-map" v-if="site.qolembedURL">
      <div class="embed">
          <iframe id="map" width="100%" height="100%" title="map" v-bind:src="embedURL"></iframe>
      </div>
  </div>
</template>

<script>
import getURLParameter from '../modules/geturlparams'

export default {
  props: {
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
    },
    embedURL() {
      return `${this.site.qolembedURL}embed.html?m=12&s=${this.selected.join(',')}&tocp=true`     
    }
  }
}
</script>
