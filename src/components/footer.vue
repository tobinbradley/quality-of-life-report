<template>
  <div class="printfooter"><span class="attribution">{{ site.title }}<span v-if="site.qoldashboardURL"> &bull; <a v-bind:href="site.qoldashboardURL" target="_blank">{{site.qoldashboardURL}}</a></span></span></div>
</template>

<script>
import getURLParameter from '../modules/geturlparams'

export default {
  props: {    
    site: {
      type: Object
    }
  }
}
</script>

