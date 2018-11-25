<template>
  <div>
    <Grid :config=config :data=data :site=site />
    <Map :site=site />    
    <Category category="Character" :config=config :data=data :site=site />
    <Category category="Economy" :config=config :data=data :site=site />
    <Category category="Environment" :config=config :data=data :site=site />
    <Category category="Education" :config=config :data=data :site=site />
    <Category category="Engagement" :config=config :data=data :site=site />
    <Category category="Health" :config=config :data=data :site=site />
    <Category category="Housing" :config=config :data=data :site=site />
    <Category category="Safety" :config=config :data=data :site=site />
    <Category category="Transportation" :config=config :data=data :site=site />
  </div>
</template>

<script>
import Category from './category'
import EmbedMap from './map'
import Grid from './grid'
import data from '../assets/data.json'
import config from '../../data/config/data.json'
import site from '../../data/config/site.json'

export default {
  components: {
    Category: Category,
    Map: EmbedMap,
    Grid: Grid
  },
  data: function() {
    return {
      data: data,
      config: config,
      site: site
    };
  },
}
</script>
